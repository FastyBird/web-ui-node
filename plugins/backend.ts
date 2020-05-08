import { Plugin } from '@nuxt/types'
import { Model } from '@vuex-orm/core'
import Jsona from 'jsona'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import get from 'lodash/get'
// @ts-ignore
import jwtDecode from 'jwt-decode'

import Session, { SessionInterface } from '~/models/accounts-node/Session'
import SecurityQuestion from '~/models/accounts-node/SecurityQuestion'
import Identity from '~/models/accounts-node/Identity'

import {
  ACCOUNTS_NODE_EMAIL,
  ACCOUNTS_NODE_SYSTEM_IDENTITY,
  ACCOUNTS_NODE_SECURITY_QUESTION,
  ACCOUNTS_NODE_SESSION,
} from '~/models/accounts-node/types'

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

interface BackendApiInterface {
  validateSession(payload: { uid: string }): Promise<any>

  validateIdentity(payload: { id: string, password: string }): Promise<any>

  validateEmail(payload: { address: string }): Promise<any>

  validateSecurityQuestion(payload: { id: string, answer: string }): Promise<any>

  requestPassword(payload: { uid: string }): Promise<any>

  fetchDeviceProperties(payload: { device: string }): Promise<any>;

  fetchChannelProperties(payload: { device: string, channel: string }): Promise<any>;
}

class BackendApi implements BackendApiInterface {
  private axios: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.axios = instance
  }

  validateSession(payload: { uid: string }): Promise<any> {
    const dataFormatter = new Jsona()

    return this.axios.post(
      '/accounts-node/v1/session/validate',
      dataFormatter.serialize({
        stuff: Object.assign({}, {
          type: ACCOUNTS_NODE_SESSION,
          uid: payload.uid,
        }),
      }),
    )
  }

  validateIdentity(payload: { id: string, password: string }): Promise<any> {
    const identity = Identity.find(payload.id)

    if (identity === null) {
      return new Promise((resolve, reject): void => {
        reject(new Error('accounts.identities.validate.failed'))
      })
    }

    const dataFormatter = new Jsona()

    return this.axios.post(
      `/accounts-node/v1/accounts/${identity.account_id}/identities/${identity.id}/validate`,
      dataFormatter.serialize({
        stuff: Object.assign({}, {
          id: identity.id,
          type: ACCOUNTS_NODE_SYSTEM_IDENTITY,
          password: {
            current: payload.password,
          },
        }),
      }),
    )
  }

  validateEmail(payload: { address: string }): Promise<any> {
    const dataFormatter = new Jsona()

    return this.axios.post(
      '/accounts-node/v1/validate-email',
      dataFormatter.serialize({
        stuff: Object.assign({}, {
          type: ACCOUNTS_NODE_EMAIL,
          address: payload.address,
        }),
      }),
    )
  }

  validateSecurityQuestion(payload: { id: string, answer: string }): Promise<any> {
    const securityQuestion = SecurityQuestion.find(payload.id)

    if (securityQuestion === null) {
      return new Promise((resolve, reject): void => {
        reject(new Error('accounts.security_question.validate.failed'))
      })
    }

    const dataFormatter = new Jsona()

    return this.axios.post(
      `/accounts-node/v1/accounts/${securityQuestion.account_id}/security-question/validate`,
      dataFormatter.serialize({
        stuff: Object.assign({}, {
          id: securityQuestion.id,
          type: ACCOUNTS_NODE_SECURITY_QUESTION,
          current_answer: payload.answer,
        }),
      }),
    )
  }

  requestPassword(payload: { uid: string }): Promise<any> {
    const dataFormatter = new Jsona()

    return this.axios.post(
      '/accounts-node/v1/password-reset',
      dataFormatter.serialize({
        stuff: Object.assign({}, {
          type: ACCOUNTS_NODE_SYSTEM_IDENTITY,
          uid: payload.uid,
        }),
      }),
    )
  }

  fetchDeviceProperties(payload: { device: string }): Promise<any> {
    const dataFormatter = new Jsona()

    return this.axios.get(`/storage-node/v1/devices/${payload.device}/properties`)
  }

  fetchChannelProperties(payload: { device: string, channel: string }): Promise<any> {
    const dataFormatter = new Jsona()

    return this.axios.get(`/storage-node/v1/devices/${payload.device}/channels/${payload.channel}/properties`)
  }
}

const backendApiPlugin: Plugin = ({ app }, inject): void => {
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

  const MAX_REQUESTS_COUNT = 1
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
    const tokenCookie = app.$cookies.get('token')

    if (tokenCookie !== null && typeof tokenCookie !== 'undefined' && tokenCookie !== '') {
      if (get(request, 'url', '').startsWith('/accounts-node/v1/session') && request.method === 'patch') {
        // eslint-disable-next-line no-param-reassign
        delete request.headers.Authorization
      } else {
        // eslint-disable-next-line no-param-reassign
        request.headers.Authorization = `Bearer ${tokenCookie}`
      }
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
      originalRequest.url !== '/accounts-node/v1/session' &&
      originalRequest.method !== 'patch' &&
      !get(originalRequest, '_retry', false)
    ) {
      // if the error is 401 and has sent already been retried
      originalRequest._retry = true // now it can be retried

      if (refreshAccessTokenCall === null) {
        refreshAccessTokenCall = Session.dispatch('refresh', {
          refresh_token: app.$cookies.get('refresh_token'),
        })
          .then((session: SessionInterface): Promise<any> => {
            // Reset call instance
            refreshAccessTokenCall = null

            originalRequest.headers.Authorization = `Bearer ${session.token}`

            const decodedAccessToken = jwtDecode(session.token)

            app.$cookies.set('token', session.token, {
              path: '/',
              maxAge: (((new Date(decodedAccessToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
            })

            const decodedRefreshToken = jwtDecode(session.refresh)

            app.$cookies.set('refresh_token', session.refresh, {
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

  Model.setAxios(instance)

  inject('backendApi', new BackendApi(instance))
}

export default backendApiPlugin
