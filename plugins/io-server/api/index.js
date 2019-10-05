// JSON:API formatter
import Jsona from 'jsona'
import axios from 'axios'

import {
  USER_PROFILE_SESSION,
} from './types'

import { ApiError } from './errors'

import Session from './../store/modules/profile/Session'

const instance = axios.create({
  baseURL: '/v1',
  headers: {
    'Content-Type': 'application/vnd.api+json',
  },
})

const dataFormatter = new Jsona()

let sessionKey = null

let refreshAccessTokenCall = null

function refreshAccessToken() {
  if (refreshAccessTokenCall !== null) {
    return refreshAccessTokenCall
  }

  const session = Session.find(sessionKey)

  refreshAccessTokenCall = instance.patch('/user-profile/session', {
    data: {
      type: USER_PROFILE_SESSION,
      attributes: {
        refresh: session.refresh,
      },
    },
  }, {
    headers: {
      'Authorization': null,
    },
  })
    .then(res => {
      const data = dataFormatter.deserialize(res.data)

      refreshAccessTokenCall = null

      data.id = sessionKey

      if (data.hasOwnProperty('account')) {
        const account = data.account

        let profile = null

        if (account.hasOwnProperty('profile')) {
          profile = account.profile

          profile.account_id = account.id
          profile.account = {
            id: account.id,
            type: account.type,
          }
        }

        let securityQuestion = null

        if (account.hasOwnProperty('security-question') && account['security-question'] !== null) {
          securityQuestion = account['security-question']

          securityQuestion.account_id = account.id
          securityQuestion.account = {
            id: account.id,
            type: account.type,
          }
        }

        const emails = []

        if (account.hasOwnProperty('emails')) {
          account.emails
            .forEach(email => {
              emails.push(Object.assign(email, {
                account_id: account.id,
                account: {
                  id: account.id,
                  type: account.type,
                },
              }))
            })
        }

        account.profile = profile
        account.security_question = securityQuestion
        account.emails = emails

        data.account = account
      }

      Session.update({
        data,
      })
        .then(() => {
          // Session re-creation was successful
          return Promise.resolve()
        })
        .catch(e => {
          // Destroy session
          Session.deleteAll()

          return Promise.reject(e)
        })
    })
    .catch(e => {
      if (e.response.status === 401) {
        // Destroy session
        Session.deleteAll()
      }

      return Promise.reject(e)
    })

  return refreshAccessTokenCall
}

// Set basic headers
instance.interceptors.request.use((request) => {
  if (sessionKey === null) {
    throw new ApiError('Session key is missing.')
  }

  const session = Session.find(sessionKey)

  if (session !== null) {
    if (request.url === '/user-profile/session' && request.method === 'patch') {
      // Token refresh action
    } else {
      // eslint-disable-next-line
      request.headers['Authorization'] = `Bearer ${session.token}`
    }
  }

  return request
})

// Add a response interceptor
instance.interceptors.response.use((response) => {
  return response
}, (error) => {
  const originalRequest = error.config

  if (
    error.response.status === 401
    && originalRequest.url !== '/user-profile/session'
    && originalRequest.method !== 'patch'
    && !originalRequest._retry
    && Session.find(sessionKey) !== null
  ) {
    // if the error is 401 and has sent already been retried
    originalRequest._retry = true // now it can be retried

    return refreshAccessToken()
      .then(() => {
        const session = Session.find(sessionKey)

        originalRequest.headers['Authorization'] = `Bearer ${session.token}`

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

export default {

  // API CONFIGURE
  setBaseURL(value) {
    instance.defaults.baseURL = value
  },
  setApiKey(value) {
    instance.defaults.headers.common['X-Api-Key'] = value
  },
  setSessionKey(key) {
    sessionKey = key
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
