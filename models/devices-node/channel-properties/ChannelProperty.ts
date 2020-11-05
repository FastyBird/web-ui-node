import { Fields } from '@vuex-orm/core'
import capitalize from 'lodash/capitalize'

import Hardware from '~/models/devices-node/hardwares/Hardware'
import Channel from '~/models/devices-node/channels/Channel'
import { ChannelInterface } from '~/models/devices-node/channels/types'
import {
  ChannelPropertyEntityTypeType,
  ChannelPropertyInterface,
} from '~/models/devices-node/channel-properties/types'
import Property from '~/models/devices-node/properties/Property'
import { HardwareInterface } from '~/models/devices-node/hardwares/types'

// ENTITY MODEL
// ============
export default class ChannelProperty extends Property implements ChannelPropertyInterface {
  static get entity(): string {
    return 'channel_property'
  }

  static fields(): Fields {
    return Object.assign(Property.fields(), {
      type: this.string(ChannelPropertyEntityTypeType.PROPERTY),

      channel: this.belongsTo(Channel, 'id'),
      channelBackward: this.hasOne(Channel, 'id', 'channelId'),

      channelId: this.string(''),
    })
  }

  type!: ChannelPropertyEntityTypeType

  channel!: ChannelInterface | null
  channelBackward!: ChannelInterface | null

  channelId!: string

  get title(): string {
    if (this.name !== null) {
      return this.name
    }

    if (
      this.hardware !== null &&
      !this.hardware.isCustom &&
      Object.prototype.hasOwnProperty.call(ChannelProperty.store(), '$i18n') &&
      !ChannelProperty.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.title`).toString().includes('devices.vendors.')
    ) {
      return ChannelProperty.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.title`).toString()
    }

    return capitalize(this.property)
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
