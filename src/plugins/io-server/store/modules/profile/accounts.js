// JSON:API formatter
import Jsona from 'jsona'
import get from 'lodash/get'

import api from './../../../api'
import {
  USER_PROFILE_ACCOUNT,
  USER_PROFILE_IDENTITY,
  USER_PROFILE_SESSION,
} from './../../../api/types'
import { ApiError } from './../../../api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,
} from './../../types'

import Account from './Account'

const dataFormatter = new Jsona()

const initialState = {
  semaphore: {
    fetching: false,
    updating: false,
    password: false,
  },
}

export default {

  state: initialState,

  actions: {

    fetch({ state, commit }) {
      if (state.semaphore.fetching) {
        return Promise.reject(new Error('profile.account.fetch.inProgress'))
      }

      return new Promise((resolve, reject) => {
        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'detail',
        })

        api.getAccount()
          .then(result => {
            const data = dataFormatter.deserialize(result.data)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'detail',
            })

            let profile = null

            if (data.hasOwnProperty('profile')) {
              profile = data.profile

              profile.account_id = data.id
              profile.account = {
                id: data.id,
                type: data.type,
              }
            }

            let securityQuestion = null

            if (data.hasOwnProperty('security-question') && data['security-question'] !== null) {
              securityQuestion = data['security-question']

              securityQuestion.account_id = data.id
              securityQuestion.account = {
                id: data.id,
                type: data.type,
              }
            }

            const emails = []

            if (data.hasOwnProperty('emails')) {
              data.emails
                .forEach(email => {
                  emails.push(Object.assign(email, {
                    account_id: data.id,
                    account: {
                      id: data.id,
                      type: data.type,
                    },
                  }))
                })
            }

            data.profile = profile
            data.security_question = securityQuestion
            data.emails = emails

            Account.insertOrUpdate({
              data,
            })
              .then(() => {
                // Entity was successfully fetched from database
                resolve()
              })
              .catch(e => {
                reject(new ApiError(
                  'profile.account.fetch.failed',
                  e,
                  'Fetch account data failed.',
                ))
              })
          })
          .catch(e => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'detail',
            })

            reject(new ApiError(
              'profile.account.fetch.failed',
              e,
              'Fetch account data failed.',
            ))
          })
      })
    },

    edit({ state, commit }, { language, week_start, time_zone, date_format, time_format }) {
      if (state.semaphore.updating) {
        return Promise.reject(new Error('profile.account.update.inProgress'))
      }

      const account = Account.query().first()

      const data = {
        language,
        params: {
          datetime: {
            week_start,
            zone: time_zone,
            format: {
              date: date_format,
              time: time_format,
            },
          },
        },
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, account)
        Object.assign(formattedData, data)

        formattedData.type = USER_PROFILE_ACCOUNT

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        Account.update({
          where: account.id,
          data: dataFormatter.deserialize(jsonData),
        })
          .catch(e => {
            reject(new ApiError(
              'profile.account.update.failed',
              e,
              'Edit account data failed.',
            ))
          })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'edit',
        })

        api.editAccount(jsonData)
          .then(result => {
            const updatedData = dataFormatter.deserialize(result.data)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
            })

            if (updatedData.hasOwnProperty('profile')) {
              updatedData.profile.account_id = updatedData.id
              updatedData.profile.account = {
                id: updatedData.id,
                type: updatedData.type,
              }
            }

            if (updatedData.hasOwnProperty('emails')) {
              updatedData.emails
                .forEach((email, index) => {
                  updatedData.emails[index].account_id = email.id
                  updatedData.emails[index].account = {
                    id: email.id,
                    type: email.type,
                  }
                })
            }

            Account.update({
              where: account.id,
              data: updatedData,
            })
              .then(() => {
                // Entity was successfully updated in database
                resolve()
              })
              .catch(e => {
                // Revert changes
                Account.update({
                  where: account.id,
                  data: account,
                })
                  .catch(() => {
                    // Nothing to do here
                  })

                reject(new ApiError(
                  'profile.account.update.failed',
                  e,
                  'Edit account data failed.',
                ))
              })
          })
          .catch(e => {
            // Revert changes
            Account.update({
              where: account.id,
              data: account,
            })
              .catch(() => {
                // Nothing to do here
              })

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
            })

            reject(new ApiError(
              'profile.account.update.failed',
              e,
              'Edit account data failed.',
            ))
          })
      })
    },

    validatePassword({}, { password }) {
      const account = Account.query().first()

      const data = {
        password: {
          current: password,
        },
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, data)

        formattedData.id = account.id
        formattedData.type = account.type

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        api.validatePassword(jsonData)
          .then(() => {
            // Validation was successful
            resolve()
          })
          .catch(e => {
            reject(new ApiError(
              'profile.account.validatePassword.failed',
              e,
              'Validate current password failed.',
            ))
          })
      })
    },

    changePassword({ state, commit }, { current_password, new_password }) {
      if (state.semaphore.password) {
        return Promise.reject(new Error('profile.account.password.inProgress'))
      }

      const account = Account.query().first()

      const data = {
        password: {
          current: current_password,
          new: new_password,
        },
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, data)

        formattedData.id = account.id
        formattedData.type = account.type

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'password',
        })

        api.editPassword(jsonData)
          .then(() => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'password',
            })

            // Entity was successfully updated in database
            resolve()
          })
          .catch(e => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'password',
            })

            reject(new ApiError(
              'profile.account.changePassword.failed',
              e,
              'Edit account password failed.',
            ))
          })
      })
    },

    requestPassword({}, { uid }) {
      const data = {
        credentials: {
          uid,
        },
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, data)

        formattedData.type = USER_PROFILE_IDENTITY

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        api.requestPassword(jsonData)
          .then(() => {
            // Request was successful
            resolve()
          })
          .catch(e => {
            reject(new ApiError(
              'profile.account.requestPassword.failed',
              e,
              'Request password reset failed.',
            ))
          })
      })
    },

    validateUid({}, { uid }) {
      const data = {
        credentials: {
          uid,
        },
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, data)

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
              'profile.account.validateUid.failed',
              e,
              'Validate uid failed.',
            ))
          })
      })
    },

    createSession({ }, { uid, password }) {
      const data = {
        uid,
        password,
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, data)

        formattedData.type = USER_PROFILE_SESSION

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        api.createSession(jsonData)
          .then(result => {
            const session = dataFormatter.deserialize(result.data)

            console.log(session)
            if (session.hasOwnProperty('account')) {
              const account = session.account

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

              Account.insert({
                data: account,
              })
                .then(() => {
                  // Session creation was successful
                  resolve({
                    token: get(session, 'token'),
                    refresh: get(session, 'refresh'),
                  })
                })
                .catch(e => {
                  reject(new ApiError(
                    'profile.account.createSession.failed',
                    e,
                    'Creating session failed.',
                  ))
                })
            } else {
              // Session creation was successful
              resolve({
                token: get(session, 'token'),
                refresh: get(session, 'refresh'),
              })
            }
          })
          .catch(e => {
            reject(new ApiError(
              'profile.account.createSession.failed',
              e,
              'Creating session failed.',
            ))
          })
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

        case 'edit':
          state.semaphore.updating = true
          break

        case 'password':
          state.semaphore.password = true
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

        case 'edit':
          state.semaphore.updating = false
          break

        case 'password':
          state.semaphore.password = false
          break
      }
    },

  },

}
