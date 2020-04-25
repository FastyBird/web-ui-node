import { Model, Fields } from '@vuex-orm/core'

import DeviceProperty, { DevicePropertyInterface } from './DeviceProperty'
import DeviceConfiguration, { DeviceConfigurationInterface } from './DeviceConfiguration'
import Channel, { ChannelInterface } from './Channel'
import Hardware, { HardwareInterface } from './Hardware'
import Firmware, { FirmwareInterface } from './Firmware'
import Credentials, { CredentialsInterface } from './Credentials'

// ENTITY INTERFACE
// ================
export interface DeviceInterface {
  id: string,
  type: string,

  parent_id: string | null,

  name: string,
  title: string | null,
  comment: string | null,
  state: string,
  is_enabled: boolean,
  control: Array<string>,

  identifier: string | null,

  params: any,

  relationshipNames: Array<string>,

  channel_ids: Array<string>,

  children: Array<DeviceInterface>,
  channels: Array<ChannelInterface>,
  properties: Array<DevicePropertyInterface>,
  configuration: Array<DeviceConfigurationInterface>,

  hardware: HardwareInterface | null,
  firmware: FirmwareInterface | null,
  credentials: CredentialsInterface | null,

  isEnabled: boolean,
}

// ENTITY MODEL
// ============
export default class Device extends Model implements DeviceInterface {
  static get entity(): string {
    return 'device';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      parent_id: this.string(null).nullable(),

      // Common device
      name: this.string(''),
      title: this.string(null).nullable(),
      comment: this.string(null).nullable(),
      state: this.string(''),
      is_enabled: this.boolean(false),
      control: this.attr([]),
      params: this.attr(null),

      // Physical device
      identifier: this.string(null).nullable(),

      relationshipNames: this.attr([]).nullable(),

      // Common device
      channel_ids: this.attr(null),

      children: this.hasMany(Device, 'parent_id'),
      channels: this.hasMany(Channel, 'device_id'),
      properties: this.hasMany(DeviceProperty, 'device_id'),
      configuration: this.hasMany(DeviceConfiguration, 'device_id'),

      // Physical device
      hardware: this.hasOne(Hardware, 'device_id'),
      firmware: this.hasOne(Firmware, 'device_id'),
      credentials: this.hasOne(Credentials, 'device_id'),
    }
  }

  id!: string;
  type!: string;

  parent_id!: string | null;

  name!: string;
  title!: string | null;
  comment!: string | null;
  state!: string;
  is_enabled!: boolean;
  control!: Array<string>
  params!: any;

  identifier!: string | null;

  relationshipNames!: Array<string>;

  channel_ids!: Array<string>;

  children!: Array<DeviceInterface>;
  channels!: Array<ChannelInterface>;
  properties!: Array<DevicePropertyInterface>;
  configuration!: Array<DeviceConfigurationInterface>;

  hardware!: HardwareInterface | null;
  firmware!: FirmwareInterface | null;
  credentials!: CredentialsInterface | null;

  get isEnabled(): boolean {
    return this.is_enabled
  }
}
