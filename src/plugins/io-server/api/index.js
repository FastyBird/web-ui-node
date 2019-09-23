import Vue from 'vue'
import axios from 'axios'
import get from 'lodash/get'

import {
  USER_PROFILE_SESSION,
} from './types'

import Vuex from '@/store'

const instance = axios.create({
  baseURL: '/v1',
  headers: {
    'Content-Type': 'application/vnd.api+json',
  },
})

let accessTokenCallbacks = null
let refreshTokenCallbacks = null

let refreshAccessTokenCall = null

function refreshAccessToken() {
  if (refreshAccessTokenCall !== null) {
    return refreshAccessTokenCall
  }

  const refreshToken = refreshTokenCallbacks.read()

  refreshAccessTokenCall = instance.patch('/user-profile/session', {
    data: {
      type: USER_PROFILE_SESSION,
      attributes: {
        refresh: refreshToken,
      },
    },
  }, {
    headers: {
      'Authorization': null,
    },
  })
    .then(res => {
      if (get(res, 'data.data.attributes.token', null) !== null) {
        accessTokenCallbacks.clear()
        accessTokenCallbacks.write(get(res, 'data.data.attributes.token', null))
      }

      if (get(res, 'data.data.attributes.refresh', null) !== null) {
        refreshTokenCallbacks.clear()
        refreshTokenCallbacks.write(get(res, 'data.data.attributes.refresh', null))
      }

      refreshAccessTokenCall = null

      return Promise.resolve()
    })
    .catch(e => {
      if (e.response.status === 401) {
        accessTokenCallbacks.clear()
        refreshTokenCallbacks.clear()

        Vuex.dispatch('profileAccount/resetStore', null, {
          root: true,
        })
      }

      return Promise.reject(e)
    })

  return refreshAccessTokenCall
}

// Set basic headers
instance.interceptors.request.use((request) => {
  const token = accessTokenCallbacks.read()

  if (token !== null) {
    if (request.url === '/user-profile/session' && request.method === 'patch') {
      // Token refresh action
    } else {
      // eslint-disable-next-line
      request.headers['Authorization'] = `Bearer ${token}`
    }
  }

  return request
})

// Add a response interceptor
instance.interceptors.response.use((response) => {
  return response
}, (error) => {
  const originalRequest = error.config

  const refreshToken = refreshTokenCallbacks.read()

  if (
    error.response.status === 401
    && originalRequest.url !== '/user-profile/session'
    && originalRequest.method !== 'patch'
    && !originalRequest._retry
    && refreshToken !== null
  ) {
    // if the error is 401 and has sent already been retried
    originalRequest._retry = true // now it can be retried

    accessTokenCallbacks.clear()

    return refreshAccessToken()
      .then(() => {
        originalRequest.headers['Authorization'] = `Bearer ${accessTokenCallbacks.read()}`

        return axios(originalRequest) // retry the request that errored out
      })
      .catch(() => {
        delete originalRequest.headers['Access-Token']

        return axios(originalRequest) // retry the request that errored out
      })
  } else {
    return Promise.reject(error)
  }
})

instance.interceptors.request.use((request) => {
  if (Vue.hasOwnProperty('nprogress')) {
    Vue.nprogress.initProgress()
  }

  return request
}, (error) => {
  return Promise.reject(error)
})

instance.interceptors.response.use((response) => {
  if (Vue.hasOwnProperty('nprogress')) {
    Vue.nprogress.increase()
  }

  return response
}, (error) => {
  if (Vue.hasOwnProperty('nprogress')) {
    Vue.nprogress.increase()
  }

  return Promise.reject(error)
})

export default {

  // API CONFIGURE
  setBaseURL(value) {
    instance.defaults.baseURL = value
  },
  setApiKey(value) {
    instance.defaults.headers.common['X-Api-Key'] = value
  },
  setAccessToken(callbacks) {
    accessTokenCallbacks = callbacks
  },
  setRefreshToken(callbacks) {
    refreshTokenCallbacks = callbacks
  },

  // THINGS
  getThings(options) {
    return instance.get('/io-server/things?include=credentials,hardware,firmware,properties,stats,configuration', options)
  },
  getThing(id, options) {
    return instance.get(`/io-server/things/${id}?include=credentials,hardware,firmware,properties,stats,configuration`, options)
  },
  createThing(data, options) {
    return instance.post('/io-server/things?include=credentials,hardware,firmware,properties,stats,configuration', data, options)
  },
  editThing(id, data, options) {
    return instance.patch(`/io-server/things/${id}?include=credentials,hardware,firmware,properties,stats,configuration`, data, options)
  },
  removeThing(id, options) {
    return instance.delete(`/io-server/things/${id}`, options)
  },

  // THING CHANNELS
  getThingChannels(thing, options) {
    return instance.get(`/io-server/things/${(typeof thing === 'string' ? thing : thing.id)}/channels?include=properties,schedules,configuration`, options)
  },
  getThingChannel(id, thing, options) {
    return instance.get(`/io-server/things/${(typeof thing === 'string' ? thing : thing.id)}/channels/${id}?include=properties,schedules,configuration`, options)
  },
  editThingChannel(id, thing, data, options) {
    return instance.patch(`/io-server/things/${(typeof thing === 'string' ? thing : thing.id)}/channels/${id}?include=properties,schedules,configuration`, data, options)
  },

  // TRIGGERS
  getTriggers(options) {
    return instance.get('/triggers/triggers?include=conditions,actions,notifications', options)
  },
  getTrigger(id, options) {
    return instance.get(`/triggers/triggers/${id}?include=conditions,actions,notifications`, options)
  },
  createTrigger(data, options) {
    return instance.post('/triggers/triggers?include=conditions,actions,notifications', data, options)
  },
  editTrigger(id, data, options) {
    return instance.patch(`/triggers/triggers/${id}?include=conditions,actions,notifications`, data, options)
  },
  removeTrigger(id, options) {
    return instance.delete(`/triggers/triggers/${id}`, options)
  },
  createTriggerRelation(trigger, relation, data, options) {
    return instance.post(`/triggers/triggers/${(typeof trigger === 'string' ? trigger : trigger.id)}/${relation}`, data, options)
  },
  removeTriggerRelation(trigger, relation, id, options) {
    return instance.delete(`/triggers/triggers/${(typeof trigger === 'string' ? trigger : trigger.id)}/${relation}/${id}`, options)
  },

  // PROFILE IDENTITY
  validateIdentityUid(data) {
    return instance.post('/user-profile/identity/validate', data)
  },

  // PROFILE SESSION
  getSession(options) {
    return instance.get('/user-profile/session?include=account,account.profile,account.emails', options)
  },
  refreshSession(data, options) {
    return instance.patch('/user-profile/session', data, options)
  },
  createSession(data) {
    return instance.post('/user-profile/session?include=account,account.profile,account.emails', data)
  },

  // PROFILE ACCOUNT
  getAccount(options) {
    return instance.get('/user-profile/session/account?include=profile,emails,security-question', options)
  },
  editAccount(data, options) {
    return instance.patch('/user-profile/session/account?include=profile,emails,security-question', data, options)
  },

  // PROFILE PROFILE
  getProfile(options) {
    return instance.get('/user-profile/session/account/profile', options)
  },
  editProfile(data, options) {
    return instance.patch('/user-profile/session/account/profile', data, options)
  },

  // PROFILE EMAILS
  getEmails(options) {
    return instance.get('/user-profile/session/account/emails', options)
  },
  getEmail(id, options) {
    return instance.get(`/user-profile/session/account/emails/${id}`, options)
  },
  createEmail(data, options) {
    return instance.post('/user-profile/session/account/emails', data, options)
  },
  editEmail(id, data, options) {
    return instance.patch(`/user-profile/session/account/emails/${id}`, data, options)
  },
  validateEmail(data) {
    return instance.post('/user-profile/session/account/emails/validate', data)
  },

  requestPassword(data) {
    return instance.post('/user-profile/identity/password', data)
  },
  requestUsername(data, options) {
    return instance.post('/user-profile/identity/uid', data, options)
  },

  editPassword(data, options) {
    return instance.patch('/user-profile/session/account/security/password', data, options)
  },
  validatePassword(data, options) {
    return instance.post('/user-profile/session/account/security/password/validate', data, options)
  },

  createSecurityQuestion(data, options) {
    return instance.post('/user-profile/session/account/security-question', data, options)
  },
  editSecurityQuestion(data, options) {
    return instance.patch('/user-profile/session/account/security-question', data, options)
  },
  validateSecurityQuestion(data, options) {
    return instance.post('/user-profile/session/account/security-question/validate', data, options)
  },
}
