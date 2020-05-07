import { Plugin } from '@nuxt/types'
import { Store } from 'vuex'

class RpcCallError extends Error {
  public uri: string;

  public details: string | null;

  public exception: Error | null;

  constructor(uri: string, exception: Error | null, ...params: any) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RpcCallError)
    }

    // Custom debugging information
    this.uri = uri
    this.exception = exception
    this.details = null
  }
}

type OnOpenCallback = () => void;
type OnCloseCallback = (code: number, reason: string | null) => void;
type OnConnectCallback = () => void;
type SubscribeCallback = (content: string) => void;

interface WampSubscriptionInterface {
  topic: string;
  callback: SubscribeCallback;
}

interface WampRpCallInterface {
  id: string;
  resolve: any;
  reject: any;
}

interface WampClientInterface {
  open(): void;

  reconnect(): void;

  close(reason?: number, message?: string): void;

  subscribe(topic: string, handler: SubscribeCallback): Promise<any>;

  unsubscribe(topic: string): Promise<any>;

  isSubscribed(topic: string): boolean;

  publish(topic: string, event: string, exclude: Array<string> | null, eligible: Array<string> | null): Promise<any>;

  call(topic: string, ...data: any): Promise<any>;

  onOpenEvent(listener: OnOpenCallback): void;

  onCloseEvent(listener: OnCloseCallback): void;

  onConnectEvent(listener: OnConnectCallback): void;

  offOpenEvent(listener: OnOpenCallback): void;

  offCloseEvent(listener: OnCloseCallback): void;

  offConnectEvent(listener: OnConnectCallback): void;
}

class WampClient implements WampClientInterface {
  private readonly wsuri: string
  private readonly store: Store<any>

  private socket: WebSocket | null
  private sessionId = null

  private onOpenEvents: Array<OnOpenCallback>
  private onCloseEvents: Array<OnCloseCallback>
  private onConnectEvents: Array<OnConnectCallback>

  private subscriptions: Array<WampSubscriptionInterface>
  private rpcCalls: Array<WampRpCallInterface>

  private isConnected: boolean
  private isConnecting: boolean
  private showDebug: boolean
  private isLost: boolean

  constructor(host: string, store: Store<any>) {
    this.wsuri = host
    this.store = store

    this.socket = null
    this.sessionId = null

    this.onOpenEvents = []
    this.onCloseEvents = []
    this.onConnectEvents = []

    this.subscriptions = []
    this.rpcCalls = []

    this.isConnected = false
    this.isConnecting = false
    this.showDebug = false
    this.isLost = false
  }

  open(): void {
    if (this.isConnected) {
      return
    }

    try {
      // Open WS connection to server
      this.socket = new WebSocket(this.wsuri)
    } catch (e) {
      this.reconnect()

      return
    }

    // Connection established with WS server
    this.socket.addEventListener('open', () => {
      this.onOpenEvents
        .forEach((eventCallback): void => {
          eventCallback()
        })

      this.isConnecting = true

      if (this.store !== undefined) {
        this.store.dispatch('wamp/setConnecting', null, {
          root: true,
        })
      }
    })

    // Connection closed
    this.socket.addEventListener('close', (event) => {
      if (this.isConnected) {
        if (event.wasClean) {
          // Connection was closed cleanly (closing HS was performed)
          this.onCloseEvents
            .forEach((eventCallback): void => {
              eventCallback(0, `WS-${event.code}: ${event.reason}`)
            })
        } else {
          // Connection was closed uncleanly (lost without closing HS)
          this.onCloseEvents
            .forEach((eventCallback): void => {
              eventCallback(1, null)
            })
        }
      } else {
        // Connection could not be established in the first place
        this.onCloseEvents
          .forEach((eventCallback): void => {
            eventCallback(3, null)
          })
      }

      this.isConnected = false

      if (this.store !== undefined) {
        this.store.dispatch('wamp/resetStore', null, {
          root: true,
        })
      }
    })

    this.socket.addEventListener('message', (event) => {
      // Parse received message
      const message = JSON.parse(event.data)
      // On first position is message type definition
      const code = message.shift()

      switch (code) {
        // Welcome
        case 0:
          const version = message[1]
          const server = message[2]

          if (version !== 1) {
            throw new Error(`Server "${server}" uses incompatible protocol version ${version}`)
          }

          this.sessionId = message[0]

          this.log(`Connected! ${this.sessionId} : ${version} : ${server}`)

          this.onConnectEvents
            .forEach((eventCallback): void => {
              eventCallback()
            })

          if (this.isLost) {
            this.log('$wamp::opened re-established connection after lost')
          } else {
            this.log('$wamp::opened handling backlog')
          }

          this.isLost = false

          this.isConnecting = false
          this.isConnected = true

          if (this.store !== undefined) {
            this.store.dispatch('wamp/setConnected', null, {
              root: true,
            })
          }
          break

        // Call result
        case 3:
          this.rpcCallResult(message, code)
          break

        // Call error
        case 4:
          this.rpcCallResult(message, code)
          break

        // Event
        case 8:
          this.subscriptions
            .filter(({ topic }) => topic === message[0])
            .forEach((subscription): void => {
              subscription.callback(message[1])
            })
          break
      }
    })
  }

  reconnect(): void {
    this.close()
    this.isLost = true
    this.open()
  }

  close(reason?: number, message?: string): void {
    if (this.socket !== null) {
      this.socket.close(reason, message)

      this.socket = null
      this.isConnected = false

      if (this.store !== undefined) {
        this.store.dispatch('wamp/resetStore', null, {
          root: true,
        })
      }
    }
  }

  subscribe(topic: string, handler: SubscribeCallback): Promise<any> {
    this.log('$wamp.subscribe', topic)

    if (typeof this.subscriptions.find((subscription): boolean => subscription.topic === topic) === 'undefined') {
      this.subscriptions.push({
        topic,
        callback: handler,
      })

      // Subscribe event code is 5
      return this.send([5, topic])
    }

    return Promise.resolve(false)
  }

  unsubscribe(topic: string): Promise<any> {
    this.log('$wamp.unsubscribe', topic)

    const index = this.subscriptions.findIndex((subscription): boolean => subscription.topic === topic)

    if (index !== -1) {
      this.subscriptions.splice(index, 1)
    }

    // Unsubscribe event code is 6
    return this.send([6, topic])
  }

  isSubscribed(topic: string): boolean {
    return this.subscriptions.findIndex((subscription): boolean => subscription.topic === topic) !== -1
  }

  publish(topic: string, event: string, exclude: Array<string> | null, eligible: Array<string> | null): Promise<any> {
    this.log('$wamp.publish', topic, event, exclude, eligible)

    const slice = [].slice

    // Publish event code is 7
    return this.send([7].concat(slice.call(arguments)))
  }

  call(topic: string): Promise<any> {
    this.log('$wamp.call', topic)

    const slice = [].slice

    const args = slice.call(arguments, 1)

    const callId = Math.random().toString(36).substring(2)

    return new Promise((resolve, reject) => {
      this.send([2, callId, topic].concat(args))
        .then(() => {
          this.rpcCalls.push({
            id: callId,
            resolve,
            reject,
          })
        })
        .catch((e) => {
          reject(e)
        })
    })
  }

  onOpenEvent(listener: OnOpenCallback): void {
    this.onOpenEvents.push(listener)
  }

  onCloseEvent(listener: OnCloseCallback): void {
    this.onCloseEvents.push(listener)
  }

  onConnectEvent(listener: OnConnectCallback): void {
    this.onConnectEvents.push(listener)
  }

  offOpenEvent(listener: OnOpenCallback): void {
    for (let i = 0, len = this.onOpenEvents.length; i < len; i++) {
      if (this.onOpenEvents[i] === listener) {
        this.onOpenEvents.splice(i, 1)

        break
      }
    }
  }

  offCloseEvent(listener: OnCloseCallback): void {
    for (let i = 0, len = this.onCloseEvents.length; i < len; i++) {
      if (this.onCloseEvents[i] === listener) {
        this.onCloseEvents.splice(i, 1)

        break
      }
    }
  }

  offConnectEvent(listener: OnConnectCallback): void {
    for (let i = 0, len = this.onConnectEvents.length; i < len; i++) {
      if (this.onConnectEvents[i] === listener) {
        this.onConnectEvents.splice(i, 1)

        break
      }
    }
  }

  private rpcCallResult(message: Array<any>, code: number): void {
    const promise = this.rpcCalls.find(({ id }): boolean => id === message[0])

    if (typeof promise === 'undefined') {
      return
    }

    const index = this.rpcCalls.findIndex(({ id }): boolean => id === message[0])

    if (index !== -1) {
      this.rpcCalls.splice(index, 1)
    }

    if (code === 4) {
      const error = new RpcCallError(message[1], message[2])

      if (message.length === 4) {
        error.details = message[3]
      }

      promise.reject(error)
    } else {
      promise.resolve(message[1])
    }
  }

  private send(message: Array<any>): Promise<any> {
    if (this.isConnecting) {
      return Promise.resolve(new Error('connecting'))
    } else if (!this.isConnected && !this.isConnecting) {
      this.reconnect()
    }

    return new Promise((resolve, reject): void => {
      try {
        if (this.socket !== null) {
          this.socket.send(JSON.stringify(message))

          resolve(true)
        } else {
          reject(new Error('not.connected'))
        }
      } catch (e) {
        reject(new Error('send.error'))
      }
    })
  }

  private log(...args: any[]): void {
    if (this.showDebug) {
      // @ts-ignore
      console.debug.apply(console, args)
    }
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $wamp: WampClientInterface
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $wamp: WampClientInterface
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $wamp: WampClientInterface
  }
}

const wampClientPlugin: Plugin = ({ app, store }, inject): void => {
  let wsHost = `wss://${window.location.host}/ws-exchange`

  if (window.location.hostname === 'localhost') {
    wsHost = `ws://${window.location.host}/ws-exchange`
  }

  const wamp = new WampClient(wsHost, store)

  inject('wamp', wamp)
}

export default wampClientPlugin
