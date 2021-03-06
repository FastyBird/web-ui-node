import {
  Model,
  Fields,
} from '@vuex-orm/core'
import capitalize from 'lodash/capitalize'

import Device from '~/models/devices-module/devices/Device'
import { DeviceInterface } from '~/models/devices-module/devices/types'
import Hardware from '~/models/devices-module/hardwares/Hardware'
import {
  ChannelInterface,
  ChannelEntityTypes,
} from '~/models/devices-module/channels/types'
import ChannelProperty from '~/models/devices-module/channel-properties/ChannelProperty'
import { ChannelPropertyInterface } from '~/models/devices-module/channel-properties/types'
import ChannelConfiguration from '~/models/devices-module/channel-configuration/ChannelConfiguration'
import { ChannelConfigurationInterface } from '~/models/devices-module/channel-configuration/types'

// ENTITY MODEL
// ============

export default class Channel extends Model implements ChannelInterface {
  static get entity(): string {
    return 'channel'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(ChannelEntityTypes.CHANNEL),

      // Common channel
      channel: this.string(''),
      name: this.string(null).nullable(),
      comment: this.string(null).nullable(),

      control: this.attr([]),

      // Relations
      relationshipNames: this.attr([]),

      properties: this.hasMany(ChannelProperty, 'channelId'),
      configuration: this.hasMany(ChannelConfiguration, 'channelId'),

      device: this.belongsTo(Device, 'id'),
      deviceBackward: this.hasOne(Device, 'id', 'deviceId'),

      deviceId: this.string(''),
    }
  }

  id!: string
  type!: ChannelEntityTypes

  channel!: string
  name!: string | null
  comment!: string | null

  control!: Array<string>

  relationshipNames!: Array<string>

  properties!: Array<ChannelPropertyInterface>
  configuration!: Array<ChannelConfigurationInterface>

  device!: DeviceInterface | null
  deviceBackward!: DeviceInterface | null

  deviceId!: string

  get title(): string {
    if (this.name !== null) {
      return this.name
    }

    if (Object.prototype.hasOwnProperty.call(Channel.store(), '$i18n')) {
      const hardware = Hardware
        .query()
        .where('deviceId', this.deviceId)
        .first()

      if (!hardware || hardware.isCustom) {
        return capitalize(this.channel)
      }

      if (this.channel.includes('_')) {
        const channelPart = this.channel.substring(0, (this.channel.indexOf('_')))
        const channelNum = parseInt(this.channel.substring(this.channel.indexOf('_') + 1), 10)

        if (!Channel.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.devices.${hardware.model}.channels.${channelPart}`).toString().includes('devices.vendors.')) {
          return Channel.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.devices.${hardware.model}.channels.${channelPart}`, { number: (channelNum + 1) }).toString()
        }
      }

      if (!Channel.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.devices.${hardware.model}.channels.${this.channel}`).toString().includes('devices.vendors.')) {
        return Channel.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.devices.${hardware.model}.channels.${this.channel}`).toString()
      }
    }

    return capitalize(this.channel)
  }
}
