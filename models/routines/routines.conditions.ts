import { ActionTree, MutationTree } from 'vuex'
import get from 'lodash/get'
import filter from 'lodash/filter'
import uniq from 'lodash/uniq'

import { ModelError } from '~/models/errors'

import Routine, { RoutineInterface } from '~/models/routines/Routine'
import RoutineCondition, {
  CreateRoutineConditionInterface,
  UpdateRoutineConditionInterface,
  RoutineConditionInterface,
} from '~/models/routines/RoutineCondition'
import RoutineConditionProperty from '~/models/routines/RoutineConditionProperty'
import Condition, { ConditionInterface } from '~/models/triggers-node/Condition'

import { TRIGGERS_CONDITION_CHANNEL_PROPERTY } from '~/models/triggers-node/types'

interface RoutineConditionSemaphoreState {
  fetching: {
    items: boolean,
    item: Array<string>
  }
  updating: Array<string>
  deleting: Array<string>
}

interface RoutineConditionState {
  semaphore: RoutineConditionSemaphoreState;
}

interface SemaphoreCondition {
  id: string;
  type: string;
}

const moduleState: RoutineConditionState = {
  semaphore: {
    fetching: {
      items: false,
      item: [],
    },
    updating: [],
    deleting: [],
  },
}

const moduleActions: ActionTree<RoutineConditionState, any> = {
  add({ state, commit }, payload: { routine: RoutineInterface, data: CreateRoutineConditionInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (payload.routine.trigger === null || typeof payload.routine.trigger === 'undefined') {
        reject(new Error('routines.conditions.create.invalid'))

        return
      }

      const existingCondition = payload.routine.conditions
        .find(item => (item.device === payload.data.device && item.channel === payload.data.channel))

      if (typeof existingCondition !== 'undefined') {
        reject(new Error('routines.conditions.create.invalid'))

        return
      }

      const promises: Array<Promise<any>> = []

      const createdConditions: Array<ConditionInterface> = []

      payload.data.rows
        .forEach((row): void => {
          promises.push(
            Condition.dispatch('add', {
              trigger: payload.routine.trigger,
              data: {
                id: null,
                type: TRIGGERS_CONDITION_CHANNEL_PROPERTY,
                device: payload.data.device,
                channel: payload.data.channel,
                property: row.property,
                operator: row.operator,
                operand: row.operand,
              },
            })
              .then((condition: ConditionInterface): void => {
                createdConditions.push(condition)
              })
              .catch((e): void => {
                reject(new ModelError(
                  'routines.conditions.create.failed',
                  Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
                  'Create new routine condition failed.',
                ))
              }),
          )
        })

      Promise.all(promises)
        .then((): void => {
          const conditions: Array<RoutineConditionInterface> = []

          createdConditions
            .forEach((condition: ConditionInterface): void => {
              if (
                condition.isChannelProperty &&
                typeof conditions.find(storedCondition => (storedCondition.device === condition.device && storedCondition.channel === condition.channel)) === 'undefined'
              ) {
                if (
                  condition.device !== null &&
                  condition.channel !== null &&
                  condition.property !== null
                ) {
                  conditions.push({
                    id: `${condition.device}-${condition.channel}-${condition.trigger_id}`,
                    device: condition.device,
                    channel: condition.channel,
                    deleted: false,

                    routine_id: condition.trigger_id,
                    routine: null,

                    rows: [],
                  })
                }
              }
            })

          for (const i in conditions) {
            if (Object.prototype.hasOwnProperty.call(conditions, i)) {
              filter(createdConditions, { device: conditions[i].device, channel: conditions[i].channel })
                .forEach((condition: ConditionInterface): void => {
                  conditions[i].rows.push({
                    id: condition.id,
                    routine_condition_id: conditions[i].id,

                    operator: condition.operator,
                    operand: condition.operand,
                    property: condition.property,
                    enabled: condition.enabled,

                    condition: null,
                  })
                })
            }
          }

          RoutineCondition.insert({
            data: conditions,
          })
            .then((): void => {
              resolve()
            })
            .catch((e: Error): void => {
              reject(new ModelError(
                'routines.conditions.create.failed',
                e,
                'Create new routine condition failed.',
              ))
            })
        })
        .catch((e: Error): void => {
          reject(new ModelError(
            'routines.conditions.create.failed',
            Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
            'Create new routine condition failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, data: UpdateRoutineConditionInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('routines.conditions.update.inProgress'))

        return
      }

      const routineCondition = RoutineCondition
        .query()
        .with('rows')
        .with('rows.condition')
        .where('id', payload.id)
        .first()

      if (routineCondition === null) {
        reject(new Error('routines.conditions.edit.failed'))

        return
      }

      const routine = Routine
        .query()
        .with('trigger')
        .where('trigger_id', routineCondition.routine_id)
        .first()

      if (routine === null) {
        reject(new Error('routines.conditions.edit.failed'))

        return
      }

      commit('ROUTINES_CONDITIONS_SET_SEMAPHORE', {
        type: 'update',
        id: routineCondition.id,
      })

      const promises: Array<Promise<any>> = []

      payload.data.rows
        .forEach((row): void => {
          const condition = Condition
            .query()
            .where('device', routineCondition.device)
            .where('channel', routineCondition.channel)
            .where('property', row.property)
            .where('trigger_id', routineCondition.routine_id)
            .first()

          if (condition === null) {
            promises.push(
              Condition.dispatch('add', {
                trigger: routine.trigger,
                data: {
                  id: null,
                  type: TRIGGERS_CONDITION_CHANNEL_PROPERTY,
                  device: routineCondition.device,
                  channel: routineCondition.channel,
                  property: row.property,
                  operator: row.operator,
                  operand: row.operand,
                },
              })
                .then((createdCondition: ConditionInterface): void => {
                  RoutineConditionProperty.insert({
                    data: {
                      id: createdCondition.id,
                      routine_condition_id: routineCondition.id,
                    },
                  })
                }),
            )
          } else {
            promises.push(
              Condition.dispatch('edit', {
                id: condition.id,
                data: {
                  device: routineCondition.device,
                  channel: routineCondition.channel,
                  property: row.property,
                  operator: row.operator,
                  operand: row.operand,
                },
              }),
            )
          }
        })

      routineCondition.rows
        .forEach((row): void => {
          if (typeof payload.data.rows.find(({ property }): boolean => property === row.property) === 'undefined') {
            promises.push(
              RoutineConditionProperty.delete(row.id)
                .then((): void => {
                  Condition.dispatch('remove', {
                    id: row.id,
                  })
                }),
            )
          }
        })

      Promise.all(promises)
        .then((): void => {
          commit('ROUTINES_CONDITIONS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: routineCondition.id,
          })

          resolve()
        })
        .catch((e: Error): void => {
          commit('ROUTINES_CONDITIONS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: routineCondition.id,
          })

          reject(new ModelError(
            'routines.actions.create.failed',
            Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
            'Update routine condition failed.',
          ))
        })
    })
  },

  toggleState({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('routines.conditions.state.inProgress'))

        return
      }

      const condition = RoutineCondition
        .query()
        .with('rows')
        .with('rows.condition')
        .where('id', payload.id)
        .first()

      if (condition === null) {
        reject(new Error('routines.conditions.state.failed'))

        return
      }

      commit('ROUTINES_CONDITIONS_SET_SEMAPHORE', {
        type: 'update',
        id: condition.id,
      })

      const promises: Array<Promise<any>> = []

      condition.rows
        .forEach((conditionProperty): void => {
          promises.push(Condition.dispatch('edit', {
            id: conditionProperty.id,
            data: {
              enabled: !condition.enabled,
            },
          }))
        })

      Promise.all(promises)
        .then((): void => {
          commit('ROUTINES_CONDITIONS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: condition.id,
          })

          // Entity was successfully deleted with all connected entities
          resolve()
        })
        .catch((e: Error): void => {
          commit('ROUTINES_CONDITIONS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: condition.id,
          })

          reject(new ModelError(
            'routines.conditions.state.failed',
            Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
            'Delete routine condition failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('routines.conditions.delete.inProgress'))

        return
      }

      const condition = RoutineCondition
        .query()
        .with('rows')
        .with('rows.condition')
        .where('id', payload.id)
        .first()

      if (condition === null) {
        reject(new Error('routines.conditions.delete.failed'))

        return
      }

      RoutineCondition
        .update({
          where: condition.id,
          data: {
            deleted: true,
          },
        })
        .then((): void => {
          commit('ROUTINES_CONDITIONS_SET_SEMAPHORE', {
            type: 'delete',
            id: condition.id,
          })

          const promises: Array<Promise<any>> = []

          condition.rows
            .forEach((conditionProperty): void => {
              promises.push(
                Condition.dispatch('remove', {
                  id: conditionProperty.id,
                })
                  .then((): void => {
                    RoutineConditionProperty.delete(conditionProperty.id)
                  }),
              )
            })

          Promise.all(promises)
            .then((): void => {
              RoutineCondition.delete(condition.id)
                .then((): void => {
                  commit('ROUTINES_CONDITIONS_CLEAR_SEMAPHORE', {
                    type: 'delete',
                    id: condition.id,
                  })

                  // Entity was successfully deleted with all connected entities
                  resolve()
                })
                .catch((e: Error): void => {
                  commit('ROUTINES_CONDITIONS_CLEAR_SEMAPHORE', {
                    type: 'delete',
                    id: condition.id,
                  })

                  reject(new ModelError(
                    'routines.conditions.delete.failed',
                    e,
                    'Delete routine condition failed.',
                  ))
                })
            })
            .catch((e: Error): void => {
              commit('ROUTINES_CONDITIONS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: condition.id,
              })

              reject(new ModelError(
                'routines.conditions.delete.failed',
                Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
                'Delete routine condition failed.',
              ))
            })
        })
        .catch((): void => {
          reject(new Error('routines.conditions.state.failed'))
        })
    })
  },
}

const moduleMutations: MutationTree<RoutineConditionState> = {
  /**
   * Set condition processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Boolean} state.firstLoad
   * @param {Object} condition
   * @param {String} condition.type
   * @param {String} condition.id
   */
  ['ROUTINES_CONDITIONS_SET_SEMAPHORE'](state: RoutineConditionState, condition: SemaphoreCondition): void {
    switch (condition.type) {
      case 'update':
        state.semaphore.updating.push(condition.id)

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break

      case 'delete':
        state.semaphore.deleting.push(condition.id)

        // Make all keys uniq
        state.semaphore.deleting = uniq(state.semaphore.deleting)
        break
    }
  },

  /**
   * Reset condition processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} condition
   * @param {String} condition.type
   * @param {String} condition.id
   */
  ['ROUTINES_CONDITIONS_CLEAR_SEMAPHORE'](state: RoutineConditionState, condition: SemaphoreCondition): void {
    switch (condition.type) {
      case 'update':
        // Process all semaphore items
        state.semaphore.updating
          .forEach((item: string, index: number): void => {
            // Find created item in updating semaphore...
            if (item === condition.id) {
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
            if (item === condition.id) {
              // ...and remove it
              state.semaphore.deleting.splice(index, 1)
            }
          })
        break
    }
  },
}

export default {
  state: (): RoutineConditionState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
