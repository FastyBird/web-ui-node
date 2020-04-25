import { Model, Fields } from '@vuex-orm/core'
import get from 'lodash/get'

import Device, { DeviceInterface } from '~/models/devices-node/Device'
import Channel, { ChannelInterface } from '~/models/devices-node/Channel'

// ENTITY INTERFACE
// ================
export interface ThingInterface {
  id: string,

  device_id: string,
  channel_id: string,

  device: DeviceInterface,
  channel: ChannelInterface,

  name: string,
  state: boolean,
}

// ENTITY MODEL
// ============
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

  id!: string;

  device_id!: string;
  channel_id!: string;

  device!: DeviceInterface;
  channel!: ChannelInterface;

  get name(): string {
    return get(this, 'channel.name');
  }

  get state(): boolean {
    return this.device !== null && this.device.state === 'ready';
  }
}
