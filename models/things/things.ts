import { GetterTree, ActionTree, MutationTree } from 'vuex'
import uniq from 'lodash/uniq'

import { ModelError } from '../errors'

import Thing from './Thing'

import Device from '~/models/devices-node/Device'
import Channel from '~/models/devices-node/Channel'

interface ThingSemaphoreState {
  fetching: {
    items: boolean,
    item: Array<string>
  }
  deleting: Array<string>
}

interface ThingState {
  semaphore: ThingSemaphoreState;
  firstLoad: boolean;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

const moduleState: ThingState = {
  semaphore: {
    fetching: {
      items: false,
      item: [],
    },
    deleting: [],
  },

  firstLoad: false,
}

const moduleGetters: GetterTree<ThingState, any> = {
  isThingOnline: state => (id: string): boolean => {
    const thing = Thing
      .query()
      .with('device')
      .where('id', id)
      .first()

    if (thing === null) {
      return false
    }

    return thing.device.state === 'ready'
  },

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

const moduleActions: ActionTree<ThingState, any> = {
  get({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (state.semaphore.fetching.item.includes(payload.id)) {
        resolve(false)
      } else {
        commit('THINGS_SET_SEMAPHORE', {
          type: 'get',
          id: payload.id,
        })

        Device.dispatch('fetch', {
          include_channels: false,
        })
          .then(() => {
            const device = Device
              .query()
              .where('channel_ids', (value: Array<string>) => {
                const items = value.find((item: string) => {
                  return item === payload.id
                })

                return typeof items !== 'undefined'
              })
              .first()

            if (device) {
              Device.dispatch('get', {
                id: device.id,
              })
                .then(() => {
                  const insertData: any = []

                  const channels = Channel
                    .query()
                    .where('device_id', device.id)
                    .get()

                  channels.forEach((channel: Channel) => {
                    insertData.push({
                      id: channel.id,
                      device_id: device.id,
                      channel_id: channel.id,
                    })
                  })

                  Thing.insertOrUpdate({
                    data: insertData,
                  })
                    .then(() => {
                      commit('THINGS_CLEAR_SEMAPHORE', {
                        type: 'get',
                      })

                      resolve(true)
                    })
                    .catch((e) => {
                      commit('THINGS_CLEAR_SEMAPHORE', {
                        type: 'get',
                      })

                      reject(new ModelError(
                        'things.fetch.failed',
                        e,
                        'Fetching things failed.',
                      ))
                    })
                })
                .catch((e) => {
                  commit('THINGS_CLEAR_SEMAPHORE', {
                    type: 'get',
                    id: payload.id,
                  })

                  reject(new ModelError(
                    'things.get.failed',
                    e,
                    'Fetching thing failed.',
                  ))
                })
            } else {
              resolve(true)
            }
          })
          .catch((e) => {
            commit('THINGS_CLEAR_SEMAPHORE', {
              type: 'get',
              id: payload.id,
            })

            reject(new ModelError(
              'things.get.failed',
              e,
              'Fetching thing failed.',
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
        commit('THINGS_SET_SEMAPHORE', {
          type: 'fetch',
        })

        Device.dispatch('fetch', {
          include_channels: true,
        })
          .then(() => {
            const devices = Device
              .query()
              .get()

            const insertData: any = []

            devices.forEach((device: Device) => {
              const channels = Channel
                .query()
                .where('device_id', device.id)
                .get()

              channels.forEach((channel: Channel) => {
                insertData.push({
                  id: channel.id,
                  device_id: device.id,
                  channel_id: channel.id,
                })
              })
            })

            Thing.insertOrUpdate({
              data: insertData,
            })
              .then(() => {
                commit('THINGS_CLEAR_SEMAPHORE', {
                  type: 'fetch',
                })

                resolve(true)
              })
              .catch((e) => {
                commit('THINGS_CLEAR_SEMAPHORE', {
                  type: 'fetch',
                })

                reject(new ModelError(
                  'things.fetch.failed',
                  e,
                  'Fetching things failed.',
                ))
              })
          })
          .catch((e) => {
            commit('THINGS_CLEAR_SEMAPHORE', {
              type: 'fetch',
            })

            reject(new ModelError(
              'things.fetch.failed',
              e,
              'Fetching things failed.',
            ))
          })
      }
    })
  },

  reset({ commit }): void {
    commit('THINGS_RESET_STATE')

    Device.dispatch('reset')
  },
}

const moduleMutations: MutationTree<ThingState> = {
  /**
   * Set action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Object} state.semaphore.fetching
   * @param {Boolean} state.semaphore.fetching.items
   * @param {Array} state.semaphore.fetching.item
   * @param {Array} state.semaphore.deleting
   * @param {Boolean} state.firstLoad
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['THINGS_SET_SEMAPHORE'](state: ThingState, action: SemaphoreAction): void {
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
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['THINGS_CLEAR_SEMAPHORE'](state: ThingState, action: SemaphoreAction): void {
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
  ['THINGS_RESET_STATE'](state) {
    Object.assign(state, moduleState)
  },
}

export default {
  state: () => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
