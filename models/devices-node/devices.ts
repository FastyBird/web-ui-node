import { ActionTree, GetterTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import { Response } from '@vuex-orm/plugin-axios'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'
import get from 'lodash/get'

import Device, { DeviceInterface } from './Device'
import Channel from './Channel'

import { ApiError } from './errors'

interface DeviceSemaphoreFetchingState {
  items: boolean;
  item: Array<string>;
}

interface DeviceSemaphoreState {
  fetching: DeviceSemaphoreFetchingState;
  creating: Array<string>;
  updating: Array<string>;
  deleting: Array<string>;
}

interface DeviceState {
  semaphore: DeviceSemaphoreState;
  firstLoad: boolean;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

function mapDeviceResponse(item: any): any {
  const mapped = cloneDeep(item)

  delete mapped.children

  if (Object.prototype.hasOwnProperty.call(item, 'credentials') && item.credentials !== null) {
    mapped.credentials.device_id = item.id
    delete mapped.credentials.device
  }

  if (Object.prototype.hasOwnProperty.call(item, 'hardware') && item.hardware !== null) {
    mapped.hardware.device_id = item.id
    delete mapped.hardware.device
  }

  if (Object.prototype.hasOwnProperty.call(item, 'firmware') && item.firmware !== null) {
    mapped.firmware.device_id = item.id
    delete mapped.firmware.device
  }

  mapped.properties = []

  if (Object.prototype.hasOwnProperty.call(item, 'properties') && item.properties.length) {
    for (const property of item.properties) {
      property.device_id = item.id
      delete property.device

      mapped.properties.push(property)
    }
  }

  mapped.configuration = []

  if (Object.prototype.hasOwnProperty.call(item, 'configuration') && item.configuration.length) {
    for (const config of item.configuration) {
      config.device_id = item.id
      delete config.device

      mapped.configuration.push(config)
    }
  }

  mapped.channel_ids = []

  if (Object.prototype.hasOwnProperty.call(item, 'channels') && item.channels.length) {
    for (const channel of item.channels) {
      mapped.channel_ids.push(channel.id)
    }

    delete mapped.channels
  }

  if (
    Object.prototype.hasOwnProperty.call(item, 'parent') &&
    item.parent !== null &&
    Object.keys(item.parent).length > 2
  ) {
    mapped.parent_id = item.parent.id
    delete mapped.parent
  }

  return mapped
}

const moduleState: DeviceState = {

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

const moduleGetters: GetterTree<DeviceState, any> = {
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

const moduleActions: ActionTree<DeviceState, any> = {
  get({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.item.includes(payload.id)) {
        resolve(false)
      } else {
        commit('DEVICES_SET_SEMAPHORE', {
          type: 'get',
          id: payload.id,
        })

        Device.api().get(`/devices-node/v1/devices/${payload.id}?include=credentials,hardware,firmware,properties,configuration`, {
          dataTransformer: (result: AxiosResponse): any | null => {
            const dataFormatter = new Jsona()

            return mapDeviceResponse(dataFormatter.deserialize(result.data))
          },
        })
          .then((): void => {
            // Refresh emails
            Channel.dispatch('fetch', {
              device_id: payload.id,
            })
              .then((): void => {
                commit('DEVICES_CLEAR_SEMAPHORE', {
                  type: 'get',
                  id: payload.id,
                })

                // Entity was successfully fetched from server
                resolve(true)
              })
              .catch((e: Error): void => {
                commit('DEVICES_CLEAR_SEMAPHORE', {
                  type: 'get',
                  id: payload.id,
                })

                reject(new ApiError(
                  'devices.devices.fetch.failed',
                  e,
                  'Fetching devices failed.',
                ))
              })
          })
          .catch((e: Error): void => {
            commit('DEVICES_CLEAR_SEMAPHORE', {
              type: 'get',
              id: payload.id,
            })

            reject(new ApiError(
              'devices.devices.get.failed',
              e,
              'Fetching device detail failed.',
            ))
          })
      }
    })
  },

  fetch({ state, commit }, payload: { include_channels: boolean }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.items) {
        resolve(false)
      } else {
        commit('DEVICES_SET_SEMAPHORE', {
          type: 'fetch',
        })

        Device.api().get('/devices-node/v1/devices?include=credentials,hardware,firmware,properties,configuration', {
          dataTransformer: (result: AxiosResponse): any | null => {
            const dataFormatter = new Jsona()

            const data = dataFormatter.deserialize(result.data)

            commit('DEVICES_CLEAR_SEMAPHORE', {
              type: 'fetch',
            })

            const insert = []

            // @ts-ignore
            for (const item of data) {
              insert.push(mapDeviceResponse(item))
            }

            return insert
          },
        })
          .then((response: Response): void => {
            if (payload.include_channels && Object.prototype.hasOwnProperty.call(response.entities, 'device')) {
              const promises: Array<Promise<any>> = []

              get(response, 'entities.device', [])
                .forEach((device: Device): void => {
                  // Load channels
                  promises.push(
                    Channel.dispatch('fetch', {
                      device_id: device.id,
                    })
                      .catch((e: Error): void => {
                        reject(new ApiError(
                          'devices.devices.fetch.failed',
                          e,
                          'Fetching devices failed.',
                        ))
                      }),
                  )
                })

              Promise.all(promises)
                .then((): void => {
                  commit('DEVICES_CLEAR_SEMAPHORE', {
                    type: 'fetch',
                  })

                  // Entities were successfully fetched from server
                  resolve(true)
                })
                .catch((e: Error): void => {
                  commit('DEVICES_CLEAR_SEMAPHORE', {
                    type: 'fetch',
                  })

                  reject(new ApiError(
                    'devices.devices.fetch.failed',
                    e,
                    'Fetching devices failed.',
                  ))
                })
            } else {
              commit('DEVICES_CLEAR_SEMAPHORE', {
                type: 'fetch',
              })

              // Entities were successfully fetched from server
              resolve(true)
            }
          })
          .catch((e: Error): void => {
            commit('DEVICES_CLEAR_SEMAPHORE', {
              type: 'fetch',
            })

            reject(new ApiError(
              'devices.devices.fetch.failed',
              e,
              'Fetching devices failed.',
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

      Device.insert({
        data: entity,
      })
        .then((entities): void => {
          const dataFormatter = new Jsona()

          if (Object.prototype.hasOwnProperty.call(entities, 'device') && Array.isArray(entities.device)) {
            entities.device
              .forEach((createdDevice): void => {
                Device.api().post(
                  '/devices-node/v1/devices?include=credentials,hardware,firmware,properties,configuration',
                  dataFormatter.serialize({
                    stuff: Object.assign({}, createdDevice, {
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
                    resolve()
                  })
                  .catch((e: Error): void => {
                    commit('DEVICES_CLEAR_SEMAPHORE', {
                      type: 'create',
                      id,
                    })

                    Device.delete(id)
                      .catch((): void => {
                        // Failed creating could not be removed
                      })

                    reject(new ApiError(
                      'devices.devices.create.failed',
                      e,
                      'Create new device failed.',
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

          Device.delete(id)
            .catch((): void => {
              // Failed creating could not be removed
            })

          reject(new ApiError(
            'devices.devices.create.failed',
            e,
            'Create new device failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, data: any }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('devices.devices.update.inProgress'))

        return
      }

      const device = Device.find(payload.id)

      if (device === null) {
        reject(new Error('devices.devices.edit.failed'))

        return
      }

      commit('DEVICES_SET_SEMAPHORE', {
        type: 'update',
        id: device.id,
      })

      Device.update({
        where: device.id,
        data: payload.data,
      })
        .then((updatedDevice): void => {
          if (updatedDevice instanceof Device) {
            const dataFormatter = new Jsona()

            const apiData = updatedDevice

            delete apiData.channels
            delete apiData.parent_id
            delete apiData.hardware
            delete apiData.firmware
            delete apiData.properties
            delete apiData.stats
            delete apiData.configuration

            Device.api().patch(
              `/devices-node/v1/devices/${updatedDevice.id}?include=credentials,hardware,firmware,properties,configuration`,
              dataFormatter.serialize({
                stuff: Object.assign({}, apiData, {
                  relationshipNames: ['parent'],
                }),
                includeNames: ['parent'],
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('DEVICES_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedDevice.id,
                  })

                  return dataFormatter.deserialize(result.data)
                },
              },
            )
              .then((): void => {
                // Entity was successfully updated in database
                resolve(updatedDevice)
              })
              .catch((e: Error): void => {
                commit('DEVICES_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: updatedDevice.id,
                })

                Device.update({
                  where: updatedDevice.id,
                  data: device,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole list
                    Device.dispatch('fetch')
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'devices.devices.edit.failed',
                  e,
                  'Edit device failed.',
                ))
              })
          }
        })
        .catch((e: Error): void => {
          commit('DEVICES_CLEAR_SEMAPHORE', {
            type: 'update',
            id: device.id,
          })

          reject(new ApiError(
            'devices.devices.edit.failed',
            e,
            'Edit device failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('devices.devices.delete.inProgress'))

        return
      }

      const device = Device.find(payload.id)

      if (device === null) {
        reject(new Error('devices.devices.delete.failed'))

        return
      }

      commit('DEVICES_SET_SEMAPHORE', {
        type: 'delete',
        id: device.id,
      })

      Device.delete(device.id)
        .then((): void => {
          Device.api().delete(
            `/devices-node/v1/devices/${device.id}`,
            {
              save: false,
            },
          )
            .then((): void => {
              commit('DEVICES_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: device.id,
              })

              // Entity was successfully deleted from database
              resolve()
            })
            .catch((e: Error): void => {
              commit('DEVICES_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: device.id,
              })

              Device.insert({
                data: device,
              })
                .catch((): void => {
                  // Replacing backup failed, we need to refresh whole list
                  Device.dispatch('fetch')
                    .catch((): void => {
                      // Refreshing failed
                    })
                })

              reject(new ApiError(
                'devices.devices.delete.failed',
                e,
                'Delete device failed.',
              ))
            })
        })
        .catch((e: Error): void => {
          commit('DEVICES_CLEAR_SEMAPHORE', {
            type: 'delete',
            id: device.id,
          })

          reject(new ApiError(
            'devices.devices.delete.failed',
            e,
            'Delete device failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('DEVICES_RESET_STATE')

    Channel.dispatch('reset')
  },
}

const moduleMutations: MutationTree<DeviceState> = {
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
  ['DEVICES_SET_SEMAPHORE'](state: DeviceState, action: SemaphoreAction): void {
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
  ['DEVICES_CLEAR_SEMAPHORE'](state: DeviceState, action: SemaphoreAction): void {
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
  ['DEVICES_RESET_STATE'](state: DeviceState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): DeviceState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
