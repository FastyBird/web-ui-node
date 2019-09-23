// JSON:API formatter
import Jsona from 'jsona'
import cloneDeep from 'lodash/cloneDeep'
import uuid from 'uuid'

import api from './../../../api'

import { ApiError } from '@/plugins/io-server/api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,

  IO_SERVER_POP_FROM_QUEUE,
  IO_SERVER_PUSH_INTO_QUEUE,
} from './../../types'

import {
  TRIGGER_AUTOMATIC,
  TRIGGER_DIRECT,
  TRIGGER_MANUAL,
  TRIGGERS_ACTION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_THING_PROPERTY,
  TRIGGERS_NOTIFICATION_CUSTOM_EMAIL,
  TRIGGERS_NOTIFICATION_EMAIL,
  TRIGGERS_NOTIFICATION_SMS,
} from './../../../api/types'

import Trigger from './Trigger'
import Email from '../profile/Email'
import Thing from '../io-server/Thing'
import ThingProperty from '../io-server/ThingProperty'
import Channel from '../io-server/Channel'
import ChannelProperty from '../io-server/ChannelProperty'

const dataFormatter = new Jsona()

const initialState = {

  semaphore: {
    fetching: {
      items: false,
      item: [],
    },
    creating: [],
    updating: [],
    deleting: [],
    viewing: [],
  },

  firstLoad: false,

  queue: {
    update: [],
  },

}

function mapTriggerResponse(item) {
  const mapped = cloneDeep(item)

  mapped.conditions = []

  if (item.hasOwnProperty('conditions') && item.conditions.length) {
    for (const condition of item.conditions) {
      if (condition.hasOwnProperty('thing') && condition.hasOwnProperty('property')) {
        condition.trigger_id = item.id
        condition.thing_id = condition.thing.id
        condition.property_id = condition.property.id
      } else if (condition.hasOwnProperty('channel') && condition.hasOwnProperty('property')) {
        condition.trigger_id = item.id
        condition.channel_id = condition.channel.id
        condition.property_id = condition.property.id
      } else {
        continue
      }

      mapped.conditions.push(condition)
    }
  }

  mapped.actions = []

  if (item.hasOwnProperty('actions') && item.actions.length) {
    for (const action of item.actions) {
      if (action.hasOwnProperty('channel') && action.hasOwnProperty('property')) {
        action.trigger_id = item.id
        action.channel_id = action.channel.id
        action.property_id = action.property.id
      } else {
        continue
      }

      mapped.actions.push(action)
    }
  }

  mapped.notifications = []

  if (item.hasOwnProperty('notifications') && item.notifications.length) {
    for (const notification of item.notifications) {
      notification.trigger_id = item.id

      mapped.notifications.push(notification)
    }
  }

  return mapped
}

export default {

  state: initialState,

  getters: {

    /**
     * Check if trigger is locked for updating
     *
     * @param {Object} state
     *
     * @returns {Boolean}
     */
    isOpened: (state) => (id) => {
      if (state.semaphore.viewing.length) {
        const result = state.semaphore.viewing.find(triggerId => triggerId === id)

        return result !== null && typeof result !== 'undefined'
      }

      return false
    },

    /**
     * Check if trigger is locked for updating
     *
     * @param {Object} state
     *
     * @returns {Boolean}
     */
    isInQueue: (state) => (id, queue) => {
      if (state.queue.hasOwnProperty(queue) && state.queue[queue].length) {
        const result = state.queue[queue].find(trigger => trigger.id === id)

        return result !== null && typeof result !== 'undefined'
      }

      return false
    },

  },

  actions: {

    /**
     * Request fetching selected trigger
     *
     * @param {Object} state
     * @param {Function} commit
     * @param {Object} getters
     * @param {String} id
     *
     * @returns {Promise<any>}
     */
    get({ state, commit, getters }, { id }) {
      return new Promise((resolve, reject) => {
        if (state.semaphore.fetching.item.indexOf(id) !== -1) {
          resolve(false)
        } else {
          commit(IO_SERVER_SET_SEMAPHORE, {
            type: 'get',
            id,
          })

          api.getTrigger(id)
            .then(result => {
              commit(IO_SERVER_CLEAR_SEMAPHORE, {
                type: 'get',
                id,
              })

              if (getters.isOpened(id)) {
                if (!getters.isInQueue(id, 'update')) {
                  commit(IO_SERVER_PUSH_INTO_QUEUE, {
                    id,
                    queue: 'update',
                  })
                }

                // Entity was successfully fetched from server
                resolve(true)
              } else {
                Trigger.insertOrUpdate({
                  data: mapTriggerResponse(dataFormatter.deserialize(result.data)),
                })
                  .then(() => {
                    // Entity was successfully fetched from server
                    resolve(true)
                  })
                  .catch(() => {
                    reject(new Error('triggers.triggers.get.failed'))
                  })
              }
            })
            .catch(e => {
              commit(IO_SERVER_CLEAR_SEMAPHORE, {
                type: 'get',
                id,
              })

              reject(new ApiError(
                'triggers.triggers.get.failed',
                e,
                'Fetching trigger failed.',
              ))
            })
        }
      })
    },

    /**
     * Request fetching all triggers
     *
     * @param {Object} state
     * @param {Function} commit
     * @param {Object} getters
     *
     * @returns {Promise<any>}
     */
    fetch({ state, commit, getters }) {
      return new Promise((resolve, reject) => {
        if (state.semaphore.fetching.items) {
          resolve(true)
        } else {
          commit(IO_SERVER_SET_SEMAPHORE, {
            type: 'fetch',
          })

          api.getTriggers()
            .then(result => {
              const data = dataFormatter.deserialize(result.data)

              commit(IO_SERVER_CLEAR_SEMAPHORE, {
                type: 'fetch',
              })

              for (const item of data) {
                if (getters.isOpened(item.id)) {
                  if (!getters.isInQueue(item.id, 'update')) {
                    commit(IO_SERVER_PUSH_INTO_QUEUE, {
                      id: item.id,
                      queue: 'update',
                    })
                  }

                } else {
                  Trigger.insertOrUpdate({
                    data: mapTriggerResponse(item),
                  })
                    .catch(() => {
                      reject(new Error('triggers.triggers.fetch.failed'))
                    })
                }
              }

              // Entities were successfully fetched from server
              resolve(true)
            })
            .catch(e => {
              commit(IO_SERVER_CLEAR_SEMAPHORE, {
                type: 'fetch',
              })

              reject(new ApiError(
                'triggers.triggers.fetch.failed',
                e,
                'Fetching triggers failed.',
              ))
            })
        }
      })
    },

    /**
     * Request creating new trigger
     *
     * @param {Function} commit
     * @param {Boolean} automatic
     * @param {Boolean} direct
     * @param {Object} data
     * @param {String} data.name
     * @param {String} data.comment
     * @param {(Array|null)} data.actions
     * @param {(Array|null)} data.notifications
     * @param {Array} data.conditions
     *
     * @returns {Promise<any>}
     */
    add({ commit }, { automatic, direct, data }) {
      return new Promise((resolve, reject) => {
        const id = uuid.v4()

        const included = []

        const conditions = []
        let condition = null
        const actions = []
        const notifications = []

        for (const conditionData of data.conditions) {
          const conditionId = uuid.v4()

          if (conditionData.trigger === 'state') {
            const thing = Thing.find(conditionData.thing)
            const property = ThingProperty.find(conditionData.property)

            if (thing !== null && property !== null) {
              if (direct) {
                condition = {
                  type: TRIGGERS_CONDITION_THING_PROPERTY,
                  id: conditionId,
                }
              } else {
                conditions.push({
                  type: TRIGGERS_CONDITION_THING_PROPERTY,
                  id: conditionId,
                })
              }

              included.push({
                type: TRIGGERS_CONDITION_THING_PROPERTY,
                id: conditionId,
                attributes: {
                  operator: conditionData.operator,
                  operands: conditionData.operands,
                },
                relationships: {
                  thing: {
                    data: {
                      type: thing.type,
                      id: thing.id,
                    },
                  },
                  property: {
                    data: {
                      type: property.type,
                      id: property.id,
                    },
                  },
                },
              })
            }
          } else {
            const channel = Channel.find(conditionData.trigger)
            const property = ChannelProperty.find(conditionData.property)

            if (channel !== null && property !== null) {
              if (direct) {
                condition = {
                  type: TRIGGERS_CONDITION_CHANNEL_PROPERTY,
                  id: conditionId,
                }
              } else {
                conditions.push({
                  type: TRIGGERS_CONDITION_CHANNEL_PROPERTY,
                  id: conditionId,
                })
              }

              included.push({
                type: TRIGGERS_CONDITION_CHANNEL_PROPERTY,
                id: conditionId,
                attributes: {
                  operator: conditionData.operator,
                  operands: conditionData.operands,
                },
                relationships: {
                  channel: {
                    data: {
                      type: channel.type,
                      id: channel.id,
                    },
                  },
                  property: {
                    data: {
                      type: property.type,
                      id: property.id,
                    },
                  },
                },
              })
            }
          }
        }

        for (const actionData of data.actions) {
          const actionId = uuid.v4()

          const channel = Channel.find(actionData.channel)
          const property = ChannelProperty.find(actionData.property)

          if (channel !== null && property !== null) {
            actions.push({
              type: TRIGGERS_ACTION_CHANNEL_PROPERTY,
              id: actionId,
            })

            included.push({
              type: TRIGGERS_ACTION_CHANNEL_PROPERTY,
              id: actionId,
              attributes: {
                value: actionData.value,
              },
              relationships: {
                channel: {
                  data: {
                    type: channel.type,
                    id: channel.id,
                  },
                },
                property: {
                  data: {
                    type: property.type,
                    id: property.id,
                  },
                },
              },
            })
          }
        }

        if (!direct) {
          for (const notificationData of data.notifications) {
            const notificationId = uuid.v4()

            if (notificationData.type === 'sms') {
              notifications.push({
                type: TRIGGERS_NOTIFICATION_SMS,
                id: notificationId,
              })

              included.push({
                type: TRIGGERS_NOTIFICATION_SMS,
                id: notificationId,
                attributes: {
                  phone: notificationData.value,
                },
              })
            } else if (notificationData.type === 'email') {
              const email = Email.find(notificationData.value)

              if (email !== null) {
                notifications.push({
                  type: TRIGGERS_NOTIFICATION_EMAIL,
                  id: notificationId,
                })

                included.push({
                  type: TRIGGERS_NOTIFICATION_EMAIL,
                  id: notificationId,
                  relationships: {
                    email: {
                      data: {
                        type: email.type,
                        id: email.id,
                      },
                    },
                  },
                })
              } else {
                notifications.push({
                  type: TRIGGERS_NOTIFICATION_CUSTOM_EMAIL,
                  id: notificationId,
                })

                included.push({
                  type: TRIGGERS_NOTIFICATION_CUSTOM_EMAIL,
                  id: notificationId,
                  attributes: {
                    address: notificationData.value,
                  },
                })
              }
            }
          }
        }

        const relationships = {}

        if (conditions.length) {
          relationships.conditions = {
            data: conditions,
          }
        }

        if (condition !== null) {
          relationships.condition = {
            data: condition,
          }
        }

        if (actions.length) {
          relationships.actions = {
            data: actions,
          }
        }

        if (notifications.length) {
          relationships.notifications = {
            data: notifications,
          }
        }

        const jsonData = {
          data: {
            type: automatic ? TRIGGER_AUTOMATIC : (direct ? TRIGGER_DIRECT : TRIGGER_MANUAL),
            id,
            attributes: {
              name: data.name,
              comment: data.comment,
              enabled: true,
            },
            relationships,
          },
          included,
        }

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'create',
          id,
        })

        Trigger.insertOrUpdate({
          data: dataFormatter.deserialize(jsonData),
        })
          .then(() => {
            api.createTrigger(jsonData)
              .then(result => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'create',
                  id,
                })

                Trigger.insertOrUpdate({
                  data: mapTriggerResponse(dataFormatter.deserialize(result.data)),
                })
                  .then(() => {
                    // Entity was successfully created in database
                    resolve()
                  })
                  .catch(() => {
                    reject(new Error('triggers.triggers.create.failed'))
                  })
              })
              .catch(e => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'create',
                  id,
                })

                Trigger.delete(id)
                  .catch(() => {
                    // Failed creating could not be removed
                  })

                reject(new ApiError(
                  'triggers.triggers.create.failed',
                  e,
                  'Create new trigger failed.',
                ))
              })
          })
          .catch(() => {
            reject(new Error('triggers.triggers.create.failed'))
          })
      })
    },

    edit({ commit, dispatch }, { id, data }) {
      const trigger = Trigger.find(id)

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, trigger)
        Object.assign(formattedData, data)

        delete formattedData.relationshipNames

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        Trigger.insertOrUpdate({
          data: dataFormatter.deserialize(jsonData),
        })
          .then(() => {
            commit(IO_SERVER_SET_SEMAPHORE, {
              type: 'update',
              id,
            })

            api.editTrigger(id, jsonData)
              .then(result => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'update',
                  id,
                })

                Trigger.insertOrUpdate({
                  data: mapTriggerResponse(dataFormatter.deserialize(result.data)),
                })
                  .then(() => {
                    // Entity was successfully updated in database
                    resolve()
                  })
                  .catch(() => {
                    reject(new Error('triggers.triggers.edit.failed'))
                  })
              })
              .catch(e => {
                commit(IO_SERVER_CLEAR_SEMAPHORE, {
                  type: 'update',
                  id,
                })

                Trigger.insertOrUpdate({
                  data: trigger,
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
                  'triggers.triggers.edit.failed',
                  e,
                  'Edit trigger failed.',
                ))
              })
          })
          .catch(() => {
            reject(new Error('triggers.triggers.edit.failed'))
          })
      })
    },

    remove({ commit, dispatch }, { id }) {
      const trigger = Trigger.find(id)

      return new Promise((resolve, reject) => {
        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'delete',
          id,
        })

        Trigger.delete(id)
          .then(() => {
            api.removeTrigger(id)
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

                Trigger.insertOrUpdate({
                  data: trigger,
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
                  'triggers.triggers.delete.failed',
                  e,
                  'Delete trigger failed.',
                ))
              })
          })
          .catch(() => {
            reject(new Error('triggers.triggers.delete.failed'))
          })
      })
    },

    /**
     * Mark trigger as locked for editing
     *
     * @param {Function} commit
     * @param {String} id
     */
    lockForEditing({ commit }, { id }) {
      commit(IO_SERVER_SET_SEMAPHORE, {
        type: 'openEdit',
        id,
      })
    },

    /**
     * Unlock trigger for updating
     *
     * @param {Function} commit
     * @param {String} id
     */
    unlockForEditing({ commit }, { id }) {
      commit(IO_SERVER_CLEAR_SEMAPHORE, {
        type: 'openEdit',
        id,
      })
    },

    /**
     * Move trigger detail from queue to state collection
     *
     * @param {Object} getters
     * @param {Function} dispatch
     * @param {String} id
     * @param {String} queue
     *
     * @returns {Promise<any>}
     */
    refreshFromQueue({ getters, dispatch }, { id, queue }) {
      return new Promise((resolve, reject) => {
        if (getters.isInQueue(id, queue)) {
          const backup = Trigger.find(id)

          api.getTrigger(id)
            .then(result => {
              Trigger.insertOrUpdate({
                data: mapTriggerResponse(dataFormatter.deserialize(result.data)),
              })
                .then(() => {
                  dispatch('removeFromQueue', {
                    id,
                    queue,
                  })
                    .then(() => {
                      // Entity was successfully refreshed from server
                      resolve()
                    })
                    .catch(() => {
                      Trigger.insertOrUpdate({
                        data: backup,
                      })
                        .catch(() => {
                          // Could not be restored to backup
                        })

                      reject(new Error('iot.triggers.refresh.failed'))
                    })
                })
                .catch(() => {
                  reject(new Error('triggers.triggers.refresh.failed'))
                })
            })
            .catch(e => {
              reject(new ApiError(
                'triggers.triggers.refresh.failed',
                e,
                'Refreshing trigger failed.',
              ))
            })
        } else {
          reject(new Error('triggers.triggers.refresh.failed'))
        }
      })
    },

    /**
     * Remove trigger from selected queue
     *
     * @param {Function} commit
     * @param {Object} getters
     * @param {String} id
     * @param {String} queue
     *
     * @returns {Promise<any>}
     */
    removeFromQueue({ commit, getters }, { id, queue }) {
      return new Promise((resolve, reject) => {
        if (getters.isInQueue(id, queue)) {
          commit(IO_SERVER_POP_FROM_QUEUE, {
            id,
            queue,
          })

          resolve()
        } else {
          reject(new Error('triggers.triggers.refresh.failed'))
        }
      })
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
     * @param {Array} state.semaphore.deleting
     * @param {Boolean} state.firstLoad
     * @param {Object} action
     * @param {String} action.type
     * @param {String} action.id
     */
    [IO_SERVER_SET_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'fetch':
          state.semaphore.fetching.items = true

          state.firstLoad = true
          break

        case 'get':
          state.semaphore.fetching.item.push(action.id)
          break

        case 'create':
          state.semaphore.creating.push(action.id)
          break

        case 'openEdit':
          // Process all semaphore items
          for (let key in state.semaphore.viewing) {
            key = parseInt(key, 10)

            // Check if item is stored or not...
            if (state.semaphore.viewing.hasOwnProperty(key) && state.semaphore.viewing[key] === action.id) {
              return
            }
          }

          state.semaphore.viewing.push(action.id)
          break

        case 'update':
          state.semaphore.updating.push(action.id)
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
     * @param {Object} state.semaphore.fetching
     * @param {Boolean} state.semaphore.fetching.items
     * @param {Array} state.semaphore.fetching.item
     * @param {Array} state.semaphore.creating
     * @param {Array} state.semaphore.updating
     * @param {Array} state.semaphore.deleting
     * @param {Object} action
     * @param {String} action.type
     * @param {String} action.id
     */
    [IO_SERVER_CLEAR_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'fetch':
          state.semaphore.fetching.items = false
          break

        case 'get':
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

        case 'update':
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

        case 'openEdit':
          // Process all semaphore items
          for (let key in state.semaphore.viewing) {
            key = parseInt(key, 10)

            // Find updated item in viewing semaphore...
            if (state.semaphore.viewing.hasOwnProperty(key) && state.semaphore.viewing[key] === action.id) {
              // ...and remove it
              state.semaphore.viewing.splice(key, 1)
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
     * Push new item into store queue collection
     *
     * @param {Object} state
     * @param {Object} state.queue
     * @param {Object} action
     * @param {String} action.queue
     * @param {String} action.id
     */
    [IO_SERVER_PUSH_INTO_QUEUE](state, action) {
      // Check if queue wes initialised
      if (!state.queue.hasOwnProperty(action.queue) || state.queue[action.queue] === null) {
        state.queue[action.queue] = []
      }

      // Push identifier into queue
      state.queue[action.queue].push(action.id)
    },

    /**
     * Pop out existing item from queue collection
     *
     * @param {Object} state
     * @param {Object} state.queue
     * @param {Object} action
     * @param {String} action.queue
     * @param {String} action.id
     */
    [IO_SERVER_POP_FROM_QUEUE](state, action) {
      // Check if queue wes initialised
      if (!state.queue.hasOwnProperty(action.queue) || state.queue[action.queue] === null) {
        return
      }

      for (let key in state.queue[action.queue]) {
        // Find deleted item in collection...
        if (state.queue[action.queue].hasOwnProperty(key) && state.queue[action.queue][key] === action.id) {
          key = parseInt(key, 10)

          // ...and remove it from collection
          state.queue[action.queue].splice(key, 1)
        }
      }
    },

  },

}
