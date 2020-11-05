import { Plugin } from '@nuxt/types'
import { Store } from 'vuex'
import Jsona from 'jsona'
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import get from 'lodash/get'
// @ts-ignore
import jwtDecode from 'jwt-decode'

import { SemaphoreType } from '~/store/session'

import Account from '~/models/auth-node/accounts/Account'
import { AccountEntityTypeType } from '~/models/auth-node/accounts/types'
import { EmailEntityTypeType } from '~/models/auth-node/emails/types'
import { IdentityEntityTypeType } from '~/models/auth-node/identities/types'

declare module 'vue/types/vue' {
  interface Vue {
    $backendApi: BackendApiInterface
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $backendApi: BackendApiInterface
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $backendApi: BackendApiInterface
  }
}

interface SessionAttributesInterface {
  expiration: string,
  refresh: string,
  token: string,
  token_type: string,
}

interface SessionAccountRelationshipDataInterface {
  id: string,
  type: AccountEntityTypeType,
}

interface SessionAccountRelationshipInterface {
  data: SessionAccountRelationshipDataInterface,
}

interface SessionRelationshipsInterface {
  account: SessionAccountRelationshipInterface,
}

interface SessionDataInterface {
  id: string,
  type: string,
  attributes: SessionAttributesInterface,
  relationships: SessionRelationshipsInterface,
}

interface SessionResponseInterface {
  data: SessionDataInterface,
}

interface SessionCreatePayloadInterface {
  uid: string,
  password: string,
}

interface SessionRefreshPayloadInterface {
  refreshToken: string,
}

interface BackendApiInterface {
  getAxios(): AxiosInstance

  fetchSession(): Promise<any>

  createSession(payload: SessionCreatePayloadInterface): Promise<any>

  refreshSession(payload: SessionRefreshPayloadInterface): Promise<any>

  validateEmail(payload: { address: string }): Promise<any>

  requestPassword(payload: { uid: string }): Promise<any>
}

class BackendApi implements BackendApiInterface {
  private readonly axios: AxiosInstance
  private readonly store: Store<any>

  constructor(instance: AxiosInstance, store: Store<any>) {
    this.axios = instance
    this.store = store
  }

  getAxios(): AxiosInstance {
    return this.axios
  }

  fetchSession(): Promise<any> {
    this.store.dispatch('session/setSemaphore', {
      type: SemaphoreType.FETCHING,
    }, {
      root: true,
    })

    return new Promise((resolve: (value: { accessToken: string, refreshToken: string }) => void, reject): void => {
      this.axios.get(
        '/auth-node/v1/session',
      )
        .then((response: AxiosResponse<SessionResponseInterface>): void => {
          this.store.dispatch('session/set', {
            accessToken: response.data.data.attributes.token,
            refreshToken: response.data.data.attributes.refresh,
            tokenExpiration: response.data.data.attributes.expiration,
            tokenType: response.data.data.attributes.token_type,
            accountId: response.data.data.relationships.account.data.id,
          }, {
            root: true,
          })

          Account.dispatch('get', {
            id: response.data.data.relationships.account.data.id,
          })
            .then(() => {
              resolve({
                accessToken: response.data.data.attributes.token,
                refreshToken: response.data.data.attributes.refresh,
              })
            })
            .catch((e) => {
              reject(e)
            })
        })
        .catch((e: Error): void => {
          reject(e)
        })
        .finally(() => {
          this.store.dispatch('session/clearSemaphore', {
            type: SemaphoreType.FETCHING,
          }, {
            root: true,
          })
        })
    })
  }

  createSession(payload: SessionCreatePayloadInterface): Promise<any> {
    const dataFormatter = new Jsona()

    this.store.dispatch('session/setSemaphore', {
      type: SemaphoreType.CREATING,
    }, {
      root: true,
    })

    return new Promise((resolve: (value: { accessToken: string, refreshToken: string }) => void, reject): void => {
      this.axios.post(
        '/auth-node/v1/session',
        dataFormatter.serialize({
          stuff: Object.assign({}, {
            type: AccountEntityTypeType.USER,

            uid: payload.uid,
            password: payload.password,
          }),
        }),
      )
        .then((response: AxiosResponse<SessionResponseInterface>): void => {
          this.store.dispatch('session/set', {
            accessToken: response.data.data.attributes.token,
            refreshToken: response.data.data.attributes.refresh,
            tokenExpiration: response.data.data.attributes.expiration,
            tokenType: response.data.data.attributes.token_type,
            accountId: response.data.data.relationships.account.data.id,
          }, {
            root: true,
          })

          Account.dispatch('get', {
            id: response.data.data.relationships.account.data.id,
          })
            .then(() => {
              resolve({
                accessToken: response.data.data.attributes.token,
                refreshToken: response.data.data.attributes.refresh,
              })
            })
            .catch((e) => {
              reject(e)
            })
        })
        .catch((e: Error): void => {
          reject(e)
        })
        .finally(() => {
          this.store.dispatch('session/clearSemaphore', {
            type: SemaphoreType.CREATING,
          }, {
            root: true,
          })
        })
    })
  }

  refreshSession(payload: SessionRefreshPayloadInterface): Promise<any> {
    const dataFormatter = new Jsona()

    this.store.dispatch('session/setSemaphore', {
      type: SemaphoreType.UPDATING,
    }, {
      root: true,
    })

    return new Promise((resolve: (value: { accessToken: string, refreshToken: string }) => void, reject): void => {
      this.axios.patch(
        '/auth-node/v1/session',
        dataFormatter.serialize({
          stuff: Object.assign({}, {
            type: AccountEntityTypeType.USER,

            refresh: payload.refreshToken,
          }),
        }),
      )
        .then((response: AxiosResponse<SessionResponseInterface>): void => {
          this.store.dispatch('session/set', {
            accessToken: response.data.data.attributes.token,
            refreshToken: response.data.data.attributes.refresh,
            tokenExpiration: response.data.data.attributes.expiration,
            tokenType: response.data.data.attributes.token_type,
            accountId: response.data.data.relationships.account.data.id,
          }, {
            root: true,
          })

          Account.dispatch('get', {
            id: response.data.data.relationships.account.data.id,
          })
            .then(() => {
              resolve({
                accessToken: response.data.data.attributes.token,
                refreshToken: response.data.data.attributes.refresh,
              })
            })
            .catch((e) => {
              reject(e)
            })
        })
        .catch((e: Error): void => {
          reject(e)
        })
        .finally(() => {
          this.store.dispatch('session/clearSemaphore', {
            type: SemaphoreType.UPDATING,
          }, {
            root: true,
          })
        })
    })
  }

  validateEmail(payload: { address: string }): Promise<any> {
    const dataFormatter = new Jsona()

    return this.axios.post(
      '/auth-node/v1/validate-email',
      dataFormatter.serialize({
        stuff: Object.assign({}, {
          type: EmailEntityTypeType.EMAIL,
          address: payload.address,
        }),
      }),
    )
  }

  requestPassword(payload: { uid: string }): Promise<any> {
    const dataFormatter = new Jsona()

    return this.axios.post(
      '/auth-node/v1/password-reset',
      dataFormatter.serialize({
        stuff: Object.assign({}, {
          type: IdentityEntityTypeType.USER,
          uid: payload.uid,
        }),
      }),
    )
  }
}

const backendApiPlugin: Plugin = ({ app, store }, inject): void => {
  const baseUrl = Object.prototype.hasOwnProperty.call(app.context, 'ssrContext') ? process.env.NUXT_ENV_API_TARGET : '/api'

  const headers = {
    'Content-Type': 'application/vnd.api+json',
  }

  if (Object.prototype.hasOwnProperty.call(app.context, 'ssrContext')) {
    Object.assign(headers, { 'X-Api-Key': process.env.NUXT_ENV_API_KEY })
  }

  const instance = axios.create({
    baseURL: baseUrl,
    headers,
  })

  let refreshAccessTokenCall: Promise<any> | null = null

  let pendingRequests = 0

  const MAX_REQUESTS_COUNT = 10
  const MAX_REQUESTS_COUNT_DELAY = 10

  instance.interceptors.request.use((request: AxiosRequestConfig): Promise<any> => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (pendingRequests < MAX_REQUESTS_COUNT) {
          pendingRequests++

          clearInterval(interval)

          resolve(request)
        }
      }, MAX_REQUESTS_COUNT_DELAY)
    })
  })

  // Set basic headers
  instance.interceptors.request.use((request: AxiosRequestConfig): AxiosRequestConfig => {
    const accessToken = store.getters['session/getAccessToken']()

    if (get(request, 'url', '').startsWith('/auth-node/v1/session') && request.method === 'patch') {
      // eslint-disable-next-line no-param-reassign
      delete request.headers.Authorization
    } else if (accessToken !== null) {
      // eslint-disable-next-line no-param-reassign
      request.headers.Authorization = `Bearer ${accessToken}`
    }

    return request
  })

  // Add a response interceptor
  instance.interceptors.response.use((response: AxiosResponse): AxiosResponse => {
    pendingRequests = Math.max(0, pendingRequests - 1)

    return response
  }, (error): Promise<any> => {
    const originalRequest = error.config

    // Concurrent request check only for client side
    if (process.client) {
      pendingRequests = Math.max(0, pendingRequests - 1)
    }

    if (
      parseInt(get(error, 'response.status', 200), 10) === 401 &&
      originalRequest.url !== '/auth-node/v1/session' &&
      originalRequest.method !== 'patch' &&
      !get(originalRequest, '_retry', false)
    ) {
      // if the error is 401 and has sent already been retried
      originalRequest._retry = true // now it can be retried

      if (refreshAccessTokenCall === null) {
        const dataFormatter = new Jsona()

        refreshAccessTokenCall = instance.patch(
          '/auth-node/v1/session',
          dataFormatter.serialize({
            stuff: Object.assign({}, {
              type: AccountEntityTypeType.USER,

              refresh: store.getters['session/getRefreshToken'](),
            }),
          }),
        )
          .then((response: AxiosResponse<SessionResponseInterface>): Promise<any> => {
            store.dispatch('session/set', {
              accessToken: response.data.data.attributes.token,
              refreshToken: response.data.data.attributes.refresh,
              tokenExpiration: response.data.data.attributes.expiration,
              tokenType: response.data.data.attributes.token_type,
              accountId: response.data.data.relationships.account.data.id,
            }, {
              root: true,
            })

            // Reset call instance
            refreshAccessTokenCall = null

            originalRequest.headers.Authorization = `Bearer ${response.data.data.attributes.token}`

            const decodedAccessToken = jwtDecode(response.data.data.attributes.token)

            app.$cookies.set('token', response.data.data.attributes.token, {
              path: '/',
              maxAge: (((new Date(decodedAccessToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
            })

            const decodedRefreshToken = jwtDecode(response.data.data.attributes.refresh)

            app.$cookies.set('refresh_token', response.data.data.attributes.refresh, {
              path: '/',
              maxAge: (((new Date(decodedRefreshToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
            })

            return axios(originalRequest) // retry the request that errored out
          })
          .catch((): Promise<any> => {
            // Reset call instance
            refreshAccessTokenCall = null

            delete originalRequest.headers.Authorization

            return axios(originalRequest) // retry the request that errored out
          })
      }

      return refreshAccessTokenCall
    } else {
      return Promise.reject(error)
    }
  })

  inject('backendApi', new BackendApi(instance, store))
}

export default backendApiPlugin
