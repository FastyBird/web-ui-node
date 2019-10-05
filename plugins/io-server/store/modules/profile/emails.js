// JSON:API formatter
import Jsona from 'jsona'

import api from './../../../api'
import {
  USER_PROFILE_EMAIL,
} from './../../../api/types'
import { ApiError } from './../../../api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,
  IO_SERVER_RESET_STATE,
} from './../../types'

import uuid from 'uuid'

import Account from './Account'
import Email from './Email'

const dataFormatter = new Jsona()

const initialState = {

  semaphore: {
    fetching: {
      items: false,
      item: [],
    },
    creating: [],
    updating: [],
    removing: [],
  },

}

export default {

  state: () => (initialState),

  actions: {

    fetch({ state, commit }) {
      if (state.semaphore.fetching.items) {
        return Promise.reject(new Error('profile.emails.fetch.inProgress'))
      }

      const account = Account.query().first()

      return new Promise((resolve, reject) => {
        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'list',
        })

        api.getEmails()
          .then(result => {
            const data = dataFormatter.deserialize(result.data)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'list',
            })

            for (const item of data) {
              Email.insertOrUpdate({
                data: Object.assign(
                  item,
                  {
                    account_id: account.id,
                    account: {
                      id: account.id,
                      type: account.type,
                    },
                  },
                ),
              })
                .catch(e => {
                  reject(new ApiError(
                    'profile.emails.fetch.failed',
                    e,
                    'Fetching account emails failed.',
                  ))
                })
            }

            // Entities were successfully fetched from server
            resolve()
          })
          .catch(e => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'list',
            })

            reject(new ApiError(
              'profile.emails.fetch.failed',
              e,
              'Fetching account emails failed.',
            ))
          })
      })
    },

    add({ commit, dispatch }, { address, is_default = false, is_private = false }) {
      const account = Account.query().first()

      const data = {
        address,
        is_default,
        is_private,
      }

      return new Promise((resolve, reject) => {
        const id = uuid.v4()

        const jsonData = {
          data: {
            type: USER_PROFILE_EMAIL,
            id,
            attributes: data,
          },
        }

        Email.insert({
          data: Object.assign(
            dataFormatter.deserialize(jsonData),
            {
              account_id: account.id,
              account: {
                id: account.id,
                type: account.type,
              },
            },
          ),
        })
          .catch(e => {
            reject(new ApiError(
              'profile.emails.create.failed',
              e,
              'Create new account email failed.',
            ))
          })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'create',
          id,
        })

        api.createEmail(jsonData)
          .then(result => {
            const updatedData = dataFormatter.deserialize(result.data)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'create',
              id,
            })

            updatedData.account_id = account.id
            updatedData.account = {
              id: account.id,
              type: account.type,
            }

            Email.update({
              where: id,
              data: updatedData,
            })
              .then(() => {
                // Refresh emails
                dispatch('entities/email/fetch', null, {
                  root: true,
                })
                  .catch(e => {
                    reject(new ApiError(
                      'profile.emails.create.failed',
                      e,
                      'Create new account email failed.',
                    ))
                  })

                // Entity was successfully created in database
                resolve()
              })
              .catch(e => {
                // Revert changes
                Email.delete(id)
                  .catch(() => {
                    // Nothing to do here
                  })

                reject(new ApiError(
                  'profile.emails.create.failed',
                  e,
                  'Create new account email failed.',
                ))
              })
          })
          .catch(e => {
            // Revert changes
            Email.delete(id)
              .catch(() => {
                // Nothing to do here
              })

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'create',
              id,
            })

            reject(new ApiError(
              'profile.emails.create.failed',
              e,
              'Create new account email failed.',
            ))
          })
      })
    },

    edit({ state, commit, dispatch }, { id, is_default = false, is_private = false }) {
      if (state.semaphore.updating.indexOf(id) !== -1) {
        return Promise.reject(new Error('profile.emails.update.inProgress'))
      }

      const account = Account.query().first()
      const email = Email.find(id)

      const data = {
        is_default,
        is_private,
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, email)
        Object.assign(formattedData, data)

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        Email.update({
          where: email.id,
          data: dataFormatter.deserialize(jsonData),
        })
          .catch(e => {
            reject(new ApiError(
              'profile.emails.edit.failed',
              e,
              'Edit account email failed.',
            ))
          })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'edit',
          id,
        })

        api.editEmail(id, jsonData)
          .then(result => {
            const updatedData = dataFormatter.deserialize(result.data)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
              id,
            })

            updatedData.account_id = account.id
            updatedData.account = {
              id: account.id,
              type: account.type,
            }

            Email.update({
              where: email.id,
              data: updatedData,
            })
              .then(() => {
                // Refresh emails
                dispatch('entities/email/fetch', null, {
                  root: true,
                })
                  .catch(e => {
                    reject(new ApiError(
                      'profile.emails.edit.failed',
                      e,
                      'Edit account email failed.',
                    ))
                  })

                // Entity was successfully updated in database
                resolve()
              })
              .catch(e => {
                // Revert changes
                Email.update({
                  where: email.id,
                  data: email,
                })
                  .catch(() => {
                    // Nothing to do here
                  })

                reject(new ApiError(
                  'profile.emails.edit.failed',
                  e,
                  'Edit account email failed.',
                ))
              })
          })
          .catch(e => {
            // Revert changes
            Email.update({
              where: email.id,
              data: email,
            })
              .catch(() => {
                // Nothing to do here
              })

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
              id,
            })

            reject(new ApiError(
              'profile.emails.edit.failed',
              e,
              'Edit account email failed.',
            ))
          })
      })
    },

    validate({}, { address }) {
      const data = {
        address,
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, data)

        formattedData.type = USER_PROFILE_EMAIL

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        api.validateEmail(jsonData)
          .then(() => {
            // Validation was successful
            resolve()
          })
          .catch(e => {
            reject(new ApiError(
              'profile.emails.validate.failed',
              e,
              'Validate email address failed.',
            ))
          })
      })
    },

    reset({ commit }) {
      commit(IO_SERVER_RESET_STATE)
    },

  },

  mutations: {

    /**
     * Set action processing semaphore
     *
     * @param {Object} state
     * @param {Object} state.semaphore
     * @param {Object} state.semaphore.fetching
     * @param {Boolean} state.semaphore.fetching.items
     * @param {Array} state.semaphore.fetching.item
     * @param {Array} state.semaphore.creating
     * @param {Array} state.semaphore.updating
     * @param {Array} state.semaphore.removing
     * @param {Object} action
     * @param {String} action.type
     * @param {String} action.id
     */
    [IO_SERVER_SET_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'list':
          state.semaphore.fetching.items = true
          break

        case 'detail':
          state.semaphore.fetching.item.push(action.id)
          break

        case 'create':
          state.semaphore.creating.push(action.id)
          break

        case 'edit':
          state.semaphore.updating.push(action.id)
          break

        case 'remove':
          state.semaphore.removing.push(action.id)
          break
      }
    },

    /**
     * Reset action processing semaphore
     *
     * @param {Object} state
     * @param {Object} state.semaphore
     * @param {Object} state.semaphore.fetching
     * @param {Boolean} state.semaphore.fetching.items
     * @param {Array} state.semaphore.fetching.item
     * @param {Array} state.semaphore.creating
     * @param {Array} state.semaphore.updating
     * @param {Array} state.semaphore.removing
     * @param {Object} action
     * @param {String} action.type
     * @param {String} action.id
     */
    [IO_SERVER_CLEAR_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'list':
          state.semaphore.fetching.items = false
          break

        case 'detail':
          // Process all semaphore items
          for (let key in state.semaphore.fetching.item) {
            key = parseInt(key, 10)

            // Find fetched item in fetching semaphore...
            if (state.semaphore.fetching.item.hasOwnProperty(key) && state.semaphore.fetching.item[key] === action.id) {
              // ...and remove it
              state.semaphore.fetching.item.splice(key, 1)
            }
          }
          break

        case 'create':
          // Process all semaphore items
          for (let key in state.semaphore.creating) {
            key = parseInt(key, 10)

            // Find created item in creating semaphore...
            if (state.semaphore.creating.hasOwnProperty(key) && state.semaphore.creating[key] === action.id) {
              // ...and remove it
              state.semaphore.creating.splice(key, 1)
            }
          }
          break

        case 'edit':
          // Process all semaphore items
          for (let key in state.semaphore.updating) {
            key = parseInt(key, 10)

            // Find updated item in updating semaphore...
            if (state.semaphore.updating.hasOwnProperty(key) && state.semaphore.updating[key] === action.id) {
              // ...and remove it
              state.semaphore.updating.splice(key, 1)
            }
          }
          break

        case 'remove':
          // Process all semaphore items
          for (let key in state.semaphore.removing) {
            key = parseInt(key, 10)

            // Find removed item in removing semaphore...
            if (state.semaphore.removing.hasOwnProperty(key) && state.semaphore.removing[key] === action.id) {
              // ...and remove it
              state.semaphore.removing.splice(key, 1)
            }
          }
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
