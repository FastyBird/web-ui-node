import {
  ActionTree,
  GetterTree,
  MutationTree,
} from 'vuex'
import { Item } from '@vuex-orm/core'
import { RpCallResponse } from '@fastybird/vue-wamp-v1'
import Jsona from 'jsona'
// @ts-ignore
import Ajv from 'ajv'
import { AxiosResponse } from 'axios'
import get from 'lodash/get'
import uniq from 'lodash/uniq'
import metadata from '@fastybird/node-metadata/resources/schemas/devices-node/entity.channel.json'
import { Entity } from '@fastybird/node-metadata/types/devices-node.entity.channel'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import Channel from '~/models/devices-node/channels/Channel'
import {
  ChannelEntityTypes,
  ChannelInterface,
  ChannelResponseInterface,
  ChannelsResponseInterface,
  ChannelUpdateInterface,
  CommandRoutingKeys,
  RoutingKeys,
  SemaphoreTypes,
} from '~/models/devices-node/channels/types'

import {
  ApiError,
  OrmError,
} from '~/models/devices-node/errors'
import {
  JsonApiModelPropertiesMapper,
  JsonApiPropertiesMapper,
} from '~/models/devices-node/jsonapi'
import {
  ChannelJsonModelInterface,
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

interface ChannelState {
  semaphore: SemaphoreState
  firstLoad: Array<string>
}

interface FirstLoadAction {
  id: string
}

interface SemaphoreAction {
  type: SemaphoreTypes
  id: string
}

const jsonApiFormatter = new Jsona({
  modelPropertiesMapper: new JsonApiModelPropertiesMapper(),
  jsonPropertiesMapper: new JsonApiPropertiesMapper(),
})

const apiOptions = {
  dataTransformer: (result: AxiosResponse<ChannelResponseInterface> | AxiosResponse<ChannelsResponseInterface>): ChannelJsonModelInterface | Array<ChannelJsonModelInterface> => <ChannelJsonModelInterface | Array<ChannelJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const jsonSchemaValidator = new Ajv()

const moduleState: ChannelState = {

  semaphore: {
    fetching: {
      items: [],
      item: [],
    },
    creating: [],
    updating: [],
    deleting: [],
  },

  firstLoad: [],

}

const moduleGetters: GetterTree<ChannelState, any> = {
  firstLoadFinished: state => (deviceId: string): boolean => {
    return state.firstLoad.includes(deviceId)
  },

  getting: state => (channelId: string): boolean => {
    return state.semaphore.fetching.item.includes(channelId)
  },

  fetching: state => (deviceId: string | null): boolean => {
    return deviceId !== null ? state.semaphore.fetching.items.includes(deviceId) : state.semaphore.fetching.items.length > 0
  },
}

const moduleActions: ActionTree<ChannelState, any> = {
  async get({ state, commit }, payload: { device: DeviceInterface, id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.GETTING,
      id: payload.id,
    })

    try {
      await Channel.api().get(
        `/devices-node/v1/devices/${payload.device.id}/channels/${payload.id}?include=properties,configuration`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'devices-node.channels.get.failed',
        e,
        'Fetching channel failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.GETTING,
        id: payload.id,
      })
    }
  },

  async fetch({ state, commit }, payload: { device: DeviceInterface }): Promise<boolean> {
    if (state.semaphore.fetching.items.includes(payload.device.id) || payload.device.draft) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.FETCHING,
      id: payload.device.id,
    })

    try {
      await Channel.api().get(
        `/devices-node/v1/devices/${payload.device.id}/channels?include=properties,configuration`,
        apiOptions,
      )

      commit('SET_FIRST_LOAD', {
        id: payload.device.id,
      })

      return true
    } catch (e) {
      throw new ApiError(
        'devices-node.channels.fetch.failed',
        e,
        'Fetching channels failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.FETCHING,
        id: payload.device.id,
      })
    }
  },

  async edit({ state, commit }, payload: { channel: ChannelInterface, data: ChannelUpdateInterface }): Promise<Item<Channel>> {
    if (state.semaphore.updating.includes(payload.channel.id)) {
      throw new Error('devices-node.channels.update.inProgress')
    }

    if (!Channel.query().where('id', payload.channel.id).exists()) {
      throw new Error('devices-node.channels.update.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.channel.id,
    })

    try {
      await Channel.update({
        where: payload.channel.id,
        data: payload.data,
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.channel.id,
      })

      throw new OrmError(
        'devices-node.channels.edit.failed',
        e,
        'Edit channel failed.',
      )
    }

    const updatedEntity = Channel.find(payload.channel.id)

    if (updatedEntity === null) {
      const device = Device.find(payload.channel.deviceId)

      // Updated entity could not be loaded from database
      await Channel.dispatch('get', {
        device,
        id: payload.channel.id,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.channel.id,
      })

      throw new Error('devices-node.channels.update.failed')
    }

    try {
      await Channel.api().patch(
        `/devices-node/v1/devices/${updatedEntity.deviceId}/channels/${updatedEntity.id}?include=properties,configuration`,
        jsonApiFormatter.serialize({
          stuff: updatedEntity,
        }),
        apiOptions,
      )

      return Channel.find(payload.channel.id)
    } catch (e) {
      const device = Device.find(payload.channel.deviceId)

      // Updating entity on api failed, we need to refresh entity
      await Channel.dispatch('get', {
        device,
        id: payload.channel.id,
      })

      throw new ApiError(
        'devices-node.channels.update.failed',
        e,
        'Edit channel failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.channel.id,
      })
    }
  },

  transmitCommand(store, payload: { channel: ChannelInterface, command: CommandRoutingKeys }): Promise<boolean> {
    if (!Channel.query().where('id', payload.channel.id).exists()) {
      throw new Error('devices-node.channel.transmit.failed')
    }

    const device = Device.find(payload.channel.deviceId)

    if (device === null) {
      throw new Error('devices-node.channel.transmit.failed')
    }

    return new Promise((resolve, reject) => {
      Channel.wamp().call({
        routing_key: payload.command,
        device: device.identifier,
        channel: payload.channel.channel,
      })
        .then((response: RpCallResponse): void => {
          if (get(response.data, 'response') === 'accepted') {
            resolve(true)
          } else {
            reject(new Error('devices-node.channel.transmit.failed'))
          }
        })
        .catch((): void => {
          reject(new Error('devices-node.channel.transmit.failed'))
        })
    })
  },

  async socketData({ state, commit }, payload: { origin: string, routingKey: string, data: string }): Promise<boolean> {
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
        !Channel.query().where('id', body.id).exists() &&
        (payload.routingKey === RoutingKeys.UPDATED || payload.routingKey === RoutingKeys.DELETED)
      ) {
        throw new Error('devices-node.channels.update.failed')
      }

      if (payload.routingKey === RoutingKeys.DELETED) {
        commit('SET_SEMAPHORE', {
          type: SemaphoreTypes.DELETING,
          id: body.id,
        })

        try {
          await Channel.delete(body.id)
        } catch (e) {
          throw new OrmError(
            'devices-node.channels.delete.failed',
            e,
            'Delete channel failed.',
          )
        } finally {
          commit('CLEAR_SEMAPHORE', {
            type: SemaphoreTypes.DELETING,
            id: body.id,
          })
        }
      } else {
        if (payload.routingKey === RoutingKeys.UPDATED && state.semaphore.updating.includes(body.id)) {
          return true
        }

        commit('SET_SEMAPHORE', {
          type: payload.routingKey === RoutingKeys.UPDATED ? SemaphoreTypes.UPDATING : SemaphoreTypes.CREATING,
          id: body.id,
        })

        const entityData: { [index: string]: any } = {
          type: ChannelEntityTypes.CHANNEL,
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
          await Channel.insertOrUpdate({
            data: entityData,
          })
        } catch (e) {
          const device = Device.query().where('identifier', body.device).first()

          // Updating entity on api failed, we need to refresh entity
          await Channel.dispatch('get', {
            device,
            id: body.id,
          })

          throw new OrmError(
            'devices-node.channels.update.failed',
            e,
            'Edit channel failed.',
          )
        } finally {
          commit('CLEAR_SEMAPHORE', {
            type: payload.routingKey === RoutingKeys.UPDATED ? SemaphoreTypes.UPDATING : SemaphoreTypes.CREATING,
            id: body.id,
          })
        }
      }

      return true
    } else {
      return false
    }
  },

  reset({ commit }): void {
    commit('RESET_STATE')
  },
}

const moduleMutations: MutationTree<ChannelState> = {
  ['SET_FIRST_LOAD'](state: ChannelState, action: FirstLoadAction): void {
    state.firstLoad.push(action.id)

    // Make all keys uniq
    state.firstLoad = uniq(state.firstLoad)
  },

  ['SET_SEMAPHORE'](state: ChannelState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreTypes.FETCHING:
        state.semaphore.fetching.items.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.items = uniq(state.semaphore.fetching.items)
        break

      case SemaphoreTypes.GETTING:
        state.semaphore.fetching.item.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
        break

      case SemaphoreTypes.CREATING:
        state.semaphore.creating.push(action.id)

        // Make all keys uniq
        state.semaphore.creating = uniq(state.semaphore.creating)
        break

      case SemaphoreTypes.UPDATING:
        state.semaphore.updating.push(action.id)

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break

      case SemaphoreTypes.DELETING:
        state.semaphore.deleting.push(action.id)

        // Make all keys uniq
        state.semaphore.deleting = uniq(state.semaphore.deleting)
        break
    }
  },

  ['CLEAR_SEMAPHORE'](state: ChannelState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreTypes.FETCHING:
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

      case SemaphoreTypes.GETTING:
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

      case SemaphoreTypes.CREATING:
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

      case SemaphoreTypes.UPDATING:
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

      case SemaphoreTypes.DELETING:
        // Process all semaphore items
        state.semaphore.deleting
          .forEach((item: string, index: number): void => {
            // Find created item in deleting semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.deleting.splice(index, 1)
            }
          })
        break
    }
  },

  ['RESET_STATE'](state: ChannelState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): ChannelState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
