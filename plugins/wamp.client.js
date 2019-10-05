import Vue from 'vue'

// Store mutation constant
export const WAMP_WS_STATE = 'WAMP_WS_STATE'
export const WAMP_RESET_STATE = 'WAMP_RESET_STATE'

function WampV1(host, options) {
  this.wsuri = host
  this.options = options

  this.socket = null
  this.sessionId = null

  this.eventsListeners = {}
  this.subscriptions = []
  this.rpcCalls = []

  this.isConnected = false
  this.isConnecting = false
  this.showDebug = false
  this.isLost = false
}

WampV1.prototype.open = function() {
  if (!this.isConnected) {
    // Open WS connection to server
    this.socket = new WebSocket(this.wsuri)

    // Connection established with WS server
    this.socket.addEventListener('open', () => {
      if (this.eventsListeners.hasOwnProperty('onopen') && this.eventsListeners.onopen instanceof Array) {
        for (let i = 0, len = this.eventsListeners.onopen.length; i < len; i++) {
          this.eventsListeners.onopen[i].call()
        }
      }

      this.isConnecting = true

      if (this.store !== undefined) {
        this.store.dispatch('wamp/setConnecting', null, {
          root: true,
        })
      }
    })

    // Connection closed
    this.socket.addEventListener('close', (event) => {
      let callbacks = []

      if (this.eventsListeners.hasOwnProperty('onclose') && this.eventsListeners.onclose instanceof Array) {
        callbacks = this.eventsListeners.onclose
      }

      if (this.isConnected) {
        if (event.wasClean) {
          // Connection was closed cleanly (closing HS was performed)
          for (let i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].call(0, `WS-${event.code}: ${event.reason}`)
          }
        } else {
          // Connection was closed uncleanly (lost without closing HS)
          for (let i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].call(1)
          }
        }
      } else {
        // Connection could not be established in the first place
        for (let i = 0, len = callbacks.length; i < len; i++) {
          callbacks[i].call(3)
        }
      }

      this.isConnected = false

      if (this.store !== undefined) {
        this.store.dispatch('wamp/setDisconnected', null, {
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

          if (this.eventsListeners.hasOwnProperty('onconnect') && this.eventsListeners.onconnect instanceof Array) {
            for (let i = 0, len = this.eventsListeners.onconnect.length; i < len; i++) {
              this.eventsListeners.onconnect[i].call()
            }
          }

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
        // Call error
        case 4:
          const callId = message[0]
          const promise = this.rpcCalls[callId]

          delete this.rpcCalls[callId]

          if (code === 4) {
            const error = new Error(message[2])
            error.uri = message[1]

            if (message.length === 4) {
              error.details = message[3]
            }

            promise.reject(error)
          } else {
            promise.resolve(message[1])
          }
          break

        // Event
        case 8:
          if (this.subscriptions.hasOwnProperty(message[0])) {
            this.subscriptions[message[0]](message[1])
          }
          break
      }
    })
  }
}

WampV1.prototype.reconnect = function() {
  this.close()
  this.isLost = true
  this.open()
}

WampV1.prototype.close = function(reason, message) {
  if (this.socket !== null) {
    this.socket.close(reason, message)

    this.socket = null
    this.isConnected = false

    if (this.store !== undefined) {
      this.store.dispatch('wamp/setDisconnected', null, {
        root: true,
      })
    }
  }
}

WampV1.prototype._send = function(message) {
  const that = this

  if (this.isConnecting) {
    return Promise.resolve(new Error('connecting'))
  } else if (!this.isConnected && !this.isConnecting) {
    this.reconnect()
  }

  return new Promise(function(resolve, reject) {
    try {
      if (that.socket !== null) {
        that.socket.send(JSON.stringify(message))

        resolve(true)
      } else {
        reject(new Error('not.connected'))
      }
    } catch (e) {
      reject(new Error('send.error'))
    }
  })
}

WampV1.prototype.subscribe = function(topic, handler) {
  this.log('$wamp.subscribe', topic)

  if (typeof this.subscriptions[topic] === 'undefined') {
    this.subscriptions[topic] = handler

    // Subscribe event code is 5
    return this._send([5, topic])
  }

  return Promise.resolve(false)
}

WampV1.prototype.unsubscribe = function(topic) {
  this.log('$wamp.unsubscribe', topic)

  delete this.subscriptions[topic]

  // Unsubscribe event code is 6
  return this._send([6, topic])
}

WampV1.prototype.isSubscribed = function(topic) {
  return typeof this.subscriptions[topic] !== 'undefined'
}

WampV1.prototype.publish = function(topic, event, exclude, eligible) {
  this.log('$wamp.publish', topic, event, exclude, eligible)

  const slice = [].slice

  // Publish event code is 7
  return this._send([7].concat(slice.call(arguments)))
}

WampV1.prototype.call = function(topic) {
  const that = this

  this.log('$wamp.call', topic)

  const slice = [].slice

  const args = slice.call(arguments, 1)

  const callId = Math.random().toString(36).substring(2)

  return new Promise(function(resolve, reject) {
    that._send([2, callId, topic].concat(args))
      .then(() => {
        that.rpcCalls[callId] = {
          resolve,
          reject,
        }
      })
      .catch(e => {
        reject(e)
      })
  })
}

WampV1.prototype.on = function(type, listener) {
  if (typeof this.eventsListeners[`on${type}`] === 'undefined') {
    this.eventsListeners[`on${type}`] = []
  }

  this.eventsListeners[`on${type}`].push(listener)
}

WampV1.prototype.off = function(type, listener) {
  if (this.eventsListeners[`on${type}`] instanceof Array) {
    const listeners = this.eventsListeners[`on${type}`]

    for (let i = 0, len = listeners.length; i < len; i++) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1)

        break
      }
    }
  }
}

WampV1.prototype.log = function() {
  if (this.showDebug) {
    console.debug.apply(console, arguments)
  }
}

const wamp = new WampV1(process.env.NUXT_ENV_WS_SERVER, {
  debug: true,
  store: undefined,
})

Vue.prototype.$wamp = wamp
Vue.wamp = wamp

export default ({ store }) => {
  wamp.store = store
}
