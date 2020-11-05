import {
  ModelPropertiesMapper,
  JsonPropertiesMapper,
} from 'jsona'
import {
  IModelPropertiesMapper,
  IJsonPropertiesMapper,
  TAnyKeyValueObject,
  TJsonaModel,
  TJsonaRelationships,
  TJsonaRelationshipBuild,
} from 'jsona/lib/JsonaTypes'
import { defineRelationGetter } from 'jsona/lib/simplePropertyMappers'
import clone from 'lodash/clone'
import get from 'lodash/get'

import Device from '~/models/devices-node/devices/Device'
import { DeviceEntityTypeType } from '~/models/devices-node/devices/types'
import { DevicePropertyEntityTypeType } from '~/models/devices-node/device-properties/types'
import { DeviceConfigurationEntityTypeType } from '~/models/devices-node/device-configuration/types'
import { HardwareEntityTypeType } from '~/models/devices-node/hardwares/types'
import { FirmwareEntityTypeType } from '~/models/devices-node/firmwares/types'
import Channel from '~/models/devices-node/channels/Channel'
import { ChannelEntityTypeType } from '~/models/devices-node/channels/types'
import { ChannelPropertyEntityTypeType } from '~/models/devices-node/channel-properties/types'
import { ChannelConfigurationEntityTypeType } from '~/models/devices-node/channel-configuration/types'
import { RelationInterface } from '~/models/devices-node/types'

const RELATIONSHIP_NAMES_PROP = 'relationshipNames'

export class JsonApiModelPropertiesMapper extends ModelPropertiesMapper implements IModelPropertiesMapper {
  getAttributes(model: TJsonaModel) {
    const exceptProps = ['id', '$id', 'type', 'draft', RELATIONSHIP_NAMES_PROP]

    if (
      model.type === ChannelEntityTypeType.CHANNEL ||
      model.type === DevicePropertyEntityTypeType.PROPERTY ||
      model.type === DeviceConfigurationEntityTypeType.BOOLEAN ||
      model.type === DeviceConfigurationEntityTypeType.NUMBER ||
      model.type === DeviceConfigurationEntityTypeType.SELECT ||
      model.type === DeviceConfigurationEntityTypeType.TEXT ||
      model.type === HardwareEntityTypeType.HARDWARE ||
      model.type === FirmwareEntityTypeType.FIRMWARE
    ) {
      exceptProps.push('deviceId')
    } else if (
      model.type === ChannelPropertyEntityTypeType.PROPERTY ||
      model.type === ChannelConfigurationEntityTypeType.BOOLEAN ||
      model.type === ChannelConfigurationEntityTypeType.NUMBER ||
      model.type === ChannelConfigurationEntityTypeType.SELECT ||
      model.type === ChannelConfigurationEntityTypeType.TEXT
    ) {
      exceptProps.push('channelId')
    }

    if (Array.isArray(model[RELATIONSHIP_NAMES_PROP])) {
      exceptProps.push(...model[RELATIONSHIP_NAMES_PROP])
    }

    const attributes: { [index: string]: any } = {}

    Object.keys(model)
      .forEach((attrName) => {
        if (!exceptProps.includes(attrName)) {
          const kebabName = attrName.replace(/([a-z][A-Z0-9])/g, g => `${g[0]}_${g[1].toLowerCase()}`)

          let jsonAttributes = model[attrName]

          if (typeof jsonAttributes === 'object' && jsonAttributes !== null) {
            jsonAttributes = {}

            Object.keys(model[attrName]).forEach((subAttrName) => {
              const kebabSubName = subAttrName.replace(/([a-z][A-Z0-9])/g, g => `${g[0]}_${g[1].toLowerCase()}`)

              Object.assign(jsonAttributes, { [kebabSubName]: model[attrName][subAttrName] })
            })
          }

          attributes[kebabName] = jsonAttributes
        }
      })

    return attributes
  }

  getRelationships(model: TJsonaModel): TJsonaRelationships {
    if (
      !Object.prototype.hasOwnProperty.call(model, RELATIONSHIP_NAMES_PROP) ||
      !Array.isArray(model[RELATIONSHIP_NAMES_PROP])
    ) {
      return {}
    }

    const relationshipNames = model[RELATIONSHIP_NAMES_PROP]

    const relationships: { [index: string]: RelationInterface | Array<RelationInterface> } = {}

    relationshipNames
      .forEach((relationName: string) => {
        const kebabName = relationName.replace(/([a-z][A-Z0-9])/g, g => `${g[0]}_${g[1].toLowerCase()}`)

        if (model[relationName] !== undefined) {
          if (Array.isArray(model[relationName])) {
            relationships[kebabName] = model[relationName]
              .map((item: TJsonaModel) => {
                return {
                  id: item.id,
                  type: item.type,
                }
              })
          } else if (typeof model[relationName] === 'object' && model[relationName] !== null) {
            relationships[kebabName] = {
              id: model[relationName].id,
              type: model[relationName].type,
            }
          }
        }
      })

    if (Object.prototype.hasOwnProperty.call(model, 'deviceId')) {
      const device = Device.find(model.deviceId)

      if (device !== null) {
        relationships.device = {
          id: device.id,
          type: device.type,
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(model, 'channelId')) {
      const channel = Channel.find(model.deviceId)

      if (channel !== null) {
        relationships.channel = {
          id: channel.id,
          type: channel.type,
        }
      }
    }

    return relationships
  }
}

export class JsonApiPropertiesMapper extends JsonPropertiesMapper implements IJsonPropertiesMapper {
  createModel(type: string): TJsonaModel {
    return { type }
  }

  setId(model: TJsonaModel, id: string): void {
    Object.assign(model, { id })
  }

  setAttributes(model: TJsonaModel, attributes: TAnyKeyValueObject): void {
    const regex = new RegExp('_([a-z0-9])', 'g')

    Object.keys(attributes).forEach((propName) => {
      const camelName = propName.replace(regex, g => g[1].toUpperCase())

      let modelAttributes = attributes[propName]

      if (typeof modelAttributes === 'object' && modelAttributes !== null) {
        modelAttributes = {}

        Object.keys(attributes[propName]).forEach((subPropName) => {
          const camelSubName = subPropName.replace(regex, g => g[1].toUpperCase())

          Object.assign(modelAttributes, { [camelSubName]: attributes[propName][subPropName] })
        })
      }

      if (propName === 'control') {
        modelAttributes = Object.values(attributes[propName])
      }

      Object.assign(model, { [camelName]: modelAttributes })
    })

    // Entity received via api is not a draft entity
    Object.assign(model, { draft: false })
  }

  setRelationships(model: TJsonaModel, relationships: TJsonaRelationships): void {
    Object.keys(relationships)
      .forEach((propName) => {
        const regex = new RegExp('_([a-z0-9])', 'g')
        const camelName = propName.replace(regex, g => g[1].toUpperCase())

        if (typeof relationships[propName] === 'function') {
          defineRelationGetter(model, propName, <TJsonaRelationshipBuild>relationships[propName])
        } else {
          const relation = clone(relationships[propName])

          if (Array.isArray(relation)) {
            Object.assign(
              model,
              {
                [camelName]: relation.map((item: TJsonaModel) => {
                  let transformed = item

                  transformed = this.transformDevice(transformed)
                  transformed = this.transformChannel(transformed)

                  return transformed
                }),
              },
            )
          } else if (
            get(relation, 'type') === DeviceEntityTypeType.PHYSICAL
          ) {
            Object.assign(model, { deviceId: get(relation, 'id') })
          } else if (
            get(relation, 'type') === ChannelEntityTypeType.CHANNEL
          ) {
            Object.assign(model, { channelId: get(relation, 'id') })
          } else {
            Object.assign(model, { [camelName]: relation })
          }
        }
      })

    const newNames = Object.keys(relationships)
    const currentNames = model[RELATIONSHIP_NAMES_PROP]

    if (currentNames && currentNames.length) {
      Object.assign(model, { [RELATIONSHIP_NAMES_PROP]: [...currentNames, ...newNames].filter((value, i, self) => self.indexOf(value) === i) })
    } else {
      Object.assign(model, { [RELATIONSHIP_NAMES_PROP]: newNames })
    }
  }

  transformDevice(item: TJsonaModel): TJsonaModel {
    if (Object.prototype.hasOwnProperty.call(item, 'device')) {
      Object.assign(item, { deviceId: item.device.id })
      Reflect.deleteProperty(item, 'device')
    }

    return item
  }

  transformChannel(item: TJsonaModel): TJsonaModel {
    if (Object.prototype.hasOwnProperty.call(item, 'channel')) {
      Object.assign(item, { channelId: item.channel.id })
      Reflect.deleteProperty(item, 'channel')
    }

    return item
  }
}
