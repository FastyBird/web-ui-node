import {
  Model,
  Fields,
} from '@vuex-orm/core'
import capitalize from 'lodash/capitalize'

import Channel from '~/models/devices-node/channels/Channel'
import { ChannelInterface } from '~/models/devices-node/channels/types'
import {
  ChannelConfigurationEntityTypeType,
  ChannelConfigurationInterface,
  ValuesItemInterface,
} from '~/models/devices-node/channel-configuration/types'
import Hardware from '~/models/devices-node/hardwares/Hardware'
import { HardwareInterface } from '~/models/devices-node/hardwares/types'

// ENTITY MODEL
// ============
export default class ChannelConfiguration extends Model implements ChannelConfigurationInterface {
  static get entity(): string {
    return 'channel_configuration'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      // Common configuration
      configuration: this.string(''),
      name: this.string(null).nullable(),
      comment: this.string(null).nullable(),
      default: this.attr(null).nullable(),

      // Specific configuration
      min: this.number(null).nullable(),
      max: this.number(null).nullable(),
      step: this.number(null).nullable(),
      values: this.attr([]),

      // WS data
      value: this.attr(null).nullable(),

      // Relations
      relationshipNames: this.attr([]),

      channel: this.belongsTo(Channel, 'id'),
      channelBackward: this.hasOne(Channel, 'id', 'channelId'),

      channelId: this.string(''),
    }
  }

  id!: string
  type!: ChannelConfigurationEntityTypeType

  configuration!: string
  name!: string | null
  comment!: string | null
  default!: any | null

  min!: number | null
  max!: number | null
  step!: number | null
  values!: Array<ValuesItemInterface>

  value!: any

  relationshipNames!: Array<string>

  channel!: ChannelInterface | null
  channelBackward!: ChannelInterface | null

  channelId!: string

  get isBoolean(): boolean {
    return this.type === ChannelConfigurationEntityTypeType.BOOLEAN
  }

  get isNumber(): boolean {
    return this.type === ChannelConfigurationEntityTypeType.NUMBER
  }

  get isSelect(): boolean {
    return this.type === ChannelConfigurationEntityTypeType.SELECT
  }

  get isText(): boolean {
    return this.type === ChannelConfigurationEntityTypeType.TEXT
  }

  get title(): string {
    if (this.name !== null) {
      return this.name
    }

    if (
      this.hardware !== null &&
      !this.hardware.isCustom &&
      Object.prototype.hasOwnProperty.call(ChannelConfiguration.store(), '$i18n') &&
      !ChannelConfiguration.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.configuration.${this.configuration}.title`).toString().includes('devices.vendors.')
    ) {
      return ChannelConfiguration.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.configuration.${this.configuration}.title`).toString()
    }

    return capitalize(this.configuration)
  }

  get description(): string | null {
    if (this.comment !== null) {
      return this.comment
    }

    if (
      this.hardware !== null &&
      !this.hardware.isCustom &&
      Object.prototype.hasOwnProperty.call(ChannelConfiguration.store(), '$i18n') &&
      !ChannelConfiguration.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.configuration.${this.configuration}.description`).toString().includes('devices.vendors.')
    ) {
      return ChannelConfiguration.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.configuration.${this.configuration}.description`).toString()
    }

    return null
  }

  get selectValues(): Array<ValuesItemInterface> {
    if (!this.isSelect) {
      throw new Error(`This field is not allowed for entity type ${this.type}`)
    }

    if (
      this.hardware !== null &&
      !this.hardware.isCustom &&
      Object.prototype.hasOwnProperty.call(ChannelConfiguration.store(), '$i18n')
    ) {
      const items: Array<ValuesItemInterface> = []

      const hardware = this.hardware

      this.values
        .forEach((item) => {
          items.push({
            value: item.value,
            name: ChannelConfiguration.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.configuration.${this.configuration}.values.${item.name}`).toString(),
          })
        })

      return items
    }

    return this.values
  }

  get formattedValue(): any {
    if (this.isSelect) {
      if (
        this.hardware !== null &&
        !this.hardware.isCustom &&
        Object.prototype.hasOwnProperty.call(ChannelConfiguration.store(), '$i18n')
      ) {
        const hardware = this.hardware

        this.values
          .forEach((item) => {
            // eslint-disable-next-line eqeqeq
            if (item.value == this.value) {
              if (!ChannelConfiguration.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.configuration.${this.configuration}.values.${item.name}`).toString().includes('devices.vendors.')) {
                return ChannelConfiguration.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.configuration.${this.configuration}.values.${item.name}`)
              } else {
                return this.value
              }
            }
          })
      }
    }

    return this.value
  }

  get hardware(): HardwareInterface | null {
    const channel = Channel.find(this.channelId)

    if (channel === null) {
      return null
    }

    return Hardware
      .query()
      .where('deviceId', channel.deviceId)
      .first()
  }
}
