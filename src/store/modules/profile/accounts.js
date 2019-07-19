// JSON:API formatter
import Jsona from 'jsona'

import api from '@/api/server'
import { USER_PROFILE_ACCOUNT } from '@/api/server/types'

import { ApiError } from '@/helpers/errors'

import { COMMON_CLEAR_SEMAPHORE, COMMON_SET_SEMAPHORE } from '../../types'

import Account from './Account'

const dataFormatter = new Jsona()

const initialState = {
  semaphore: {
    fetching: false,
    updating: false,
  },
}

export default {

  state: initialState,

  actions: {

    fetch({ state, commit }) {
      return new Promise((resolve, reject) => {
        if (state.semaphore.fetching) {
          reject(new Error('profile.account.fetch.inProgress'))
        } else {
          commit(COMMON_SET_SEMAPHORE, {
            type: 'detail',
          })

          api.getAccount()
            .then(result => {
              const data = dataFormatter.deserialize(result.data)

              commit(COMMON_CLEAR_SEMAPHORE, {
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

              // Create new entity
              Account.insertOrUpdate({
                data,
              })
                .then(() => {
                  // Entity was successfully created in database
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
              commit(COMMON_CLEAR_SEMAPHORE, {
                type: 'detail',
              })

              reject(new ApiError(
                'profile.account.fetch.failed',
                e,
                'Fetch account data failed.',
              ))
            })
        }
      })
    },

    edit({ commit }, { data }) {
      const account = Account.query().first()

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, account)
        Object.assign(formattedData, data)

        formattedData.type = USER_PROFILE_ACCOUNT

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        Account.insertOrUpdate({
          data: dataFormatter.deserialize(jsonData),
        })
          .catch(e => {
            reject(new ApiError(
              'profile.account.update.failed',
              e,
              'Edit account data failed.',
            ))
          })

        commit(COMMON_SET_SEMAPHORE, {
          type: 'edit',
        })

        api.editAccount(jsonData)
          .then(result => {
            const updatedData = dataFormatter.deserialize(result.data)

            commit(COMMON_CLEAR_SEMAPHORE, {
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

            Account.insertOrUpdate({
              data: updatedData,
            })
              .then(() => {
                // Entity was successfully created in database
                resolve()
              })
              .catch(e => {
                reject(new ApiError(
                  'profile.account.update.failed',
                  e,
                  'Edit account data failed.',
                ))
              })
          })
          .catch(e => {
            Account.insertOrUpdate({
              data: account,
            })

            commit(COMMON_CLEAR_SEMAPHORE, {
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

    validatePassword({}, { data }) {
      const account = Account.query().first()

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
            // Entity was successfully created in database
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

    changePassword({ commit }, { data }) {
      const account = Account.query().first()

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, data)

        formattedData.id = account.id
        formattedData.type = account.type

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        commit(COMMON_SET_SEMAPHORE, {
          type: 'edit',
        })

        api.editPassword(jsonData)
          .then(() => {
            commit(COMMON_CLEAR_SEMAPHORE, {
              type: 'edit',
            })

            // Entity was successfully created in database
            resolve()
          })
          .catch(e => {
            commit(COMMON_CLEAR_SEMAPHORE, {
              type: 'edit',
            })

            reject(new ApiError(
              'profile.account.changePassword.failed',
              e,
              'Edit account password failed.',
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
    [COMMON_SET_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'detail':
          state.semaphore.fetching = true
          break

        case 'edit':
          state.semaphore.updating = true
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
    [COMMON_CLEAR_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'detail':
          state.semaphore.fetching = false
          break

        case 'edit':
          state.semaphore.updating = false
          break
      }
    },

  },

}
