import Vue from 'vue'
import axios from 'axios'

import { USER_PROFILE_SESSION } from './types'

import Vuex from '@/store'

import { API_ROOT, API_DEFAULT_THING_ROOT, API_KEY } from '@/config'

// Set basic headers
axios.interceptors.request.use((request) => {
  if (request.url.search(API_DEFAULT_THING_ROOT) === -1) {
    // eslint-disable-next-line
    request.headers['Content-Type'] = 'application/vnd.api+json'
    // eslint-disable-next-line
    request.headers['X-Api-Key'] = API_KEY

    const token = Vue.cookie.get('token')

    if (token !== null) {
      if (request.url === '/user-profile/session' && request.method === 'patch') {
        // Token refresh action
      } else {
        // eslint-disable-next-line
        request.headers['Authorization'] = `Bearer ${token}`
      }
    }
  }

  return request
})

// Add a response interceptor
axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (axios.isCancel(error)) {
    return Promise.reject(error)
  }

  if (error.config.url.search(API_DEFAULT_THING_ROOT) !== -1) {
    return Promise.reject(error)
  }

  const originalRequest = error.config

  const refreshToken = Vue.cookie.get('refresh_token')

  if (error.response.status === 401 && originalRequest.url !== `${API_ROOT}/user-profile/session` && originalRequest.method !== 'patch' && !originalRequest._retry && refreshToken !== null) { // if the error is 401 and has sent already been retried
    originalRequest._retry = true // now it can be retried

    Vue.cookie.delete('token')

    return axios.patch(`${API_ROOT}/user-profile/session`, {
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
      .then((res) => {
        if (res.data.data.hasOwnProperty('attributes') && res.data.data.attributes.hasOwnProperty('token')) {
          Vue.cookie.delete('token')
          Vue.cookie.set('token', res.data.data.attributes.token)

          originalRequest.headers['Authorization'] = `Bearer ${res.data.data.attributes.token}`
        }

        if (res.data.data.hasOwnProperty('attributes') && res.data.data.attributes.hasOwnProperty('refresh')) {
          Vue.cookie.delete('refresh_token')
          Vue.cookie.set('refresh_token', res.data.data.attributes.refresh)
        }

        return axios(originalRequest) // retry the request that errored out
      })
      .catch(refreshError => {
        if (refreshError.response.status === 401) {
          Vue.cookie.delete('token')
          Vue.cookie.delete('refresh_token')

          Vuex.dispatch('profileAccount/resetStore', null, {
            root: true,
          })
        }

        return Promise.reject(refreshError)
      })
  } else {
    return Promise.reject(error)
  }
})

export default {
  // THINGS
  getThings(options) {
    return axios.get(`${API_ROOT}/io-server/things?include=credentials,hardware,firmware,properties,stats,configuration`, options)
  },
  getThing(id, options) {
    return axios.get(`${API_ROOT}/io-server/things/${id}?include=credentials,hardware,firmware,properties,stats,configuration`, options)
  },
  createThing(data, options) {
    return axios.post(`${API_ROOT}/io-server/things?include=credentials,hardware,firmware,properties,stats,configuration`, data, options)
  },
  editThing(id, data, options) {
    return axios.patch(`${API_ROOT}/io-server/things/${id}?include=credentials,hardware,firmware,properties,stats,configuration`, data, options)
  },
  removeThing(id, options) {
    return axios.delete(`${API_ROOT}/io-server/things/${id}`, options)
  },

  // THING CHANNELS
  getThingChannels(thing, options) {
    return axios.get(`${API_ROOT}/io-server/things/${(typeof thing === 'string' ? thing : thing.id)}/channels?include=properties,schedules,configuration`, options)
  },
  getThingChannel(id, thing, options) {
    return axios.get(`${API_ROOT}/io-server/things/${(typeof thing === 'string' ? thing : thing.id)}/channels/${id}?include=properties,schedules,configuration`, options)
  },
  editThingChannel(id, thing, data, options) {
    return axios.patch(`${API_ROOT}/io-server/things/${(typeof thing === 'string' ? thing : thing.id)}/channels/${id}?include=properties,schedules,configuration`, data, options)
  },

  // TRIGGERS
  getTriggers(options) {
    return axios.get(`${API_ROOT}/triggers/triggers?include=conditions,actions,notifications`, options)
  },
  getTrigger(id, options) {
    return axios.get(`${API_ROOT}/triggers/triggers/${id}?include=conditions,actions,notifications`, options)
  },
  createTrigger(data, options) {
    return axios.post(`${API_ROOT}/triggers/triggers?include=conditions,actions,notifications`, data, options)
  },
  editTrigger(id, data, options) {
    return axios.patch(`${API_ROOT}/triggers/triggers/${id}?include=conditions,actions,notifications`, data, options)
  },
  removeTrigger(id, options) {
    return axios.delete(`${API_ROOT}/triggers/triggers/${id}`, options)
  },
  createTriggerRelation(trigger, relation, data, options) {
    return axios.post(`${API_ROOT}/triggers/triggers/${(typeof trigger === 'string' ? trigger : trigger.id)}/${relation}`, data, options)
  },
  removeTriggerRelation(trigger, relation, id, options) {
    return axios.delete(`${API_ROOT}/triggers/triggers/${(typeof trigger === 'string' ? trigger : trigger.id)}/${relation}/${id}`, options)
  },

  // PROFILE IDENTITY
  validateIdentityUid(data, options) {
    return axios.post(`${API_ROOT}/user-profile/identity/validate`, data, options)
  },

  // PROFILE SESSION
  getSession(options) {
    return axios.get(`${API_ROOT}/user-profile/session?include=account,account.profile,account.emails`, options)
  },
  refreshSession(data, options) {
    return axios.patch(`${API_ROOT}/user-profile/session`, data, options)
  },
  createSession(data, options) {
    return axios.post(`${API_ROOT}/user-profile/session?include=account,account.profile,account.emails`, data, options)
  },

  // PROFILE ACCOUNT
  getAccount(options) {
    return axios.get(`${API_ROOT}/user-profile/session/account?include=profile,emails,security-question`, options)
  },
  editAccount(data, options) {
    return axios.patch(`${API_ROOT}/user-profile/session/account?include=profile,emails,security-question`, data, options)
  },

  // PROFILE PROFILE
  getProfile(options) {
    return axios.get(`${API_ROOT}/user-profile/session/account/profile`, options)
  },
  editProfile(data, options) {
    return axios.patch(`${API_ROOT}/user-profile/session/account/profile`, data, options)
  },

  // PROFILE EMAILS
  getEmails(options) {
    return axios.get(`${API_ROOT}/user-profile/session/account/emails`, options)
  },
  getEmail(id, options) {
    return axios.get(`${API_ROOT}/user-profile/session/account/emails/${id}`, options)
  },
  createEmail(data, options) {
    return axios.post(`${API_ROOT}/user-profile/session/account/emails`, data, options)
  },
  editEmail(id, data, options) {
    return axios.patch(`${API_ROOT}/user-profile/session/account/emails/${id}`, data, options)
  },
  validateEmail(data, options) {
    return axios.post(`${API_ROOT}/user-profile/session/account/emails/validate`, data, options)
  },

  requestPassword(data, options) {
    return axios.post(`${API_ROOT}/user-profile/identity/password`, data, options)
  },
  requestUsername(data, options) {
    return axios.post(`${API_ROOT}/user-profile/identity/uid`, data, options)
  },

  editPassword(data, options) {
    return axios.patch(`${API_ROOT}/user-profile/session/account/security/password`, data, options)
  },
  validatePassword(data, options) {
    return axios.post(`${API_ROOT}/user-profile/session/account/security/password/validate`, data, options)
  },

  createSecurityQuestion(data, options) {
    return axios.post(`${API_ROOT}/user-profile/session/account/security-question`, data, options)
  },
  editSecurityQuestion(data, options) {
    return axios.patch(`${API_ROOT}/user-profile/session/account/security-question`, data, options)
  },
  validateSecurityQuestion(data, options) {
    return axios.post(`${API_ROOT}/user-profile/session/account/security-question/validate`, data, options)
  },
}
