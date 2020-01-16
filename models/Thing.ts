import { Model, Fields } from '@vuex-orm/core'
import get from 'lodash/get'
import find from 'lodash/find'

// @ts-ignore
import Device from '@/node_modules/@fastybird-com/io-logic/store/modules/io-server/Device'
// @ts-ignore
import Channel from '@/node_modules/@fastybird-com/io-logic/store/modules/io-server/Channel'
// @ts-ignore
import DeviceProperty from '@/node_modules/@fastybird-com/io-logic/store/modules/io-server/DeviceProperty'

import {
  PROPERTY_TYPE_STATE,
// @ts-ignore
} from '@/node_modules/@fastybird-com/io-logic/constants'

export interface ThingInterface {
  id:string,
  device_id:string,
  channel_id:string,
  name:string,
  state:boolean,
  device:Device,
  channel:Channel,
  stateProperty?:DeviceProperty,
}

export default class Thing extends Model implements ThingInterface {
  static get entity(): string {
    return 'thing';
  }

  static fields(): Fields {
    return {
      id: this.string(''),

      device_id: this.string(''),
      channel_id: this.string(''),

      device: this.hasOne(Device, 'id', 'device_id'),
      channel: this.hasOne(Channel, 'id', 'channel_id'),
    }
  }

  id!:string;
  device_id!:string;
  channel_id!:string;
  device!:Device;
  channel!:Channel;

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
    return find(get(this, 'device.properties', []), { property: PROPERTY_TYPE_STATE })
  }
}
