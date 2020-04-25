import { ActionTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import uniq from 'lodash/uniq'

import Notification, {
  NotificationCreateInterface,
  NotificationUpdateInterface,
} from './Notification'
import Trigger, { TriggerInterface } from './Trigger'

import { ApiError } from './errors'

interface NotificationSemaphoreState {
  creating: Array<string>;
  updating: Array<string>;
  deleting: Array<string>;
}

interface NotificationState {
  semaphore: NotificationSemaphoreState;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

const moduleState: NotificationState = {

  semaphore: {
    creating: [],
    updating: [],
    deleting: [],
  },

}

const moduleActions: ActionTree<NotificationState, any> = {
  add({ commit }, payload: { trigger: TriggerInterface, data: NotificationCreateInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      const id = payload.data.id !== null && typeof payload.data.id === 'string' && payload.data.id !== '' ? payload.data.id : uuid.v4()

      const entity = payload.data
      entity.id = id
      entity.trigger_id = payload.trigger.id

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'create',
        id,
      })

      Notification.insert({
        data: entity,
      })
        .then((entities): void => {
          const dataFormatter = new Jsona()

          if (Object.prototype.hasOwnProperty.call(entities, 'notification') && Array.isArray(entities.notification)) {
            entities.notification
              .forEach((createdNotification): void => {
                Notification.api().post(
                  `/triggers-node/v1/triggers/${payload.trigger.id}/notifications`,
                  dataFormatter.serialize({
                    stuff: Object.assign({}, createdNotification, {
                      relationshipNames: ['trigger'],
                      trigger: {
                        type: payload.trigger.type,
                        id: payload.trigger.id,
                      },
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
                    // Entity was successfully created in database
                    resolve(createdNotification)
                  })
                  .catch((e: Error): void => {
                    commit('TRIGGERS_CLEAR_SEMAPHORE', {
                      type: 'create',
                      id,
                    })

                    Notification.delete(id)
                      .catch((): void => {
                        // Failed creating could not be removed
                      })

                    reject(new ApiError(
                      'triggers.notifications.create.failed',
                      e,
                      'Create new trigger notification failed.',
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

          Notification.delete(id)
            .catch((): void => {
              // Failed creating could not be removed
            })

          reject(new ApiError(
            'triggers.notifications.create.failed',
            e,
            'Create new trigger notification failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, data: NotificationUpdateInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('triggers.notifications.edit.inProgress'))

        return
      }

      const notification = Notification.find(payload.id)

      if (notification === null) {
        reject(new Error('triggers.notifications.edit.failed'))

        return
      }

      Notification.update({
        where: notification.id,
        data: payload.data,
      })
        .then((updatedNotification): void => {
          if (updatedNotification instanceof Notification) {
            const dataFormatter = new Jsona()

            Notification.api().patch(
              `/triggers-node/v1/triggers/${updatedNotification.trigger_id}/notifications/${updatedNotification.id}`,
              dataFormatter.serialize({
                stuff: Object.assign({}, updatedNotification, {
                  relationshipNames: [],
                }),
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('TRIGGERS_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedNotification.id,
                  })

                  return dataFormatter.deserialize(result.data)
                },
              },
            )
              .then((): void => {
                // Entity was successfully updated in database
                resolve(updatedNotification)
              })
              .catch((e: Error): void => {
                commit('TRIGGERS_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: updatedNotification.id,
                })

                Notification.update({
                  where: updatedNotification.id,
                  data: notification,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole list
                    Trigger.dispatch('fetch')
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'triggers.notifications.edit.failed',
                  e,
                  'Edit notification failed.',
                ))
              })
          }
        })
        .catch((e: Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: notification.id,
          })

          reject(new ApiError(
            'triggers.notifications.edit.failed',
            e,
            'Edit notification failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('triggers.notifications.delete.inProgress'))

        return
      }

      const notification = Notification.find(payload.id)

      if (notification === null) {
        reject(new Error('triggers.notifications.delete.failed'))

        return
      }

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'delete',
        id: notification.id,
      })

      Notification.delete(notification.id)
        .then((): void => {
          Notification.api().delete(
            `/triggers-node/v1/triggers/${notification.trigger_id}/notifications/${notification.id}`,
            {
              save: false,
            },
          )
            .then((): void => {
              commit('TRIGGERS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: notification.id,
              })

              // Entity was successfully deleted from database
              resolve()
            })
            .catch((e: Error): void => {
              commit('TRIGGERS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: notification.id,
              })

              Notification.insert({
                data: notification,
              })
                .catch((): void => {
                  // Replacing backup failed, we need to refresh whole list
                  Trigger.dispatch('fetch')
                    .catch((): void => {
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
        .catch((e: Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'delete',
            id: notification.id,
          })

          reject(new ApiError(
            'triggers.notifications.delete.failed',
            e,
            'Delete notification failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('TRIGGERS_RESET_STATE')
  },
}

const moduleMutations: MutationTree<NotificationState> = {
  /**
   * Set action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Array} state.semaphore.creating
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['TRIGGERS_SET_SEMAPHORE'](state: NotificationState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'create':
        state.semaphore.creating.push(action.id)

        // Make all keys uniq
        state.semaphore.creating = uniq(state.semaphore.creating)
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
   * @param {Array} state.semaphore.creating
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['TRIGGERS_CLEAR_SEMAPHORE'](state: NotificationState, action: SemaphoreAction): void {
    switch (action.type) {
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
            // Find created item in creating semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.updating.splice(index, 1)
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
   * Reset store to initial state
   *
   * @param {Object} state
   */
  ['TRIGGERS_RESET_STATE'](state: NotificationState) {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): NotificationState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
