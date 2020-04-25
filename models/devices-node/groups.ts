import { ActionTree, GetterTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'

import Group, { GroupInterface } from './Group'

import { ApiError } from './errors'

interface GroupSemaphoreFetchingState {
  items: boolean;
  item: Array<string>;
}

interface GroupSemaphoreState {
  fetching: GroupSemaphoreFetchingState;
  creating: Array<string>;
  updating: Array<string>;
  deleting: Array<string>;
}

interface GroupState {
  semaphore: GroupSemaphoreState;
  firstLoad: boolean;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

function mapGroupResponse(item: any): any {
  const mapped = cloneDeep(item)

  mapped.device_ids = []

  if (Object.prototype.hasOwnProperty.call(item, 'devices') && item.devices.length) {
    for (const device of item.devices) {
      mapped.device_ids.push(device.id)
    }

    delete mapped.devices
  }

  return mapped
}

const moduleState: GroupState = {

  semaphore: {
    fetching: {
      items: false,
      item: [],
    },
    creating: [],
    updating: [],
    deleting: [],
  },

  firstLoad: false,

}

const moduleGetters: GetterTree<GroupState, any> = {
  firstLoadFinished: state => (): boolean => {
    return !!state.firstLoad
  },

  getting: state => (id: string): boolean => {
    return state.semaphore.fetching.item.includes(id)
  },

  fetching: state => (): boolean => {
    return !!state.semaphore.fetching.items
  },
}

const moduleActions: ActionTree<GroupState, any> = {
  get({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (state.semaphore.fetching.item.includes(payload.id)) {
        resolve(false)
      } else {
        commit('DEVICES_SET_SEMAPHORE', {
          type: 'get',
          id: payload.id,
        })

        Group.api().get(`/devices-node/v1/groups/${payload.id}`, {
          dataTransformer: (result: AxiosResponse): any | null => {
            commit('DEVICES_CLEAR_SEMAPHORE', {
              type: 'get',
              id: payload.id,
            })

            const dataFormatter = new Jsona()

            return mapGroupResponse(dataFormatter.deserialize(result.data))
          },
        })
          .then(() => {
            // Entity was successfully fetched from server
            resolve(true)
          })
          .catch((e: Error): void => {
            commit('DEVICES_CLEAR_SEMAPHORE', {
              type: 'get',
              id: payload.id,
            })

            reject(new ApiError(
              'devices.groups.get.failed',
              e,
              'Fetching group detail failed.',
            ))
          })
      }
    })
  },

  fetch({ state, commit }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (state.semaphore.fetching.items) {
        resolve(false)
      } else {
        commit('DEVICES_SET_SEMAPHORE', {
          type: 'fetch',
        })

        Group.api().get('/devices-node/v1/groups', {
          dataTransformer: (result: AxiosResponse): any | null => {
            const dataFormatter = new Jsona()

            const data = dataFormatter.deserialize(result.data)

            commit('DEVICES_CLEAR_SEMAPHORE', {
              type: 'fetch',
            })

            const insert = []

            // @ts-ignore
            for (const item of data) {
              insert.push(mapGroupResponse(item))
            }

            return insert
          },
        })
          .then((): void => {
            // Entities were successfully fetched from server
            resolve(true)
          })
          .catch((e: Error): void => {
            commit('DEVICES_CLEAR_SEMAPHORE', {
              type: 'fetch',
            })

            reject(new ApiError(
              'devices.groups.fetch.failed',
              e,
              'Fetching groups failed.',
            ))
          })
      }
    })
  },

  add({ commit }, payload: { data: any }): Promise<any> {
    return new Promise((resolve, reject): void => {
      const id = payload.data.id !== null && typeof payload.data.id === 'string' && payload.data.id !== '' ? payload.data.id : uuid.v4()

      const entity = payload.data
      entity.id = id

      commit('DEVICES_SET_SEMAPHORE', {
        type: 'create',
        id,
      })

      Group.insert({
        data: entity,
      })
        .then((entities): void => {
          const dataFormatter = new Jsona()

          if (Object.prototype.hasOwnProperty.call(entities, 'group') && Array.isArray(entities.group)) {
            entities.group
              .forEach((createdGroup): void => {
                Group.api().post(
                  '/devices-node/v1/groups',
                  dataFormatter.serialize({
                    stuff: Object.assign({}, createdGroup, {
                      relationshipNames: [],
                    }),
                  }),
                  {
                    dataTransformer: (result: AxiosResponse): any | null => {
                      commit('DEVICES_CLEAR_SEMAPHORE', {
                        type: 'create',
                        id,
                      })

                      return dataFormatter.deserialize(result.data)
                    },
                  },
                )
                  .then((): void => {
                    // Entity was successfully created in database
                    resolve(createdGroup)
                  })
                  .catch((e: Error): void => {
                    commit('DEVICES_CLEAR_SEMAPHORE', {
                      type: 'create',
                      id,
                    })

                    Group.delete(id)
                      .catch((): void => {
                        // Failed creating could not be removed
                      })

                    reject(new ApiError(
                      'devices.groups.create.failed',
                      e,
                      'Create new device group failed.',
                    ))
                  })
              })
          }
        })
        .catch((e: Error): void => {
          commit('DEVICES_CLEAR_SEMAPHORE', {
            type: 'create',
            id,
          })

          Group.delete(id)
            .catch((): void => {
              // Failed creating could not be removed
            })

          reject(new ApiError(
            'devices.groups.create.failed',
            e,
            'Create new device group failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, data: any }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('devices.groups.update.inProgress'))

        return
      }

      const group = Group.find(payload.id)

      if (group === null) {
        reject(new Error('devices.groups.edit.failed'))

        return
      }

      commit('DEVICES_SET_SEMAPHORE', {
        type: 'update',
        id: group.id,
      })

      Group.update({
        where: group.id,
        data: payload.data,
      })
        .then((updatedGroup): void => {
          if (updatedGroup instanceof Group) {
            const dataFormatter = new Jsona()

            Group.api().patch(
              `/devices-node/v1/groups/${updatedGroup.id}`,
              dataFormatter.serialize({
                stuff: Object.assign({}, updatedGroup, {
                  relationshipNames: [],
                }),
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('DEVICES_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedGroup.id,
                  })

                  return dataFormatter.deserialize(result.data)
                },
              },
            )
              .then((): void => {
                // Entity was successfully updated in database
                resolve(updatedGroup)
              })
              .catch((e: Error): void => {
                commit('DEVICES_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: updatedGroup.id,
                })

                Group.update({
                  where: updatedGroup.id,
                  data: group,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole list
                    Group.dispatch('fetch')
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'devices.groups.edit.failed',
                  e,
                  'Edit group failed.',
                ))
              })
          }
        })
        .catch((e: Error): void => {
          commit('DEVICES_CLEAR_SEMAPHORE', {
            type: 'update',
            id: group.id,
          })

          reject(new ApiError(
            'devices.groups.edit.failed',
            e,
            'Edit group failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('devices.groups.delete.inProgress'))

        return
      }

      const group = Group.find(payload.id)

      if (group === null) {
        reject(new Error('devices.groups.delete.failed'))

        return
      }

      commit('DEVICES_SET_SEMAPHORE', {
        type: 'delete',
        id: group.id,
      })

      Group.delete(group.id)
        .then((): void => {
          Group.api().delete(
            `/devices-node/v1/groups/${group.id}`,
            {
              save: false,
            },
          )
            .then((): void => {
              commit('DEVICES_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: group.id,
              })

              // Entity was successfully deleted from database
              resolve()
            })
            .catch((e: Error): void => {
              commit('DEVICES_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: group.id,
              })

              Group.insert({
                data: group,
              })
                .catch((): void => {
                  // Replacing backup failed, we need to refresh whole list
                  Group.dispatch('fetch')
                    .catch((): void => {
                      // Refreshing failed
                    })
                })

              reject(new ApiError(
                'devices.groups.delete.failed',
                e,
                'Delete group failed.',
              ))
            })
        })
        .catch((e: Error): void => {
          commit('DEVICES_CLEAR_SEMAPHORE', {
            type: 'delete',
            id: group.id,
          })

          reject(new ApiError(
            'devices.groups.delete.failed',
            e,
            'Delete group failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('DEVICES_RESET_STATE')
  },
}

const moduleMutations: MutationTree<GroupState> = {
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
  ['DEVICES_SET_SEMAPHORE'](state: GroupState, action: SemaphoreAction): void {
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
  ['DEVICES_CLEAR_SEMAPHORE'](state: GroupState, action: SemaphoreAction): void {
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
  ['DEVICES_RESET_STATE'](state: GroupState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): GroupState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
