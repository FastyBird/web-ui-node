import {
  ActionTree,
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
import metadata from '@fastybird/node-metadata/resources/schemas/devices-node/entity.device.property.json'
import { Entity } from '@fastybird/node-metadata/types/devices-node.entity.device.property'

import Device from '~/models/devices-node/devices/Device'
import Channel from '~/models/devices-node/channels/Channel'
import { ChannelInterface } from '~/models/devices-node/channels/types'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'
import {
  ChannelPropertyEntityTypes,
  ChannelPropertyInterface,
  ChannelPropertyResponseInterface,
  ChannelPropertiesResponseInterface,
  RoutingKeys,
  SemaphoreTypes,
  PublishRoutingKeys,
} from '~/models/devices-node/channel-properties/types'

import {
  ApiError,
  OrmError,
} from '~/models/devices-node/errors'
import {
  JsonApiModelPropertiesMapper,
  JsonApiPropertiesMapper,
} from '~/models/devices-node/jsonapi'
import {
  ChannelPropertyJsonModelInterface,
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

interface ChannelPropertyState {
  semaphore: SemaphoreState
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
  dataTransformer: (result: AxiosResponse<ChannelPropertyResponseInterface> | AxiosResponse<ChannelPropertiesResponseInterface>): ChannelPropertyJsonModelInterface | Array<ChannelPropertyJsonModelInterface> => <ChannelPropertyJsonModelInterface | Array<ChannelPropertyJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const jsonSchemaValidator = new Ajv()

const moduleState: ChannelPropertyState = {

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

const moduleActions: ActionTree<ChannelPropertyState, any> = {
  async get({ state, commit }, payload: { channel: ChannelInterface, id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.GETTING,
      id: payload.id,
    })

    try {
      await ChannelProperty.api().get(
        `/devices-node/v1/devices/${payload.channel.deviceId}/channels/${payload.channel.id}/properties/${payload.id}`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'devices-node.channel-properties.fetch.failed',
        e,
        'Fetching channel property failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.GETTING,
        id: payload.id,
      })
    }
  },

  async fetch({ state, commit }, payload: { channel: ChannelInterface }): Promise<boolean> {
    if (state.semaphore.fetching.items.includes(payload.channel.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.FETCHING,
      id: payload.channel.id,
    })

    try {
      await ChannelProperty.api().get(
        `/devices-node/v1/devices/${payload.channel.deviceId}/channels/${payload.channel.id}/properties`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'devices-node.channel-properties.fetch.failed',
        e,
        'Fetching channel properties failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.FETCHING,
        id: payload.channel.id,
      })
    }
  },

  async edit({ state, commit }, payload: { property: ChannelPropertyInterface, name?: string | null, unit?: string, format?: string, expected?: any }): Promise<Item<ChannelProperty>> {
    if (state.semaphore.updating.includes(payload.property.id)) {
      throw new Error('devices-node.channel-properties.update.inProgress')
    }

    if (!ChannelProperty.query().where('id', payload.property.id).exists()) {
      throw new Error('devices-node.channel-properties.update.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.property.id,
    })

    try {
      await ChannelProperty.update({
        where: payload.property.id,
        data: payload,
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.property.id,
      })

      throw new OrmError(
        'devices-node.channel-properties.update.failed',
        e,
        'Edit channel property failed.',
      )
    }

    const updatedEntity = ChannelProperty.find(payload.property.id)

    if (updatedEntity === null) {
      const channel = Channel.find(payload.property.channelId)

      // Updated entity could not be loaded from database
      await ChannelProperty.dispatch('get', {
        channel,
        id: payload.property.id,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.property.id,
      })

      throw new Error('devices-node.channel-properties.update.failed')
    }

    const channel = Channel.find(payload.property.channelId)

    if (channel === null) {
      throw new Error('devices-node.channel-properties.update.failed')
    }

    try {
      await ChannelProperty.api().patch(
        `/devices-node/v1/devices/${channel.deviceId}/channels/${updatedEntity.channelId}/properties/${updatedEntity.id}`,
        jsonApiFormatter.serialize({
          stuff: updatedEntity,
        }),
        apiOptions,
      )

      return ChannelProperty.find(payload.property.id)
    } catch (e) {
      // Updating entity on api failed, we need to refresh entity
      await ChannelProperty.dispatch('get', {
        channel,
        id: payload.property.id,
      })

      throw new ApiError(
        'devices-node.channel-properties.update.failed',
        e,
        'Edit channel property failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.property.id,
      })
    }
  },

  async transmitData(store, payload: { property: ChannelPropertyInterface, value: string }): Promise<boolean> {
    if (!ChannelProperty.query().where('id', payload.property.id).exists()) {
      throw new Error('devices-node.channel-properties.transmit.failed')
    }

    const channel = Channel.find(payload.property.channelId)

    if (channel === null) {
      throw new Error('devices-node.channel-properties.transmit.failed')
    }

    const device = Device.find(channel.deviceId)

    if (device === null) {
      throw new Error('devices-node.channel-properties.transmit.failed')
    }

    const backupValue = payload.property.value

    try {
      await ChannelProperty.update({
        where: payload.property.id,
        data: {
          value: payload.value,
        },
      })
    } catch (e) {
      throw new OrmError(
        'devices-node.channel-properties.transmit.failed',
        e,
        'Edit channel property failed.',
      )
    }

    return new Promise((resolve, reject) => {
      ChannelProperty.wamp().call({
        routing_key: PublishRoutingKeys.DATA,
        device: device.identifier,
        channel: channel.channel,
        property: payload.property.property,
        expected: payload.value,
      })
        .then((response: RpCallResponse): void => {
          if (get(response.data, 'response') === 'accepted') {
            resolve(true)
          } else {
            ChannelProperty.update({
              where: payload.property.id,
              data: {
                value: backupValue,
              },
            })

            reject(new Error('devices-node.channel-properties.transmit.failed'))
          }
        })
        .catch((): void => {
          ChannelProperty.update({
            where: payload.property.id,
            data: {
              value: backupValue,
            },
          })

          reject(new Error('devices-node.channel-properties.transmit.failed'))
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
        !ChannelProperty.query().where('id', body.id).exists() &&
        (payload.routingKey === RoutingKeys.UPDATED || payload.routingKey === RoutingKeys.DELETED)
      ) {
        throw new Error('devices-node.channel-properties.update.failed')
      }

      if (payload.routingKey === RoutingKeys.DELETED) {
        commit('SET_SEMAPHORE', {
          type: SemaphoreTypes.DELETING,
          id: body.id,
        })

        try {
          await ChannelProperty.delete(body.id)
        } catch (e) {
          throw new OrmError(
            'devices-node.channel-properties.delete.failed',
            e,
            'Delete channel property failed.',
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
          type: ChannelPropertyEntityTypes.PROPERTY,
        }

        Object.keys(body)
          .forEach((attrName) => {
            const kebabName = attrName.replace(/([a-z][A-Z0-9])/g, g => `${g[0]}_${g[1].toLowerCase()}`)

            if (kebabName === 'channel') {
              const channel = Channel.query().where('channel', body[attrName]).first()

              if (channel !== null) {
                entityData.channelId = channel.id
              }
            } else {
              entityData[kebabName] = body[attrName]
            }
          })

        try {
          await ChannelProperty.insertOrUpdate({
            data: entityData,
          })
        } catch (e) {
          const channel = Channel.query().where('channel', body.channel).first()

          // Updating entity on api failed, we need to refresh entity
          await ChannelProperty.dispatch('get', {
            channel,
            id: body.id,
          })

          throw new OrmError(
            'devices-node.channel-properties.update.failed',
            e,
            'Edit channel property failed.',
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
}

const moduleMutations: MutationTree<ChannelPropertyState> = {
  ['SET_SEMAPHORE'](state: ChannelPropertyState, action: SemaphoreAction): void {
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

  ['CLEAR_SEMAPHORE'](state: ChannelPropertyState, action: SemaphoreAction): void {
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
  state: (): ChannelPropertyState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
