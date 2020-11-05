import {
  ActionTree,
  MutationTree,
} from 'vuex'
import { Item } from '@vuex-orm/core'
import Jsona from 'jsona'
// @ts-ignore
import Ajv from 'ajv'
import { AxiosResponse } from 'axios'
import uniq from 'lodash/uniq'
import metadata from '@fastybird/node-metadata/resources/schemas/devices-node/entity.channel.property.json'
import { Entity } from '@fastybird/node-metadata/types/devices-node.entity.channel.property'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import DeviceProperty from '~/models/devices-node/device-properties/DeviceProperty'
import {
  DevicePropertyEntityTypeType,
  DevicePropertyInterface,
  DevicePropertyResponseInterface,
  DevicePropertiesResponseInterface,
  RoutingKeys,
  SemaphoreType,
} from '~/models/devices-node/device-properties/types'

import {
  ApiError,
  OrmError,
} from '~/models/devices-node/errors'
import {
  JsonApiModelPropertiesMapper,
  JsonApiPropertiesMapper,
} from '~/models/devices-node/jsonapi'
import {
  DevicePropertyJsonModelInterface,
  ModuleOriginType,
} from '~/models/devices-node/types'

interface SemaphoreFetchingState {
  items: Array<string>
  item: Array<string>
}

interface SemaphoreState {
  fetching: SemaphoreFetchingState
  creating: Array<string>
  updating: Array<string>
  deleting: Array<string>
}

interface DevicePropertyState {
  semaphore: SemaphoreState
}

interface SemaphoreAction {
  type: SemaphoreType
  id: string
}

const jsonApiFormatter = new Jsona({
  modelPropertiesMapper: new JsonApiModelPropertiesMapper(),
  jsonPropertiesMapper: new JsonApiPropertiesMapper(),
})

const apiOptions = {
  dataTransformer: (result: AxiosResponse<DevicePropertyResponseInterface> | AxiosResponse<DevicePropertiesResponseInterface>): DevicePropertyJsonModelInterface | Array<DevicePropertyJsonModelInterface> => <DevicePropertyJsonModelInterface | Array<DevicePropertyJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const jsonSchemaValidator = new Ajv()

const moduleState: DevicePropertyState = {

  semaphore: {
    fetching: {
      items: [],
      item: [],
    },
    creating: [],
    updating: [],
    deleting: [],
  },

}

const moduleActions: ActionTree<DevicePropertyState, any> = {
  async get({ state, commit }, payload: { device: DeviceInterface, id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.GETTING,
      id: payload.id,
    })

    try {
      await DeviceProperty.api().get(
        `/devices-node/v1/devices/${payload.device.id}/properties/${payload.id}`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'devices-node.device-properties.fetch.failed',
        e,
        'Fetching device property failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.GETTING,
        id: payload.id,
      })
    }
  },

  async fetch({ state, commit }, payload: { device: DeviceInterface }): Promise<boolean> {
    if (state.semaphore.fetching.items.includes(payload.device.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.FETCHING,
      id: payload.device.id,
    })

    try {
      await DeviceProperty.api().get(
        `/devices-node/v1/devices/${payload.device.id}/properties`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'devices-node.device-properties.fetch.failed',
        e,
        'Fetching device properties failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.FETCHING,
        id: payload.device.id,
      })
    }
  },

  async edit({ state, commit }, payload: { property: DevicePropertyInterface, name?: string | null, unit?: string, format?: string, expected?: any }): Promise<Item<DeviceProperty>> {
    if (state.semaphore.updating.includes(payload.property.id)) {
      throw new Error('devices-node.device-properties.update.inProgress')
    }

    if (!DeviceProperty.query().where('id', payload.property.id).exists()) {
      throw new Error('devices-node.device-properties.update.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.UPDATING,
      id: payload.property.id,
    })

    try {
      await DeviceProperty.update({
        where: payload.property.id,
        data: payload,
      })
    } catch (e) {
      throw new OrmError(
        'devices-node.device-properties.update.failed',
        e,
        'Edit device property failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.property.id,
      })
    }

    const updatedEntity = DeviceProperty.find(payload.property.id)

    if (updatedEntity === null) {
      const device = Device.find(payload.property.deviceId)

      // Updated entity could not be loaded from database
      await DeviceProperty.dispatch('get', {
        device,
        id: payload.property.id,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.property.id,
      })

      throw new Error('devices-node.device-properties.update.failed')
    }

    try {
      await DeviceProperty.api().patch(
        `/devices-node/v1/devices/${updatedEntity.deviceId}/properties/${updatedEntity.id}`,
        jsonApiFormatter.serialize({
          stuff: updatedEntity,
        }),
        apiOptions,
      )

      return DeviceProperty.find(payload.property.id)
    } catch (e) {
      const device = Device.find(payload.property.deviceId)

      // Updating entity on api failed, we need to refresh entity
      await DeviceProperty.dispatch('get', {
        device,
        id: payload.property.id,
      })

      throw new ApiError(
        'devices-node.device-properties.update.failed',
        e,
        'Edit device property failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.property.id,
      })
    }
  },

  async socketData({ commit }, payload: { origin: string, routingKey: string, data: string }): Promise<boolean> {
    if (payload.origin !== ModuleOriginType) {
      return false
    }

    if (!Object.values(RoutingKeys).includes(payload.routingKey as RoutingKeys)) {
      return false
    }

    const body: Entity = JSON.parse(payload.data)

    const isValid = jsonSchemaValidator.compile<Entity>(metadata)

    if (isValid(body)) {
      if (
        !DeviceProperty.query().where('id', body.id).exists() &&
        (payload.routingKey === RoutingKeys.UPDATED || payload.routingKey === RoutingKeys.DELETED)
      ) {
        throw new Error('devices-node.device-properties.update.failed')
      }

      if (payload.routingKey === RoutingKeys.DELETED) {
        commit('SET_SEMAPHORE', {
          type: SemaphoreType.DELETING,
          id: body.id,
        })

        try {
          await DeviceProperty.delete(body.id)
        } catch (e) {
          throw new OrmError(
            'devices-node.device-properties.delete.failed',
            e,
            'Delete device property failed.',
          )
        } finally {
          commit('CLEAR_SEMAPHORE', {
            type: SemaphoreType.DELETING,
            id: body.id,
          })
        }
      } else {
        commit('SET_SEMAPHORE', {
          type: payload.routingKey === RoutingKeys.UPDATED ? SemaphoreType.UPDATING : SemaphoreType.CREATING,
          id: body.id,
        })

        const entityData: { [index: string]: any } = {
          type: DevicePropertyEntityTypeType.PROPERTY,
        }

        Object.keys(body)
          .forEach((attrName) => {
            const kebabName = attrName.replace(/([a-z][A-Z0-9])/g, g => `${g[0]}_${g[1].toLowerCase()}`)

            if (kebabName === 'device') {
              const device = Device.query().where('identifier', body[attrName]).first()

              if (device !== null) {
                entityData.deviceId = device.id
              }
            } else {
              entityData[kebabName] = body[attrName]
            }
          })

        try {
          await DeviceProperty.insertOrUpdate({
            data: entityData,
          })
        } catch (e) {
          const device = Device.query().where('identifier', body.device).first()

          // Updating entity on api failed, we need to refresh entity
          await DeviceProperty.dispatch('get', {
            device,
            id: body.id,
          })

          throw new OrmError(
            'devices-node.device-properties.update.failed',
            e,
            'Edit device property failed.',
          )
        } finally {
          commit('CLEAR_SEMAPHORE', {
            type: payload.routingKey === RoutingKeys.UPDATED ? SemaphoreType.UPDATING : SemaphoreType.CREATING,
            id: body.id,
          })
        }
      }

      return true
    } else {
      return false
    }
  },
}

const moduleMutations: MutationTree<DevicePropertyState> = {
  ['SET_SEMAPHORE'](state: DevicePropertyState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreType.FETCHING:
        state.semaphore.fetching.items.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.items = uniq(state.semaphore.fetching.items)
        break

      case SemaphoreType.GETTING:
        state.semaphore.fetching.item.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
        break

      case SemaphoreType.CREATING:
        state.semaphore.creating.push(action.id)

        // Make all keys uniq
        state.semaphore.creating = uniq(state.semaphore.creating)
        break

      case SemaphoreType.UPDATING:
        state.semaphore.updating.push(action.id)

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break

      case SemaphoreType.DELETING:
        state.semaphore.deleting.push(action.id)

        // Make all keys uniq
        state.semaphore.deleting = uniq(state.semaphore.deleting)
        break
    }
  },

  ['CLEAR_SEMAPHORE'](state: DevicePropertyState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreType.FETCHING:
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

      case SemaphoreType.GETTING:
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

      case SemaphoreType.CREATING:
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

      case SemaphoreType.UPDATING:
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

      case SemaphoreType.DELETING:
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
  state: (): DevicePropertyState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
