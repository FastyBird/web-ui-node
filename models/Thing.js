import { Model } from '@vuex-orm/core'
import get from 'lodash/get'
import find from 'lodash/find'

import Device from '@/node_modules/@fastybird-com/io-logic/store/modules/io-server/Device'
import Channel from '@/node_modules/@fastybird-com/io-logic/store/modules/io-server/Channel'

import {
  PROPERTY_TYPE_STATE,
} from '@/node_modules/@fastybird-com/io-logic/constants'

export default class Thing extends Model {
  static get entity() {
    return 'thing'
  }

  static fields() {
    return {
      id: this.string(),

      device_id: this.string(),
      channel_id: this.string(),

      device: this.hasOne(Device, 'id', 'device_id'),
      channel: this.hasOne(Channel, 'id', 'channel_id'),
    }
  }

  get name() {
    return get(this, 'channel.name')
  }

  get state() {
    const property = find(get(this, 'device.properties', []), { property: PROPERTY_TYPE_STATE })

    if (property !== undefined) {
      return property.value === 'ready'
    }

    return false
  }

  get stateProperty() {
    return find(get(this, 'device.properties', []), { 'property': PROPERTY_TYPE_STATE })
  }
}
