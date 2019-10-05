// JSON:API formatter
import Jsona from 'jsona'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'

import api from './../../../api'
import {
  USER_PROFILE_IDENTITY,
  USER_PROFILE_SESSION,
} from './../../../api/types'
import { ApiError } from './../../../api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,
  IO_SERVER_RESET_STATE,
} from './../../types'

import Session from './Session'

const dataFormatter = new Jsona()

const initialState = {

  semaphore: {
    fetching: false,
    refreshing: false,
  },

}

function mapSessionResponse(id, session) {
  const mapped = cloneDeep(session)
  mapped.id = id

  if (session.hasOwnProperty('account')) {
    const account = session.account
    account.session_id = id
    account.session = {
      id,
      type: session.type,
    }

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

    mapped.account = account
  }

  return mapped
}

export default {

  state: () => (initialState),

  actions: {

    fetch({ state, getters, commit }, { id, token, refresh }) {
      if (state.semaphore.fetching) {
        return Promise.reject(new Error('profile.session.fetch.inProgress'))
      }

      const session = getters.find(id)

      if (session !== null) {
        return Promise.resolve({
          token: get(session, 'token'),
          refresh: get(session, 'refresh'),
        })
      }

      return new Promise((resolve, reject) => {
        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'detail',
        })

        Session.insert({
          data: {
            id,
            token,
            refresh,
          },
        })
          .catch(e => {
            reject(new ApiError(
              'profile.session.fetch.failed',
              e,
              'Fetch session failed.',
            ))
          })

        api.getSession()
          .then(result => {
            const data = dataFormatter.deserialize(result.data)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'detail',
            })

            Session.insertOrUpdate({
              data: mapSessionResponse(id, data),
            })
              .then(() => {
                // Session creation was successful
                resolve({
                  token: get(data, 'token'),
                  refresh: get(data, 'refresh'),
                })
              })
              .catch(e => {
                reject(new ApiError(
                  'profile.session.fetch.failed',
                  e,
                  'Fetch session failed.',
                ))
              })
          })
          .catch(e => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'detail',
            })

            reject(new ApiError(
              'profile.session.fetch.failed',
              e,
              'Fetch session data failed.',
            ))
          })
      })
    },

    create({ }, { id, uid, password }) {
      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, {
          uid,
          password,
        })

        formattedData.type = USER_PROFILE_SESSION

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        api.createSession(jsonData)
          .then(result => {
            const data = dataFormatter.deserialize(result.data)

            Session.insert({
              data: mapSessionResponse(id, data),
            })
              .then(() => {
                // Session creation was successful
                resolve({
                  token: get(data, 'token'),
                  refresh: get(data, 'refresh'),
                })
              })
              .catch(e => {
                reject(new ApiError(
                  'profile.session.create.failed',
                  e,
                  'Creating session failed.',
                ))
              })
          })
          .catch(e => {
            reject(new ApiError(
              'profile.session.create.failed',
              e,
              'Creating session failed.',
            ))
          })
      })
    },

    refresh({ }, { id, refresh_token }) {
      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, {
          refresh: refresh_token,
        })

        formattedData.type = USER_PROFILE_SESSION

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        api.refreshSession(jsonData)
          .then(result => {
            const data = dataFormatter.deserialize(result.data)

            Session.insertOrUpdate({
              data: mapSessionResponse(id, data),
            })
              .then(() => {
                // Session refreshing was successful
                resolve({
                  token: get(data, 'token'),
                  refresh: get(data, 'refresh'),
                })
              })
              .catch(e => {
                reject(new ApiError(
                  'profile.session.refresh.failed',
                  e,
                  'Refreshing session failed.',
                ))
              })
          })
          .catch(e => {
            reject(new ApiError(
              'profile.session.refresh.failed',
              e,
              'Refreshing session failed.',
            ))
          })
      })
    },

    validateUid({}, { uid }) {
      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, {
          credentials: {
            uid,
          },
        })

        formattedData.type = USER_PROFILE_IDENTITY

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        api.validateIdentityUid(jsonData)
          .then(() => {
            // Validation was successful
            resolve()
          })
          .catch(e => {
            reject(new ApiError(
              'profile.session.validateUid.failed',
              e,
              'Validate uid failed.',
            ))
          })
      })
    },

    reset({ commit, dispatch }) {
      commit(IO_SERVER_RESET_STATE)

      dispatch('entities/account/reset', {}, {
        root: true,
      })

      dispatch('entities/profile/reset', {}, {
        root: true,
      })

      dispatch('entities/email/reset', {}, {
        root: true,
      })

      dispatch('entities/security_question/reset', {}, {
        root: true,
      })
    },

  },

  mutations: {

    /**
     * Set action processing semaphore
     *
     * @param {Object} state
     * @param {Object} state.semaphore
     * @param {Boolean} state.semaphore.fetching
     * @param {Boolean} state.semaphore.updating
     * @param {Object} action
     * @param {String} action.type
     */
    [IO_SERVER_SET_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'detail':
          state.semaphore.fetching = true
          break

        case 'refresh':
          state.semaphore.refreshing = true
          break
      }
    },

    /**
     * Reset action processing semaphore
     *
     * @param {Object} state
     * @param {Object} state.semaphore
     * @param {Boolean} state.semaphore.fetching
     * @param {Boolean} state.semaphore.updating
     * @param {Object} action
     * @param {String} action.type
     */
    [IO_SERVER_CLEAR_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'detail':
          state.semaphore.fetching = false
          break

        case 'refresh':
          state.semaphore.refreshing = false
          break
      }
    },

    /**
     * Reset store to initial state
     *
     * @param {Object} state
     */
    [IO_SERVER_RESET_STATE](state) {
      Object.assign(state, initialState)
    },

  },

}
