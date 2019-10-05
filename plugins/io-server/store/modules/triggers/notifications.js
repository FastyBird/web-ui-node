// JSON:API formatter
import Jsona from 'jsona'

import api from './../../../api'

import { ApiError } from './../../../api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,
  IO_SERVER_RESET_STATE,
} from './../../types'

import uuid from 'uuid'

import {
  TRIGGERS_NOTIFICATION_SMS,
  TRIGGERS_NOTIFICATION_EMAIL,
  TRIGGERS_NOTIFICATION_CUSTOM_EMAIL,
} from './../../../api/types'

import Notification from './Notification'
import Email from './../profile/Email'

const dataFormatter = new Jsona()

const initialState = {

  semaphore: {
    creating: [],
    deleting: [],
  },

}

export default {

  state: () => (initialState),

  actions: {

    /**
     * Request creating new trigger
     *
     * @param {Function} commit
     * @param {Trigger} trigger
     * @param {Object} data
     *
     * @returns {Promise<any>}
     */
    add({ commit }, { trigger, data }) {
      return new Promise((resolve, reject) => {
        const id = uuid.v4()
        const formattedData = data

        formattedData.id = id
        formattedData.relationshipNames = ['trigger']
        formattedData.trigger = {
          type: trigger.type,
          id: trigger.id,
        }
        formattedData.trigger_id = trigger.id

        if (data.type === 'sms') {
          formattedData.phone = data.value
          formattedData.type = TRIGGERS_NOTIFICATION_SMS

        } else if (data.type === 'email') {
          const email = Email.find(data.value)

          if (email !== null) {
            formattedData.address = email.address
            formattedData.type = TRIGGERS_NOTIFICATION_EMAIL
            formattedData.relationshipNames = ['trigger', 'email']
            formattedData.email = {
              type: email.type,
              id: email.id,
            }
            formattedData.email_id = email.id
          } else {
            formattedData.address = data.value
            formattedData.type = TRIGGERS_NOTIFICATION_CUSTOM_EMAIL
          }
        }

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'create',
          id,
        })

        Notification.insertOrUpdate({
          data: dataFormatter.deserialize(jsonData),
        })
          .then(() => {
            api.createTriggerRelation(trigger, 'notifications', jsonData)
              .then(result => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'create',
                  id,
                })

                Notification.insertOrUpdate({
                  data: dataFormatter.deserialize(result.data),
                })
                  .then(() => {
                    // Entity was successfully created in database
                    resolve()
                  })
                  .catch(() => {
                    reject(new Error('triggers.notifications.create.failed'))
                  })
              })
              .catch(e => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'create',
                  id,
                })

                Notification.delete(id)
                  .catch(() => {
                    // Failed creating could not be removed
                  })

                reject(new ApiError(
                  'triggers.notifications.create.failed',
                  e,
                  'Create new trigger notification failed.',
                ))
              })
          })
          .catch(() => {
            reject(new Error('triggers.notifications.create.failed'))
          })
      })
    },

    remove({ commit, dispatch }, { id }) {
      const notification = Notification.find(id)

      return new Promise((resolve, reject) => {
        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'delete',
          id,
        })

        Notification.delete(id)
          .then(() => {
            api.removeTriggerRelation(notification.trigger_id, 'notifications', id)
              .then(() => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'delete',
                  id,
                })

                // Entity was successfully deleted from database
                resolve()
              })
              .catch(e => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'delete',
                  id,
                })

                Notification.insertOrUpdate({
                  data: notification,
                })
                  .catch(() => {
                    // Replacing backup failed, we need to refresh whole list
                    dispatch('entities/trigger/fetch', null, {
                      root: true,
                    })
                      .catch(() => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'triggers.notifications.delete.failed',
                  e,
                  'Delete notification failed.',
                ))
              })
          })
          .catch(() => {
            reject(new Error('triggers.notifications.delete.failed'))
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
     * @param {Array} state.semaphore.creating
     * @param {Array} state.semaphore.deleting
     * @param {Object} action
     * @param {String} action.type
     * @param {String} action.id
     */
    [IO_SERVER_SET_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'create':
          state.semaphore.creating.push(action.id)
          break

        case 'delete':
          state.semaphore.deleting.push(action.id)
          break
      }
    },

    /**
     * Reset action processing semaphore
     *
     * @param {Object} state
     * @param {Object} state.semaphore
     * @param {Array} state.semaphore.creating
     * @param {Array} state.semaphore.deleting
     * @param {Object} action
     * @param {String} action.type
     * @param {String} action.id
     */
    [IO_SERVER_CLEAR_SEMAPHORE](state, action) {
      switch (action.type) {
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

        case 'delete':
          // Process all semaphore items
          for (let key in state.semaphore.deleting) {
            key = parseInt(key, 10)

            // Find removed item in removing semaphore...
            if (state.semaphore.deleting.hasOwnProperty(key) && state.semaphore.deleting[key] === action.id) {
              // ...and remove it
              state.semaphore.deleting.splice(key, 1)
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
