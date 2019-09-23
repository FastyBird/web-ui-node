// JSON:API formatter
import Jsona from 'jsona'

import api from './../../../api'

import { ApiError } from '@/plugins/io-server/api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,
} from './../../types'

import uuid from 'uuid'

import {
  TRIGGERS_ACTION_CHANNEL_PROPERTY,
} from './../../../api/types'

import Action from './Action'
import Channel from '../io-server/Channel'
import ChannelProperty from '../io-server/ChannelProperty'

const dataFormatter = new Jsona()

const initialState = {

  semaphore: {
    creating: [],
    deleting: [],
  },

}

export default {

  state: initialState,

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
        formattedData.trigger = {
          type: trigger.type,
          id: trigger.id,
        }
        formattedData.trigger_id = trigger.id

        const channel = Channel.find(data.channel)
        const property = ChannelProperty.find(data.property)

        if (channel !== null && property !== null) {
          formattedData.type = TRIGGERS_ACTION_CHANNEL_PROPERTY
          formattedData.relationshipNames = ['trigger', 'channel', 'property']
          formattedData.channel = {
            type: channel.type,
            id: channel.id,
          }
          formattedData.channel_id = channel.id
          formattedData.property = {
            type: property.type,
            id: property.id,
          }
          formattedData.property_id = property.id
        } else {
          reject(new Error('triggers.actions.create.invalid'))
          return
        }

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'create',
          id,
        })

        Action.insertOrUpdate({
          data: dataFormatter.deserialize(jsonData),
        })
          .then(() => {
            api.createTriggerRelation(trigger, 'actions', jsonData)
              .then(result => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'create',
                  id,
                })

                Action.insertOrUpdate({
                  data: dataFormatter.deserialize(result.data),
                })
                  .then(() => {
                    // Entity was successfully created in database
                    resolve()
                  })
                  .catch(() => {
                    reject(new Error('triggers.actions.create.failed'))
                  })
              })
              .catch(e => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'create',
                  id,
                })

                Action.delete(id)
                  .catch(() => {
                    // Failed creating could not be removed
                  })

                reject(new ApiError(
                  'triggers.actions.create.failed',
                  e,
                  'Create new trigger action failed.',
                ))
              })
          })
          .catch(() => {
            reject(new Error('triggers.actions.create.failed'))
          })
      })
    },

    remove({ commit, dispatch }, { id }) {
      const action = Action.find(id)

      return new Promise((resolve, reject) => {
        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'delete',
          id,
        })

        Action.delete(id)
          .then(() => {
            api.removeTriggerRelation(action.trigger_id, 'actions', id)
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

                Action.insertOrUpdate({
                  data: action,
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
                  'triggers.actions.delete.failed',
                  e,
                  'Delete action failed.',
                ))
              })
          })
          .catch(() => {
            reject(new Error('triggers.actions.delete.failed'))
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
          state.semaphore.creating
            .forEach((item, index) => {
              // Find created item in creating semaphore...
              if (item === action.id) {
                // ...and remove it
                state.semaphore.creating.splice(index, 1)
              }
            })
          break

        case 'delete':
          // Process all semaphore items
          state.semaphore.deleting
            .forEach((item, index) => {
              // Find removed item in removing semaphore...
              if (item === action.id) {
                // ...and remove it
                state.semaphore.deleting.splice(index, 1)
              }
            })
          break
      }
    },

  },

}
