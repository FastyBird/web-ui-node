import { ActionTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import uniq from 'lodash/uniq'

import Action, {
  ActionCreateInterface,
  ActionUpdateInterface,
} from './Action'
import Trigger, { TriggerInterface } from './Trigger'

import { ApiError } from './errors'

interface ActionSemaphoreState {
  creating: Array<string>;
  updating: Array<string>;
  deleting: Array<string>;
}

interface ActionState {
  semaphore: ActionSemaphoreState;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

const moduleState: ActionState = {

  semaphore: {
    creating: [],
    updating: [],
    deleting: [],
  },

}

const moduleActions: ActionTree<ActionState, any> = {
  add({ commit }, payload: { trigger: TriggerInterface, data: ActionCreateInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      const id = payload.data.id !== null && typeof payload.data.id === 'string' && payload.data.id !== '' ? payload.data.id : uuid.v4()

      const entity = payload.data
      entity.id = id
      entity.trigger_id = payload.trigger.id

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'create',
        id,
      })

      Action.insert({
        data: entity,
      })
        .then((entities): void => {
          const dataFormatter = new Jsona()

          if (Object.prototype.hasOwnProperty.call(entities, 'action') && Array.isArray(entities.action)) {
            entities.action
              .forEach((createdAction): void => {
                Action.api().post(
                  `/triggers-node/v1/triggers/${payload.trigger.id}/actions`,
                  dataFormatter.serialize({
                    stuff: Object.assign({}, createdAction, {
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
                    resolve(createdAction)
                  })
                  .catch((e: Error): void => {
                    commit('TRIGGERS_CLEAR_SEMAPHORE', {
                      type: 'create',
                      id,
                    })

                    Action.delete(id)
                      .catch((): void => {
                        // Failed creating could not be removed
                      })

                    reject(new ApiError(
                      'triggers.actions.create.failed',
                      e,
                      'Create new trigger action failed.',
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

          Action.delete(id)
            .catch((): void => {
              // Failed creating could not be removed
            })

          reject(new ApiError(
            'triggers.actions.create.failed',
            e,
            'Create new trigger action failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, data: ActionUpdateInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('triggers.actions.update.inProgress'))

        return
      }

      const action = Action.find(payload.id)

      if (action === null) {
        reject(new Error('triggers.actions.edit.failed'))

        return
      }

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'update',
        id: action.id,
      })

      Action.update({
        where: action.id,
        data: payload.data,
      })
        .then((updatedAction): void => {
          if (updatedAction instanceof Action) {
            const dataFormatter = new Jsona()

            Action.api().patch(
              `/triggers-node/v1/triggers/${updatedAction.trigger_id}/actions/${updatedAction.id}`,
              dataFormatter.serialize({
                stuff: Object.assign({}, updatedAction, {
                  relationshipNames: [],
                }),
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('TRIGGERS_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedAction.id,
                  })

                  return dataFormatter.deserialize(result.data)
                },
              },
            )
              .then((): void => {
                // Entity was successfully updated in database
                resolve(updatedAction)
              })
              .catch((e: Error): void => {
                commit('TRIGGERS_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: updatedAction.id,
                })

                Action.update({
                  where: updatedAction.id,
                  data: action,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole list
                    Trigger.dispatch('fetch')
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'triggers.actions.edit.failed',
                  e,
                  'Edit action failed.',
                ))
              })
          }
        })
        .catch((e: Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: action.id,
          })

          reject(new ApiError(
            'triggers.actions.edit.failed',
            e,
            'Edit action failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('triggers.actions.delete.inProgress'))

        return
      }

      const action = Action.find(payload.id)

      if (action === null) {
        reject(new Error('triggers.actions.delete.failed'))

        return
      }

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'delete',
        id: action.id,
      })

      Action.delete(action.id)
        .then((): void => {
          Action.api().delete(
            `/triggers-node/v1/triggers/${action.trigger_id}/actions/${action.id}`,
            {
              save: false,
            },
          )
            .then((): void => {
              commit('TRIGGERS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: action.id,
              })

              // Entity was successfully deleted from database
              resolve()
            })
            .catch((e: Error): void => {
              commit('TRIGGERS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: action.id,
              })

              Action.insert({
                data: action,
              })
                .catch((): void => {
                  // Replacing backup failed, we need to refresh whole list
                  Trigger.dispatch('fetch')
                    .catch((): void => {
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
        .catch((e: Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'delete',
            id: action.id,
          })

          reject(new ApiError(
            'triggers.actions.delete.failed',
            e,
            'Delete action failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('TRIGGERS_RESET_STATE')
  },
}

const moduleMutations: MutationTree<ActionState> = {
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
  ['TRIGGERS_SET_SEMAPHORE'](state: ActionState, action: SemaphoreAction): void {
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
  ['TRIGGERS_CLEAR_SEMAPHORE'](state: ActionState, action: SemaphoreAction): void {
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
  ['TRIGGERS_RESET_STATE'](state: ActionState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): ActionState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
