import { ActionTree, GetterTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import { AxiosResponse } from 'axios'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'

import Channel from './Channel'

import { ApiError } from './errors'

interface ChannelSemaphoreFetchingState {
  items: Array<string>;
  item: Array<string>;
}

interface ChannelSemaphoreState {
  fetching: ChannelSemaphoreFetchingState;
  updating: Array<string>;
}

interface ChannelState {
  semaphore: ChannelSemaphoreState;
  firstLoad: Array<string>;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

function mapChannelResponse(item: any): any {
  const mapped = cloneDeep(item)

  if (item.device) {
    mapped.device_id = item.device.id
  }

  mapped.properties = []

  if (Object.prototype.hasOwnProperty.call(item, 'properties') && item.properties.length) {
    for (const property of item.properties) {
      property.channel_id = item.id
      delete property.channel

      mapped.properties.push(property)
    }
  }

  mapped.configuration = []

  if (Object.prototype.hasOwnProperty.call(item, 'configuration') && item.configuration.length) {
    for (const config of item.configuration) {
      config.channel_id = item.id
      delete config.channel

      mapped.configuration.push(config)
    }
  }

  return mapped
}

const moduleState: ChannelState = {

  semaphore: {
    fetching: {
      items: [],
      item: [],
    },
    updating: [],
  },

  firstLoad: [],

}

const moduleGetters: GetterTree<ChannelState, any> = {
  firstLoadFinished: state => (device_id: string): boolean => {
    return state.firstLoad.includes(device_id)
  },

  getting: state => (channel_id: string): boolean => {
    return state.semaphore.fetching.item.includes(channel_id)
  },

  fetching: state => (device_id: string | null): boolean => {
    return device_id !== null ? state.semaphore.fetching.items.includes(device_id) : state.semaphore.fetching.items.length > 0
  },
}

const moduleActions: ActionTree<ChannelState, any> = {
  get({ state, commit }, payload: { device_id: string, id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.item.includes(payload.id)) {
        resolve(false)

        return
      }

      commit('DEVICES_SET_SEMAPHORE', {
        type: 'get',
        id: payload.id,
      })

      Channel.api().get(`/devices-node/v1/devices/${payload.device_id}/channels/${payload.id}?include=properties,configuration`, {
        dataTransformer: (result: AxiosResponse): any | null => {
          commit('DEVICES_CLEAR_SEMAPHORE', {
            type: 'get',
            id: payload.id,
          })

          const dataFormatter = new Jsona()

          return mapChannelResponse(dataFormatter.deserialize(result.data))
        },
      })
        .then((): void => {
          // Entity was successfully fetched from server
          resolve(true)
        })
        .catch((e: Error): void => {
          commit('DEVICES_CLEAR_SEMAPHORE', {
            type: 'get',
            id: payload.id,
          })

          reject(new ApiError(
            'devices.channels.get.failed',
            e,
            'Fetching channel detail failed.',
          ))
        })
    })
  },

  fetch({ state, commit }, payload: { device_id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.items.includes(payload.device_id)) {
        resolve(false)

        return
      }

      commit('DEVICES_SET_SEMAPHORE', {
        type: 'fetch',
        id: payload.device_id,
      })

      Channel.api().get(`/devices-node/v1/devices/${payload.device_id}/channels?include=properties,configuration`, {
        dataTransformer: (result: AxiosResponse): any | null => {
          const dataFormatter = new Jsona()

          const data = dataFormatter.deserialize(result.data)

          commit('DEVICES_CLEAR_SEMAPHORE', {
            type: 'list',
            id: payload.device_id,
          })

          const insert = []

          // @ts-ignore
          for (const item of data) {
            insert.push(mapChannelResponse(item))
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
            type: 'list',
            id: payload.device_id,
          })

          reject(new ApiError(
            'devices.channels.fetch.failed',
            e,
            'Fetching channels failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, data: any }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('devices.channels.update.inProgress'))

        return
      }

      const channel = Channel.find(payload.id)

      if (channel === null) {
        reject(new Error('devices.channels.update.failed'))

        return
      }

      commit('DEVICES_SET_SEMAPHORE', {
        type: 'edit',
        id: channel.id,
      })

      Channel.update({
        where: channel.id,
        data: payload.data,
      })
        .then((updatedChannel): void => {
          if (updatedChannel instanceof Channel) {
            const dataFormatter = new Jsona()

            Channel.api().patch(
              `/devices-node/v1/devices/${updatedChannel.device_id}/channels/${updatedChannel.id}?include=properties,configuration`,
              dataFormatter.serialize({
                stuff: Object.assign({}, updatedChannel, {
                  relationshipNames: [],
                }),
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('DEVICES_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedChannel.id,
                  })

                  return dataFormatter.deserialize(result.data)
                },
              },
            )
              .then((): void => {
                // Entity was successfully updated in database
                resolve(updatedChannel)
              })
              .catch((e: Error): void => {
                commit('DEVICES_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: channel.id,
                })

                Channel.update({
                  where: channel.id,
                  data: channel,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole list
                    Channel.dispatch('fetch', {
                      device_id: channel.device_id,
                    })
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'devices.channels.edit.failed',
                  e,
                  'Edit channel failed.',
                ))
              })
          }
        })
        .catch((e: Error): void => {
          commit('DEVICES_CLEAR_SEMAPHORE', {
            type: 'update',
            id: channel.id,
          })

          reject(new ApiError(
            'devices.channels.edit.failed',
            e,
            'Edit channel failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('DEVICES_RESET_STATE')
  },
}

const moduleMutations: MutationTree<ChannelState> = {
  /**
   * Set action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Object} state.semaphore.fetching
   * @param {Array} state.semaphore.fetching.items
   * @param {Array} state.semaphore.fetching.item
   * @param {Array} state.semaphore.updating
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['DEVICES_SET_SEMAPHORE'](state, action): void {
    switch (action.type) {
      case 'fetch':
        state.semaphore.fetching.items.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.items = uniq(state.semaphore.fetching.items)

        state.firstLoad.push(action.id)

        // Make all keys uniq
        state.firstLoad = uniq(state.firstLoad)
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
    }
  },

  /**
   * Reset action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Object} state.semaphore.fetching
   * @param {Array} state.semaphore.fetching.items
   * @param {Array} state.semaphore.fetching.item
   * @param {Array} state.semaphore.updating
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['DEVICES_CLEAR_SEMAPHORE'](state: ChannelState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'fetch':
        // Process all semaphore items
        state.semaphore.fetching.items
          .forEach((item: string, index: number): void => {
            // Find created item in reading one item semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.fetching.items.splice(index, 1)
            }
          })
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
            // Find created item in updating semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.updating.splice(index, 1)
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
  ['DEVICES_RESET_STATE'](state: ChannelState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): ChannelState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
