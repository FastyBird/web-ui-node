import { ActionTree, GetterTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'

import Trigger, { TriggerCreateInterface, TriggerInterface } from './Trigger'

import Action, {
  ActionCreateInterface,
  CreateChannelPropertyActionInterface,
  CreateDevicePropertyActionInterface,
} from './Action'

import Condition, {
  ConditionCreateInterface,
  CreateDevicePropertyConditionInterface,
  CreateChannelPropertyConditionInterface,
  CreateDateConditionInterface,
  CreateTimeConditionInterface,
} from './Condition'

import Notification, {
  CreateEmailNotificationInterface,
  CreateSmsNotificationInterface,
  NotificationCreateInterface,
} from './Notification'

import { ApiError } from './errors'

import {
  TRIGGER_AUTOMATIC,
  TRIGGER_CHANNEL_PROPERTY,
  TRIGGER_MANUAL,
  TRIGGERS_ACTION_DEVICE_PROPERTY,
  TRIGGERS_ACTION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_DEVICE_PROPERTY,
  TRIGGERS_CONDITION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_DATE,
  TRIGGERS_CONDITION_TIME,
  TRIGGERS_NOTIFICATION_EMAIL,
  TRIGGERS_NOTIFICATION_SMS,
} from './types'

interface TriggerSemaphoreFetchingState {
  items: boolean;
  item: Array<string>;
}

interface TriggerSemaphoreState {
  fetching: TriggerSemaphoreFetchingState;
  creating: Array<string>;
  updating: Array<string>;
  deleting: Array<string>;
  viewing: Array<string>;
}

interface TriggerQueueState {
  update: Array<string>;
}

interface TriggerState {
  semaphore: TriggerSemaphoreState;
  firstLoad: boolean;
  queue: TriggerQueueState;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

interface QueueAction {
  id: string;
  queue: string;
}

const moduleState: TriggerState = {

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

function mapTriggerResponse(item: any): any {
  const mapped = cloneDeep(item)

  mapped.conditions = []

  if (Object.prototype.hasOwnProperty.call(item, 'conditions') && item.conditions.length) {
    for (const condition of item.conditions) {
      condition.trigger_id = item.id
      delete condition.trigger

      mapped.conditions.push(condition)
    }
  }

  mapped.actions = []

  if (Object.prototype.hasOwnProperty.call(item, 'actions') && item.actions.length) {
    for (const action of item.actions) {
      action.trigger_id = item.id
      delete action.trigger

      mapped.actions.push(action)
    }
  }

  mapped.notifications = []

  if (Object.prototype.hasOwnProperty.call(item, 'notifications') && item.notifications.length) {
    for (const notification of item.notifications) {
      notification.trigger_id = item.id
      delete notification.trigger

      mapped.notifications.push(notification)
    }
  }

  return mapped
}

function buildCreateDevicePropertyAction(data: any): CreateDevicePropertyActionInterface {
  return {
    id: uuid.v4(),
    type: data.type,
    enabled: data.enabled,

    device: data.device,
    property: data.property,
    value: data.value,
  }
}

function buildCreateChannelPropertyAction(data: any): CreateChannelPropertyActionInterface {
  return {
    id: uuid.v4(),
    type: data.type,
    enabled: data.enabled,

    device: data.device,
    channel: data.channel,
    property: data.property,
    value: data.value,
  }
}

function buildCreateDevicePropertyCondition(data: any): CreateDevicePropertyConditionInterface {
  return {
    id: uuid.v4(),
    type: data.type,
    enabled: data.enabled,

    operator: data.operator,
    operand: data.operand,
    device: data.device,
    property: data.property,
  }
}

function buildCreateChannelPropertyCondition(data: any): CreateChannelPropertyConditionInterface {
  return {
    id: uuid.v4(),
    type: data.type,
    enabled: data.enabled,

    operator: data.operator,
    operand: data.operand,
    device: data.device,
    channel: data.channel,
    property: data.property,
  }
}

function buildCreateDateCondition(data: any): CreateDateConditionInterface {
  return {
    id: uuid.v4(),
    type: data.type,
    enabled: data.enabled,

    date: data.date,
  }
}

function buildCreateTimeCondition(data: any): CreateTimeConditionInterface {
  return {
    id: uuid.v4(),
    type: data.type,
    enabled: data.enabled,

    time: data.time,
    days: data.days,
  }
}

function buildCreateSmsNotification(data: any): CreateSmsNotificationInterface {
  return {
    id: uuid.v4(),
    type: data.type,
    enabled: data.enabled,

    phone: data.phone,
  }
}

function buildCreateEmailNotification(data: any): CreateEmailNotificationInterface {
  return {
    id: uuid.v4(),
    type: data.type,
    enabled: data.enabled,

    email: data.email,
  }
}

const moduleGetters: GetterTree<TriggerState, any> = {
  /**
   * Check if trigger is locked for updating
   *
   * @param {Object} state
   *
   * @returns {Boolean}
   */
  isOpened: state => (id: string): boolean => {
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
  isInQueue: state => (id: string, queue: string): boolean => {
    if (queue === 'update') {
      const result = state.queue.update.find(triggerId => triggerId === id)

      return result !== null && typeof result !== 'undefined'
    }

    return false
  },

  firstLoadFinished: state => (): boolean => {
    return !!state.firstLoad
  },

  getting: state => (id: string): boolean => {
    return state.semaphore.fetching.item.includes(id)
  },

  fetching: state => (): boolean => {
    return state.semaphore.fetching.items
  },
}

const moduleActions: ActionTree<TriggerState, any> = {
  get({ state, commit, getters }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.item.includes(payload.id)) {
        resolve(false)
      } else {
        commit('TRIGGERS_SET_SEMAPHORE', {
          type: 'get',
          id: payload.id,
        })

        Trigger.api().get(`/triggers-node/v1/triggers/${payload.id}?include=conditions,actions,notifications`, {
          dataTransformer: (result: AxiosResponse): any | null => {
            commit('TRIGGERS_CLEAR_SEMAPHORE', {
              type: 'get',
              id: payload.id,
            })

            if (getters.isOpened(payload.id)) {
              if (!getters.isInQueue(payload.id, 'update')) {
                commit('TRIGGERS_PUSH_INTO_QUEUE', {
                  id: payload.id,
                  queue: 'update',
                })
              }

              return null
            } else {
              const dataFormatter = new Jsona()

              return mapTriggerResponse(dataFormatter.deserialize(result.data))
            }
          },
        })
          .then((): void => {
            // Entities were successfully fetched from server
            resolve(true)
          })
          .catch((e: Error): void => {
            commit('TRIGGERS_CLEAR_SEMAPHORE', {
              type: 'get',
              id: payload.id,
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

  fetch({ state, commit, getters }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.items) {
        resolve(true)
      } else {
        commit('TRIGGERS_SET_SEMAPHORE', {
          type: 'fetch',
        })

        Trigger.api().get('/triggers-node/v1/triggers?include=conditions,actions,notifications', {
          dataTransformer: (result: AxiosResponse): any | null => {
            const dataFormatter = new Jsona()

            const data = dataFormatter.deserialize(result.data)

            commit('TRIGGERS_CLEAR_SEMAPHORE', {
              type: 'fetch',
            })

            const insert = []

            // @ts-ignore
            for (const item of data) {
              if (getters.isOpened(item.id)) {
                if (!getters.isInQueue(item.id, 'update')) {
                  commit('TRIGGERS_PUSH_INTO_QUEUE', {
                    id: item.id,
                    queue: 'update',
                  })
                }
              } else {
                insert.push(mapTriggerResponse(item))
              }
            }

            return insert
          },
        })
          .then((): void => {
            // Entities were successfully fetched from server
            resolve(true)
          })
          .catch((e: Error): void => {
            commit('TRIGGERS_CLEAR_SEMAPHORE', {
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

  add({ commit }, payload: { automatic: boolean, channelProperty: boolean, manual: boolean, data: TriggerCreateInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      const actions: Array<ActionCreateInterface> = []
      const conditions: Array<ConditionCreateInterface> = []
      const notifications: Array<NotificationCreateInterface> = []

      for (const actionData of payload.data.actions) {
        if (actionData.type === TRIGGERS_ACTION_DEVICE_PROPERTY) {
          actions.push(buildCreateDevicePropertyAction(actionData))
        } else if (actionData.type === TRIGGERS_ACTION_CHANNEL_PROPERTY) {
          actions.push(buildCreateChannelPropertyAction(actionData))
        }
      }

      if (payload.automatic) {
        if (Object.prototype.hasOwnProperty.call(payload.data, 'conditions')) {
          // @ts-ignore
          for (const conditionData of payload.data.conditions) {
            if (conditionData.type === TRIGGERS_CONDITION_DEVICE_PROPERTY) {
              conditions.push(buildCreateDevicePropertyCondition(conditionData))
            } else if (conditionData.type === TRIGGERS_CONDITION_CHANNEL_PROPERTY) {
              conditions.push(buildCreateChannelPropertyCondition(conditionData))
            } else if (conditionData.type === TRIGGERS_CONDITION_DATE) {
              conditions.push(buildCreateDateCondition(conditionData))
            } else if (conditionData.type === TRIGGERS_CONDITION_TIME) {
              conditions.push(buildCreateTimeCondition(conditionData))
            }
          }
        }
      }

      if (!payload.channelProperty) {
        for (const notificationData of payload.data.notifications) {
          if (notificationData.type === TRIGGERS_NOTIFICATION_SMS) {
            notifications.push(buildCreateSmsNotification(notificationData))
          } else if (notificationData.type === TRIGGERS_NOTIFICATION_EMAIL) {
            notifications.push(buildCreateEmailNotification(notificationData))
          }
        }
      }

      const id = uuid.v4()

      const entity = payload.data

      entity.id = id
      entity.type = payload.automatic ? TRIGGER_AUTOMATIC : (payload.channelProperty ? TRIGGER_CHANNEL_PROPERTY : TRIGGER_MANUAL)

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'create',
        id,
      })

      Trigger.insert({
        data: Object.assign({}, entity, {
          actions: [],
          notifications: [],
          conditions: [],
        }),
      })
        .then((entities): void => {
          const dataFormatter = new Jsona()

          if (Object.prototype.hasOwnProperty.call(entities, 'trigger') && Array.isArray(entities.trigger)) {
            entities.trigger
              .forEach((createdTrigger): void => {
                Trigger.api().post(
                  '/triggers-node/v1/triggers',
                  dataFormatter.serialize({
                    stuff: Object.assign({}, createdTrigger, {
                      relationshipNames: [],
                    }),
                  }),
                  {
                    dataTransformer: (result: AxiosResponse): any | null => {
                      commit('TRIGGERS_CLEAR_SEMAPHORE', {
                        type: 'create',
                        id,
                      })

                      return dataFormatter.deserialize(result.data)
                    },
                  },
                )
                  .then((): void => {
                    const promises: Array<Promise<any>> = []

                    actions
                      .forEach((action: ActionCreateInterface): void => {
                        promises.push(
                          Action.dispatch('add', {
                            trigger: createdTrigger,
                            data: action,
                          }),
                        )
                      })

                    conditions
                      .forEach((condition: ConditionCreateInterface): void => {
                        promises.push(
                          Condition.dispatch('add', {
                            trigger: createdTrigger,
                            data: condition,
                          }),
                        )
                      })

                    notifications
                      .forEach((notification: NotificationCreateInterface): void => {
                        promises.push(
                          Notification.dispatch('add', {
                            trigger: createdTrigger,
                            data: notification,
                          }),
                        )
                      })

                    Promise.all(promises)
                      .then((): void => {
                        // Entity was successfully created in database
                        resolve(createdTrigger)
                      })
                      .catch((e: Error): void => {
                        // Everything failed, remove created trigger with all relations
                        Trigger.dispatch('remove', {
                          id: get(createdTrigger, 'id'),
                        })
                          .catch((): void => {
                            // Failed creating could not be removed
                          })

                        reject(new ApiError(
                          'triggers.triggers.create.failed',
                          e,
                          'Create new trigger failed.',
                        ))
                      })
                  })
                  .catch((e: Error): void => {
                    commit('TRIGGERS_CLEAR_SEMAPHORE', {
                      type: 'create',
                      id,
                    })

                    Trigger.delete(get(createdTrigger, 'id'))
                      .catch((): void => {
                        // Failed creating could not be removed
                      })

                    reject(new ApiError(
                      'triggers.triggers.create.failed',
                      e,
                      'Create new trigger failed.',
                    ))
                  })
              })
          }
        })
        .catch((e: Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'create',
            id,
          })

          Trigger.delete(id)
            .catch((): void => {
              // Failed creating could not be removed
            })

          reject(new ApiError(
            'triggers.triggers.create.failed',
            e,
            'Create new trigger failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, data: any }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('triggers.triggers.update.inProgress'))

        return
      }

      const trigger = Trigger.find(payload.id)

      if (trigger === null) {
        reject(new Error('triggers.triggers.update.failed'))

        return
      }

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'update',
        id: trigger.id,
      })

      Trigger.update({
        where: trigger.id,
        data: payload.data,
      })
        .then((updatedTrigger): void => {
          if (updatedTrigger instanceof Trigger) {
            const dataFormatter = new Jsona()

            Trigger.api().patch(
              `/triggers-node/v1/triggers/${updatedTrigger.id}`,
              dataFormatter.serialize({
                stuff: Object.assign({}, updatedTrigger, {
                  relationshipNames: [],
                }),
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('TRIGGERS_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedTrigger.id,
                  })

                  return dataFormatter.deserialize(result.data)
                },
              },
            )
              .then((): void => {
                // Entity was successfully updated in database
                resolve(updatedTrigger)
              })
              .catch((e: Error): void => {
                commit('TRIGGERS_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: trigger.id,
                })

                Trigger.update({
                  where: trigger.id,
                  data: trigger,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole list
                    Trigger.dispatch('fetch')
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'triggers.triggers.edit.failed',
                  e,
                  'Edit trigger failed.',
                ))
              })
          }
        })
        .catch((e: Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: trigger.id,
          })

          reject(new ApiError(
            'triggers.triggers.edit.failed',
            e,
            'Edit trigger failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('triggers.triggers.delete.inProgress'))

        return
      }

      const trigger = Trigger.find(payload.id)

      if (trigger === null) {
        reject(new Error('triggers.triggers.delete.failed'))

        return
      }

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'delete',
        id: trigger.id,
      })

      Trigger.delete(trigger.id)
        .then((): void => {
          Trigger.api().delete(
            `/triggers-node/v1/triggers/${trigger.id}`,
            {
              save: false,
            },
          )
            .then((): void => {
              commit('TRIGGERS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: trigger.id,
              })

              // Entity was successfully deleted from database
              resolve()
            })
            .catch((e: Error): void => {
              commit('TRIGGERS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: trigger.id,
              })

              Trigger.insert({
                data: trigger,
              })
                .catch((): void => {
                  // Replacing backup failed, we need to refresh whole list
                  Trigger.dispatch('fetch')
                    .catch((): void => {
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
        .catch((e: Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'delete',
            id: trigger.id,
          })

          reject(new ApiError(
            'triggers.triggers.delete.failed',
            e,
            'Delete trigger failed.',
          ))
        })
    })
  },

  lockForEditing({ commit }, payload: { id: string }): void {
    commit('TRIGGERS_SET_SEMAPHORE', {
      type: 'viewing',
      id: payload.id,
    })
  },

  unlockForEditing({ commit }, payload: { id: string }): void {
    commit('TRIGGERS_CLEAR_SEMAPHORE', {
      type: 'viewing',
      id: payload.id,
    })
  },

  refreshFromQueue({ getters }, payload: { id: string, queue: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (getters.isInQueue(payload.id, payload.queue)) {
        const backup = Trigger.find(payload.id)

        if (backup === null) {
          reject(new Error('triggers.triggers.delete.failed'))

          return
        }

        Trigger.api().get(`/triggers-node/v1/triggers/${payload.id}?include=conditions,actions,notifications`, {
          dataTransformer: (result: AxiosResponse): any | null => {
            const dataFormatter = new Jsona()

            return mapTriggerResponse(dataFormatter.deserialize(result.data))
          },
        })
          .then((): void => {
            Trigger.dispatch('removeFromQueue', {
              id: payload.id,
              queue: payload.queue,
            })
              .then((): void => {
                // Entity was successfully refreshed from server
                resolve()
              })
              .catch((e: Error): void => {
                Trigger.insertOrUpdate({
                  data: backup,
                })
                  .catch((): void => {
                    // Could not be restored to backup
                  })

                reject(new ApiError(
                  'triggers.triggers.refresh.failed',
                  e,
                  'Refreshing trigger failed.',
                ))
              })
          })
          .catch((e: Error): void => {
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

  removeFromQueue({ commit, getters }, payload: { id: string, queue: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (getters.isInQueue(payload.id, payload.queue)) {
        commit('TRIGGERS_POP_FROM_QUEUE', {
          id: payload.id,
          queue: payload.queue,
        })

        resolve()
      } else {
        reject(new Error('triggers.triggers.refresh.failed'))
      }
    })
  },

  reset({ commit }): void {
    commit('TRIGGERS_RESET_STATE')

    Action.dispatch('reset')

    Condition.dispatch('reset')

    Notification.dispatch('reset')
  },
}

const moduleMutations: MutationTree<TriggerState> = {
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
  ['TRIGGERS_SET_SEMAPHORE'](state: TriggerState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'fetch':
        state.semaphore.fetching.items = true

        state.firstLoad = true
        break

      case 'get':
        state.semaphore.fetching.item.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
        break

      case 'create':
        state.semaphore.creating.push(action.id)

        // Make all keys uniq
        state.semaphore.creating = uniq(state.semaphore.creating)
        break

      case 'viewing':
        state.semaphore.viewing.push(action.id)

        // Make all keys uniq
        state.semaphore.viewing = uniq(state.semaphore.viewing)
        break

      case 'update':
        state.semaphore.updating.push(action.id)

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break

      case 'delete':
        state.semaphore.deleting.push(action.id)

        // Make all keys uniq
        state.semaphore.deleting = uniq(state.semaphore.deleting)
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
  ['TRIGGERS_CLEAR_SEMAPHORE'](state: TriggerState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'fetch':
        state.semaphore.fetching.items = false
        break

      case 'get':
        // Process all semaphore items
        state.semaphore.fetching.item
          .forEach((item: string, index: number): void => {
            // Find created item in reading one item semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.fetching.item.splice(index, 1)
            }
          })
        break

      case 'create':
        // Process all semaphore items
        state.semaphore.creating
          .forEach((item: string, index: number): void => {
            // Find created item in creating semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.creating.splice(index, 1)
            }
          })
        break

      case 'update':
        // Process all semaphore items
        state.semaphore.updating
          .forEach((item: string, index: number): void => {
            // Find created item in updating semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.updating.splice(index, 1)
            }
          })
        break

      case 'viewing':
        // Process all semaphore items
        state.semaphore.viewing
          .forEach((item: string, index: number): void => {
            // Find created item in viewing semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.viewing.splice(index, 1)
            }
          })
        break

      case 'delete':
        // Process all semaphore items
        state.semaphore.deleting
          .forEach((item: string, index: number): void => {
            // Find removed item in removing semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.deleting.splice(index, 1)
            }
          })
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
  ['TRIGGERS_PUSH_INTO_QUEUE'](state: TriggerState, action: QueueAction): void {
    if (action.queue === 'update') {
      // Push identifier into queue
      state.queue.update.push(action.id)
    }
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
  ['TRIGGERS_POP_FROM_QUEUE'](state: TriggerState, action: QueueAction): void {
    if (action.queue === 'update') {
      for (const key in state.queue.update) {
        // Find deleted item in collection...
        if (Object.prototype.hasOwnProperty.call(state.queue.update, key) && state.queue.update[key] === action.id) {
          const position = parseInt(key, 10)

          // ...and remove it from collection
          state.queue.update.splice(position, 1)
        }
      }
    }
  },

  /**
   * Reset store to initial state
   *
   * @param {Object} state
   */
  ['TRIGGERS_RESET_STATE'](state: TriggerState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): TriggerState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
