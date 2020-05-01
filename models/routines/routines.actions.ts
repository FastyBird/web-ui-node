import { ActionTree, MutationTree } from 'vuex'
import get from 'lodash/get'
import filter from 'lodash/filter'
import uniq from 'lodash/uniq'

import { ModelError } from '~/models/errors'

import Routine, { RoutineInterface } from '~/models/routines/Routine'
import RoutineAction, {
  CreateRoutineActionInterface,
  UpdateRoutineActionInterface,
  RoutineActionInterface,
} from '~/models/routines/RoutineAction'
import RoutineActionProperty from '~/models/routines/RoutineActionProperty'
import Action, { ActionInterface } from '~/models/triggers-node/Action'

import { TRIGGERS_ACTION_CHANNEL_PROPERTY } from '~/models/triggers-node/types'

interface RoutineActionSemaphoreState {
  fetching: {
    items: boolean,
    item: Array<string>
  }
  updating: Array<string>
  deleting: Array<string>
}

interface RoutineActionState {
  semaphore: RoutineActionSemaphoreState;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

const moduleState: RoutineActionState = {
  semaphore: {
    fetching: {
      items: false,
      item: [],
    },
    updating: [],
    deleting: [],
  },
}

const moduleActions: ActionTree<RoutineActionState, any> = {
  add({ state, commit }, payload: { routine: RoutineInterface, data: CreateRoutineActionInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (payload.routine.trigger === null || typeof payload.routine.trigger === 'undefined') {
        reject(new Error('routines.actions.create.invalid'))

        return
      }

      const existingAction = payload.routine.actions
        .find(item => (item.device === payload.data.device && item.channel === payload.data.channel))

      if (typeof existingAction !== 'undefined') {
        reject(new Error('routines.actions.create.invalid'))

        return
      }

      const promises: Array<Promise<any>> = []

      const createdActions: Array<ActionInterface> = []

      payload.data.rows
        .forEach((row): void => {
          promises.push(
            Action.dispatch('add', {
              trigger: payload.routine.trigger,
              data: {
                id: null,
                type: TRIGGERS_ACTION_CHANNEL_PROPERTY,
                device: payload.data.device,
                channel: payload.data.channel,
                property: row.property,
                value: row.operation,
              },
            })
              .then((action: ActionInterface): void => {
                createdActions.push(action)
              })
              .catch((e): void => {
                reject(new ModelError(
                  'routines.actions.create.failed',
                  Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
                  'Create new routine action failed.',
                ))
              }),
          )
        })

      Promise.all(promises)
        .then((): void => {
          const actions: Array<RoutineActionInterface> = []

          createdActions
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
                    id: `${action.device}-${action.channel}-${action.trigger_id}`,
                    device: action.device,
                    channel: action.channel,
                    deleted: false,

                    routine_id: action.trigger_id,
                    routine: null,

                    rows: [],
                  })
                }
              }
            })

          for (const i in actions) {
            if (Object.prototype.hasOwnProperty.call(actions, i)) {
              filter(createdActions, { device: actions[i].device, channel: actions[i].channel })
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

          RoutineAction.insert({
            data: actions,
          })
            .then((): void => {
              resolve()
            })
            .catch((e: Error): void => {
              reject(new ModelError(
                'routines.actions.create.failed',
                e,
                'Create new routine action failed.',
              ))
            })
        })
        .catch((e: Error): void => {
          reject(new ModelError(
            'routines.actions.create.failed',
            Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
            'Create new routine action failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, data: UpdateRoutineActionInterface }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('routines.actions.update.inProgress'))

        return
      }

      const routineAction = RoutineAction
        .query()
        .with('rows')
        .with('rows.action')
        .where('id', payload.id)
        .first()

      if (routineAction === null) {
        reject(new Error('routines.actions.edit.failed'))

        return
      }

      const routine = Routine
        .query()
        .with('trigger')
        .where('trigger_id', routineAction.routine_id)
        .first()

      if (routine === null) {
        reject(new Error('routines.actions.edit.failed'))

        return
      }

      commit('ROUTINES_ACTIONS_SET_SEMAPHORE', {
        type: 'update',
        id: routineAction.id,
      })

      const promises: Array<Promise<any>> = []

      payload.data.rows
        .forEach((row): void => {
          const action = Action
            .query()
            .where('device', routineAction.device)
            .where('channel', routineAction.channel)
            .where('property', row.property)
            .where('trigger_id', routineAction.routine_id)
            .first()

          if (action === null) {
            promises.push(
              Action.dispatch('add', {
                trigger: routine.trigger,
                data: {
                  id: null,
                  type: TRIGGERS_ACTION_CHANNEL_PROPERTY,
                  device: routineAction.device,
                  channel: routineAction.channel,
                  property: row.property,
                  value: row.operation,
                },
              })
                .then((createdAction: ActionInterface): void => {
                  RoutineActionProperty.insert({
                    data: {
                      id: createdAction.id,
                      routine_condition_id: routineAction.id,
                    },
                  })
                }),
            )
          } else {
            promises.push(
              Action.dispatch('edit', {
                id: action.id,
                data: {
                  device: routineAction.device,
                  channel: routineAction.channel,
                  property: row.property,
                  value: row.operation,
                },
              }),
            )
          }
        })

      routineAction.rows
        .forEach((row): void => {
          if (typeof payload.data.rows.find(({ property }): boolean => property === row.property) === 'undefined') {
            promises.push(
              RoutineActionProperty.delete(row.id)
                .then((): void => {
                  Action.dispatch('remove', {
                    id: row.id,
                  })
                }),
            )
          }
        })

      Promise.all(promises)
        .then((): void => {
          commit('ROUTINES_ACTIONS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: routineAction.id,
          })

          resolve()
        })
        .catch((e: Error): void => {
          commit('ROUTINES_ACTIONS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: routineAction.id,
          })

          reject(new ModelError(
            'routines.actions.create.failed',
            Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
            'Update routine action failed.',
          ))
        })
    })
  },

  toggleState({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('routines.actions.state.inProgress'))

        return
      }

      const routineAction = RoutineAction
        .query()
        .with('rows')
        .with('rows.action')
        .where('id', payload.id)
        .first()

      if (routineAction === null) {
        reject(new Error('routines.actions.state.failed'))

        return
      }

      commit('ROUTINES_ACTIONS_SET_SEMAPHORE', {
        type: 'update',
        id: routineAction.id,
      })

      const promises: Array<Promise<any>> = []

      routineAction.rows
        .forEach((actionProperty): void => {
          promises.push(Action.dispatch('edit', {
            id: actionProperty.id,
            data: {
              enabled: !routineAction.enabled,
            },
          }))
        })

      Promise.all(promises)
        .then((): void => {
          commit('ROUTINES_ACTIONS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: routineAction.id,
          })

          // Entity was successfully deleted with all connected entities
          resolve()
        })
        .catch((e: Error): void => {
          commit('ROUTINES_ACTIONS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: routineAction.id,
          })

          reject(new ModelError(
            'routines.actions.state.failed',
            Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
            'Delete routine action failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('routines.actions.delete.inProgress'))

        return
      }

      const action = RoutineAction
        .query()
        .with('rows')
        .with('rows.action')
        .where('id', payload.id)
        .first()

      if (action === null) {
        reject(new Error('routines.actions.delete.failed'))

        return
      }

      RoutineAction
        .update({
          where: action.id,
          data: {
            deleted: true,
          },
        })
        .then((): void => {
          commit('ROUTINES_ACTIONS_SET_SEMAPHORE', {
            type: 'delete',
            id: action.id,
          })

          const promises: Array<Promise<any>> = []

          action.rows
            .forEach((actionProperty): void => {
              promises.push(
                Action.dispatch('remove', {
                  id: actionProperty.id,
                })
                  .then((): void => {
                    RoutineActionProperty.delete(actionProperty.id)
                  }),
              )
            })

          Promise.all(promises)
            .then((): void => {
              RoutineAction.delete(action.id)
                .then((): void => {
                  commit('ROUTINES_ACTIONS_CLEAR_SEMAPHORE', {
                    type: 'delete',
                    id: action.id,
                  })

                  // Entity was successfully deleted with all connected entities
                  resolve()
                })
                .catch((e: Error): void => {
                  commit('ROUTINES_ACTIONS_CLEAR_SEMAPHORE', {
                    type: 'delete',
                    id: action.id,
                  })

                  reject(new ModelError(
                    'routines.actions.delete.failed',
                    e,
                    'Delete routine action failed.',
                  ))
                })
            })
            .catch((e: Error): void => {
              RoutineAction
                .update({
                  where: action.id,
                  data: {
                    deleted: false,
                  },
                })

              commit('ROUTINES_ACTIONS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: action.id,
              })

              reject(new ModelError(
                'routines.actions.delete.failed',
                Object.prototype.hasOwnProperty.call(e, 'exception') ? get(e, 'exception') : e,
                'Delete routine action failed.',
              ))
            })
        })
        .catch((): void => {
          reject(new Error('routines.actions.delete.failed'))
        })
    })
  },
}

const moduleMutations: MutationTree<RoutineActionState> = {
  /**
   * Set action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Boolean} state.firstLoad
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ROUTINES_ACTIONS_SET_SEMAPHORE'](state: RoutineActionState, action: SemaphoreAction): void {
    switch (action.type) {
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
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ROUTINES_ACTIONS_CLEAR_SEMAPHORE'](state: RoutineActionState, action: SemaphoreAction): void {
    switch (action.type) {
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
}

export default {
  state: (): RoutineActionState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
