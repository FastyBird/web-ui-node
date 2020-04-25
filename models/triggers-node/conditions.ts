import { ActionTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import uniq from 'lodash/uniq'

import Condition, {
  ConditionCreateInterface,
  ConditionUpdateInterface,
} from './Condition'
import Trigger, { TriggerInterface } from './Trigger'

import { ApiError } from './errors'

interface ConditionSemaphoreState {
  creating: Array<string>;
  updating: Array<string>;
  deleting: Array<string>;
}

interface ConditionState {
  semaphore: ConditionSemaphoreState;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

const moduleState: ConditionState = {

  semaphore: {
    creating: [],
    updating: [],
    deleting: [],
  },

}

const moduleActions: ActionTree<ConditionState, any> = {
  add({ commit }, payload: { trigger: TriggerInterface, data: ConditionCreateInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      const id = payload.data.id !== null && typeof payload.data.id === 'string' && payload.data.id !== '' ? payload.data.id : uuid.v4()

      const entity = payload.data
      entity.id = id
      entity.trigger_id = payload.trigger.id

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'create',
        id,
      })

      Condition.insert({
        data: entity,
      })
        .then((entities): void => {
          const dataFormatter = new Jsona()

          if (Object.prototype.hasOwnProperty.call(entities, 'condition') && Array.isArray(entities.condition)) {
            entities.condition
              .forEach((createdCondition): void => {
                Condition.api().post(
                  `/triggers-node/v1/triggers/${payload.trigger.id}/conditions`,
                  dataFormatter.serialize({
                    stuff: Object.assign({}, createdCondition, {
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
                    resolve(createdCondition)
                  })
                  .catch((e: Error): void => {
                    commit('TRIGGERS_CLEAR_SEMAPHORE', {
                      type: 'create',
                      id,
                    })

                    Condition.delete(id)
                      .catch((): void => {
                        // Failed creating could not be removed
                      })

                    reject(new ApiError(
                      'triggers.conditions.create.failed',
                      e,
                      'Create new trigger action failed.',
                    ))
                  })
              })
          }
        })
        .catch((e:Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'create',
            id,
          })

          Condition.delete(id)
            .catch((): void => {
              // Failed creating could not be removed
            })

          reject(new ApiError(
            'triggers.conditions.create.failed',
            e,
            'Create new trigger action failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, data: ConditionUpdateInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('triggers.conditions.edit.inProgress'))

        return
      }

      const condition = Condition.find(payload.id)

      if (condition === null) {
        reject(new Error('triggers.conditions.edit.failed'))

        return
      }

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'update',
        id: condition.id,
      })

      Condition.update({
        where: condition.id,
        data: payload.data,
      })
        .then((updatedCondition): void => {
          if (updatedCondition instanceof Condition) {
            const dataFormatter = new Jsona()

            Condition.api().patch(
              `/triggers-node/v1/triggers/${updatedCondition.trigger_id}/conditions/${updatedCondition.id}`,
              dataFormatter.serialize({
                stuff: Object.assign({}, updatedCondition, {
                  relationshipNames: [],
                }),
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('TRIGGERS_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedCondition.id,
                  })

                  return dataFormatter.deserialize(result.data)
                },
              },
            )
              .then((): void => {
                // Entity was successfully updated in database
                resolve(updatedCondition)
              })
              .catch((e: Error): void => {
                commit('TRIGGERS_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: updatedCondition.id,
                })

                Condition.update({
                  where: updatedCondition.id,
                  data: condition,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole list
                    Trigger.dispatch('fetch')
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'triggers.conditions.edit.failed',
                  e,
                  'Edit condition failed.',
                ))
              })
          }
        })
        .catch((e:Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: condition.id,
          })

          reject(new ApiError(
            'triggers.conditions.edit.failed',
            e,
            'Edit condition failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('triggers.conditions.delete.inProgress'))

        return
      }

      const condition = Condition.find(payload.id)

      if (condition === null) {
        reject(new Error('triggers.conditions.delete.failed'))

        return
      }

      commit('TRIGGERS_SET_SEMAPHORE', {
        type: 'delete',
        id: condition.id,
      })

      Condition.delete(condition.id)
        .then((): void => {
          Condition.api().delete(
            `/triggers-node/v1/triggers/${condition.trigger_id}/conditions/${condition.id}`,
            {
              save: false,
            },
          )
            .then((): void => {
              commit('TRIGGERS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: condition.id,
              })

              // Entity was successfully deleted from database
              resolve()
            })
            .catch((e: Error): void => {
              commit('TRIGGERS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: condition.id,
              })

              Condition.insert({
                data: condition,
              })
                .catch((): void => {
                  // Replacing backup failed, we need to refresh whole list
                  Trigger.dispatch('fetch')
                    .catch((): void => {
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
        .catch((e:Error): void => {
          commit('TRIGGERS_CLEAR_SEMAPHORE', {
            type: 'delete',
            id: condition.id,
          })

          reject(new ApiError(
            'triggers.conditions.delete.failed',
            e,
            'Delete condition failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('TRIGGERS_RESET_STATE')
  },
}

const moduleMutations: MutationTree<ConditionState> = {
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
  ['TRIGGERS_SET_SEMAPHORE'](state: ConditionState, action: SemaphoreAction): void {
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
  ['TRIGGERS_CLEAR_SEMAPHORE'](state: ConditionState, action: SemaphoreAction): void {
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
  ['TRIGGERS_RESET_STATE'](state: ConditionState) {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): ConditionState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
