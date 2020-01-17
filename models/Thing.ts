import { Model, Fields } from '@vuex-orm/core'
import get from 'lodash/get'
import find from 'lodash/find'

import {
  ChannelInterface,
  DeviceInterface,
  DevicePropertyInterface,
} from '@/node_modules/@fastybird-com/io-logic/types'

import Device from '@/node_modules/@fastybird-com/io-logic/store/modules/io-server/Device'
import Channel from '@/node_modules/@fastybird-com/io-logic/store/modules/io-server/Channel'

import {
  PROPERTY_TYPE_STATE,
} from '@/node_modules/@fastybird-com/io-logic/constants'

export interface ThingInterface {
  id:string,
  device_id:string,
  channel_id:string,
  name:string,
  state:boolean,
  device:DeviceInterface,
  channel:ChannelInterface,
  stateProperty:DevicePropertyInterface | null,
}

export default class Thing extends Model implements ThingInterface {
  static get entity():string {
    return 'thing';
  }

  static fields():Fields {
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
  device!:DeviceInterface;
  channel!:ChannelInterface;

  get name():string {
    return get(this, 'channel.name');
  }

  get state():boolean {
    const property = find(get(this, 'device.properties', []), { property: PROPERTY_TYPE_STATE });

    if (property !== undefined) {
      return property.value === 'ready';
    }

    return false;
  }

  get stateProperty():DevicePropertyInterface | null {
    const property = find(get(this, 'device.properties', []), { property: PROPERTY_TYPE_STATE });

    return typeof property !== 'undefined' ? property : null;
  }
}
