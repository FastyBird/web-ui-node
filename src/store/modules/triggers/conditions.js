// JSON:API formatter
import Jsona from 'jsona'

import api from '@/api/server'

import { ApiError } from '@/helpers/errors'

import {
  COMMON_CLEAR_SEMAPHORE,
  COMMON_SET_SEMAPHORE,
} from '../../types'

import uuid from 'uuid'

import {
  TRIGGERS_CONDITION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_THING_PROPERTY,
} from '@/api/server/types'

import Condition from './Condition'
import Thing from '../io-server/Thing'
import ThingProperty from '../io-server/ThingProperty'
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

        if (data.trigger === 'state') {
          const thing = Thing.find(data.thing)
          const property = ThingProperty.find(data.property)

          if (thing !== null && property !== null) {
            formattedData.type = TRIGGERS_CONDITION_THING_PROPERTY
            formattedData.relationshipNames = ['trigger', 'thing', 'property']
            formattedData.thing = {
              type: thing.type,
              id: thing.id,
            }
            formattedData.thing_id = thing.id
            formattedData.property = {
              type: property.type,
              id: property.id,
            }
            formattedData.property_id = property.id
          } else {
            reject(new Error('triggers.conditions.create.invalid'))
            return
          }
        } else {
          const channel = Channel.find(data.trigger)
          const property = ChannelProperty.find(data.property)

          if (channel !== null && property !== null) {
            formattedData.type = TRIGGERS_CONDITION_CHANNEL_PROPERTY
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
            reject(new Error('triggers.conditions.create.invalid'))
            return
          }
        }

        formattedData.trigger = {
          type: trigger.type,
          id: trigger.id,
        }
        formattedData.trigger_id = trigger.id

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        commit(COMMON_SET_SEMAPHORE, {
          type: 'create',
          id,
        })

        Condition.insertOrUpdate({
          data: dataFormatter.deserialize(jsonData),
        })
          .then(() => {
            api.createTriggerRelation(trigger, 'conditions', jsonData)
              .then(result => {
                commit(COMMON_CLEAR_SEMAPHORE, {
                  type: 'create',
                  id,
                })

                Condition.insertOrUpdate({
                  data: dataFormatter.deserialize(result.data),
                })
                  .then(() => {
                    // Entity was successfully created in database
                    resolve()
                  })
                  .catch(() => {
                    reject(new Error('triggers.conditions.create.failed'))
                  })
              })
              .catch(e => {
                commit(COMMON_CLEAR_SEMAPHORE, {
                  type: 'create',
                  id,
                })

                Condition.delete(id)
                  .catch(() => {
                    // Failed creating could not be removed
                  })

                reject(new ApiError(
                  'triggers.conditions.create.failed',
                  e,
                  'Create new trigger condition failed.',
                ))
              })
          })
          .catch(() => {
            reject(new Error('triggers.conditions.create.failed'))
          })
      })
    },

    remove({ commit, dispatch }, { id }) {
      const condition = Condition.find(id)

      return new Promise((resolve, reject) => {
        commit(COMMON_SET_SEMAPHORE, {
          type: 'delete',
          id,
        })

        Condition.delete(id)
          .then(() => {
            api.removeTriggerRelation(condition.trigger_id, 'conditions', id)
              .then(() => {
                commit(COMMON_CLEAR_SEMAPHORE, {
                  type: 'delete',
                  id,
                })

                // Entity was successfully deleted from database
                resolve()
              })
              .catch(e => {
                commit(COMMON_CLEAR_SEMAPHORE, {
                  type: 'delete',
                  id,
                })

                Condition.insertOrUpdate({
                  data: condition,
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
                  'triggers.conditions.delete.failed',
                  e,
                  'Delete condition failed.',
                ))
              })
          })
          .catch(() => {
            reject(new Error('triggers.conditions.delete.failed'))
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
    [COMMON_SET_SEMAPHORE](state, action) {
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
    [COMMON_CLEAR_SEMAPHORE](state, action) {
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

  },

}
