import { GetterTree, ActionTree, MutationTree } from 'vuex'
import get from 'lodash/get'
import filter from 'lodash/filter'
import uniq from 'lodash/uniq'

import { ModelError } from '~/models/errors'

import Trigger, { TriggerInterface } from '~/models/triggers-node/Trigger'
import { ConditionInterface } from '~/models/triggers-node/Condition'
import { ActionInterface } from '~/models/triggers-node/Action'
import Routine, { RoutineInterface } from '~/models/routines/Routine'
import RoutineAction, { RoutineActionInterface } from '~/models/routines/RoutineAction'
import RoutineActionProperty, { RoutineActionPropertyInterface } from '~/models/routines/RoutineActionProperty'
import RoutineCondition, { RoutineConditionInterface } from '~/models/routines/RoutineCondition'
import RoutineConditionProperty, { RoutineConditionPropertyInterface } from '~/models/routines/RoutineConditionProperty'
import RoutineSchedule from '~/models/routines/RoutineSchedule'

interface RoutineSemaphoreState {
  fetching: {
    items: boolean,
    item: Array<string>
  }
  updating: Array<string>
  deleting: Array<string>
}

interface RoutineState {
  semaphore: RoutineSemaphoreState;
  firstLoad: boolean;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

function mapTrigger(trigger: TriggerInterface): any | null {
  if (trigger.isForChannel) {
    return null
  }

  const routine: RoutineInterface = {
    trigger_id: trigger.id,
    conditions: [],
    actions: [],
    schedule: null,
  }

  const conditions: Array<RoutineConditionInterface> = []

  trigger.conditions
    .forEach((condition: ConditionInterface): void => {
      if (
        condition.isChannelProperty &&
        typeof conditions.find(storedCondition => (storedCondition.device === condition.device && storedCondition.channel === condition.channel)) === 'undefined'
      ) {
        if (condition.device !== null && condition.channel !== null) {
          conditions.push({
            id: `${condition.device}-${condition.channel}-${trigger.id}`,
            device: condition.device,
            channel: condition.channel,
            deleted: false,
            routine_id: trigger.id,
            rows: [],
            routine: null,
          })
        }
      } else if (condition.isDate || condition.isTime) {
        routine.schedule = {
          id: condition.id,
          routine_id: trigger.id,
          routine: null,
          condition: null,
        }
      }
    })

  for (const i in conditions) {
    if (Object.prototype.hasOwnProperty.call(conditions, i)) {
      filter(trigger.conditions, { device: conditions[i].device, channel: conditions[i].channel })
        .forEach((condition: ConditionInterface): void => {
          if (
            condition.isChannelProperty &&
            condition.property !== null && condition.operand !== null && condition.operator !== null
          ) {
            conditions[i].rows.push({
              id: condition.id,
              routine_condition_id: conditions[i].id,
              condition: null,
              operator: condition.operator,
              operand: condition.operand,
              property: condition.property,
              enabled: condition.enabled,
            })
          }
        })
    }
  }

  routine.conditions = conditions

  const actions: Array<RoutineActionInterface> = []

  trigger.actions
    .forEach((action: ActionInterface): void => {
      if (
        action.isChannelProperty &&
        typeof actions.find(storedAction => (storedAction.device === action.device && storedAction.channel === action.channel)) === 'undefined'
      ) {
        if (
          action.device !== null &&
          action.channel !== null &&
          action.property !== null
        ) {
          actions.push({
            id: `${action.device}-${action.channel}-${trigger.id}`,
            device: action.device,
            channel: action.channel,
            deleted: false,

            routine_id: trigger.id,
            routine: null,

            rows: [],
          })
        }
      }
    })

  for (const i in actions) {
    if (Object.prototype.hasOwnProperty.call(actions, i)) {
      filter(trigger.actions, { device: actions[i].device, channel: actions[i].channel })
        .forEach((action: ActionInterface): void => {
          actions[i].rows.push({
            id: action.id,
            routine_action_id: actions[i].id,

            operation: action.value,
            property: action.property,
            enabled: action.enabled,

            action: null,
          })
        })
    }
  }

  routine.actions = actions

  return routine
}

const moduleState: RoutineState = {
  semaphore: {
    fetching: {
      items: false,
      item: [],
    },
    updating: [],
    deleting: [],
  },

  firstLoad: false,
}

const moduleGetters: GetterTree<RoutineState, any> = {
  firstLoadFinished: state => (): boolean => {
    return state.firstLoad
  },

  getting: state => (id: string): boolean => {
    return state.semaphore.fetching.item.includes(id)
  },

  fetching: state => (): boolean => {
    return state.semaphore.fetching.items
  },
}

const moduleActions: ActionTree<RoutineState, any> = {
  get({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.item.includes(payload.id)) {
        resolve(false)
      } else {
        commit('ROUTINES_SET_SEMAPHORE', {
          type: 'get',
          id: payload.id,
        })

        let trigger = Trigger
          .query()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .where('id', payload.id)
          .first()

        if (trigger === null) {
          Trigger.dispatch('fetch')
            .then((): void => {
              trigger = Trigger
                .query()
                .with('actions')
                .with('conditions')
                .with('notifications')
                .where('id', payload.id)
                .first()

              if (trigger) {
                const insertData: any | null = mapTrigger(trigger)

                Routine.insertOrUpdate({
                  data: insertData,
                })
                  .then((): void => {
                    commit('ROUTINES_CLEAR_SEMAPHORE', {
                      type: 'get',
                    })

                    resolve(true)
                  })
                  .catch((e): void => {
                    commit('ROUTINES_CLEAR_SEMAPHORE', {
                      type: 'get',
                    })

                    reject(new ModelError(
                      'routines.routines.fetch.failed',
                      e,
                      'Fetching routines failed.',
                    ))
                  })
              } else {
                resolve(true)
              }
            })
            .catch((e): void => {
              commit('ROUTINES_CLEAR_SEMAPHORE', {
                type: 'get',
                id: payload.id,
              })

              reject(new ModelError(
                'routines.routines.get.failed',
                Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
                'Fetching routine failed.',
              ))
            })
        } else {
          const insertData: any | null = mapTrigger(trigger)

          Routine.insertOrUpdate({
            data: insertData,
          })
            .then((): void => {
              commit('ROUTINES_CLEAR_SEMAPHORE', {
                type: 'get',
              })

              resolve(true)
            })
            .catch((e): void => {
              commit('ROUTINES_CLEAR_SEMAPHORE', {
                type: 'get',
              })

              reject(new ModelError(
                'routines.routines.fetch.failed',
                e,
                'Fetching routines failed.',
              ))
            })
        }
      }
    })
  },

  fetch({ state, commit }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.items) {
        resolve(false)
      } else {
        commit('ROUTINES_SET_SEMAPHORE', {
          type: 'fetch',
        })

        Trigger.dispatch('fetch', {
          include_channels: true,
        })
          .then((): void => {
            const triggers = Trigger
              .query()
              .with('actions')
              .with('conditions')
              .with('notifications')
              .get()

            const insertData: any = []

            triggers.forEach((trigger: Trigger): void => {
              const mapped = mapTrigger(trigger)

              if (mapped !== null) {
                insertData.push(mapped)
              }
            })

            Routine.insertOrUpdate({
              data: insertData,
            })
              .then((): void => {
                commit('ROUTINES_CLEAR_SEMAPHORE', {
                  type: 'fetch',
                })

                resolve(true)
              })
              .catch((e): void => {
                commit('ROUTINES_CLEAR_SEMAPHORE', {
                  type: 'fetch',
                })

                reject(new ModelError(
                  'routines.routines.fetch.failed',
                  e,
                  'Fetching routines failed.',
                ))
              })
          })
          .catch((e): void => {
            commit('ROUTINES_CLEAR_SEMAPHORE', {
              type: 'fetch',
            })

            reject(new ModelError(
              'routines.routines.fetch.failed',
              Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
              'Fetching routines failed.',
            ))
          })
      }
    })
  },

  edit({ state, commit }, payload: { id: string, data: any }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('routines.routines.update.inProgress'))

        return
      }

      const routine = Routine.find(payload.id)

      if (routine === null) {
        reject(new Error('routines.routines.update.failed'))

        return
      }

      commit('ROUTINES_SET_SEMAPHORE', {
        type: 'update',
        id: routine.id,
      })

      Trigger.dispatch('edit', {
        id: routine.trigger_id,
        data: payload.data,
      })
        .then((updatedTrigger: TriggerInterface): void => {
          commit('ROUTINES_CLEAR_SEMAPHORE', {
            type: 'update',
            id: routine.id,
          })

          // Entity was successfully updated in database
          resolve(Routine.find(updatedTrigger.id))
        })
        .catch((e: Error): void => {
          commit('ROUTINES_CLEAR_SEMAPHORE', {
            type: 'update',
            id: routine.id,
          })

          reject(new ModelError(
            'routines.routines.update.failed',
            Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
            'Update routine failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('routines.routines.delete.inProgress'))

        return
      }

      const routine = Routine
        .query()
        .with('trigger')
        .with('actions')
        .with('actions.rows')
        .with('conditions')
        .with('conditions.rows')
        .with('schedule')
        .where('id', payload.id)
        .first()

      if (routine === null) {
        reject(new Error('routines.routines.delete.failed'))

        return
      }

      commit('ROUTINES_SET_SEMAPHORE', {
        type: 'delete',
        id: routine.id,
      })

      Routine.delete(routine.trigger_id)
        .then((): void => {
          Trigger.dispatch('remove', {
            id: routine.trigger_id,
          })
            .then((): void => {
              routine.actions
                .forEach((action: RoutineActionInterface): void => {
                  action.rows
                    .forEach((row: RoutineActionPropertyInterface): void => {
                      RoutineActionProperty.delete(row.id)
                    })

                  RoutineAction.delete(action.id)
                })

              routine.conditions
                .forEach((condition: RoutineConditionInterface): void => {
                  condition.rows
                    .forEach((row: RoutineConditionPropertyInterface): void => {
                      RoutineConditionProperty.delete(row.id)
                    })

                  RoutineCondition.delete(condition.id)
                })

              if (routine.schedule) {
                RoutineSchedule.delete(routine.schedule.id)
              }

              commit('ROUTINES_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: routine.id,
              })

              resolve()
            })
            .catch((e: Error): void => {
              commit('ROUTINES_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: routine.id,
              })

              Routine.insert({
                data: routine,
              })
                .catch((): void => {
                  // Replacing backup failed, we need to refresh whole list
                  Routine.dispatch('fetch')
                    .catch((): void => {
                      // Refreshing failed
                    })
                })

              reject(new ModelError(
                'routines.routines.delete.failed',
                Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
                'Delete routine failed.',
              ))
            })
        })
    })
  },

  reset({ commit }): void {
    commit('ROUTINES_RESET_STATE')

    RoutineAction.dispatch('reset')
    RoutineCondition.dispatch('reset')
  },
}

const moduleMutations: MutationTree<RoutineState> = {
  /**
   * Set action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Object} state.semaphore.fetching
   * @param {Boolean} state.semaphore.fetching.items
   * @param {Array} state.semaphore.fetching.item
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Boolean} state.firstLoad
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ROUTINES_SET_SEMAPHORE'](state: RoutineState, action: SemaphoreAction): void {
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
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ROUTINES_CLEAR_SEMAPHORE'](state: RoutineState, action: SemaphoreAction): void {
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

      case 'update':
        // Process all semaphore items
        state.semaphore.updating
          .forEach((item: string, index: number): void => {
            // Find removed item in removing semaphore...
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
  ['ROUTINES_RESET_STATE'](state: RoutineState) {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): RoutineState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
