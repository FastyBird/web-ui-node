import { Model, Fields } from '@vuex-orm/core'

import ChannelConfiguration, { ChannelConfigurationInterface } from './ChannelConfiguration'
import ChannelProperty, { ChannelPropertyInterface } from './ChannelProperty'
import Device, { DeviceInterface } from './Device'

// ENTITY INTERFACE
// ================
export interface ChannelInterface {
  id: string,
  type: string,

  name: string,
  title: string | null,
  comment: string | null,

  channel: string,

  params: any,

  relationshipNames: Array<string>,

  properties: Array<ChannelPropertyInterface>,
  configuration: Array<ChannelConfigurationInterface>,

  device_id: string,

  device: DeviceInterface | null,
}

// ENTITY MODEL
// ============
export default class Channel extends Model implements ChannelInterface {
  static get entity(): string {
    return 'channel';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      // Common channel
      name: this.string(''),
      title: this.string(null).nullable(),
      comment: this.string(null).nullable(),
      channel: this.string(''),
      params: this.attr(''),

      relationshipNames: this.attr([]).nullable(),

      properties: this.hasManyBy(ChannelProperty, 'channel_id'),
      configuration: this.hasManyBy(ChannelConfiguration, 'channel_id'),

      device_id: this.string(''),

      device: this.belongsTo(Device, 'id'),
    }
  }

  id!: string;
  type!: string;

  name!: string;
  title!: string | null;
  comment!: string | null;

  channel!: string;

  params: any;

  relationshipNames!: Array<string>;

  properties!: Array<ChannelPropertyInterface>;
  configuration!: Array<ChannelConfigurationInterface>;

  device_id!: string;

  device!: DeviceInterface | null;
}
