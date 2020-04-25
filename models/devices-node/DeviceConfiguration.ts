import { Model, Fields } from '@vuex-orm/core'

import Device, { DeviceInterface } from './Device'

import {
  DEVICES_NODE_DEVICE_CONFIGURATION_BOOLEAN,
  DEVICES_NODE_DEVICE_CONFIGURATION_NUMBER,
  DEVICES_NODE_DEVICE_CONFIGURATION_SELECT,
  DEVICES_NODE_DEVICE_CONFIGURATION_TEXT,
} from './types'

// ENTITY INTERFACE
// ================
export interface DeviceConfigurationInterface {
  id: string,
  type: string,

  name: string,
  title: string | null,
  comment: string | null,
  default: any | null,
  min: number | null,
  max: number | null,
  step: number | null,
  values: Array<string>,

  value: any,

  relationshipNames: Array<string>,

  device_id: string,

  device: DeviceInterface | null,

  isBoolean: boolean,
  isNumber: boolean,
  isSelect: boolean,
  isText: boolean,
}

// ENTITY MODEL
// ============
export default class DeviceConfiguration extends Model implements DeviceConfigurationInterface {
  static get entity(): string {
    return 'device_configuration';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      // Common configuration
      name: this.string(''),
      title: this.string(null).nullable(),
      comment: this.string(null).nullable(),
      default: this.attr(null).nullable(),

      // Specific configuration
      min: this.number(null).nullable(),
      max: this.number(null).nullable(),
      step: this.number(null).nullable(),
      values: this.attr([]),

      // WS data
      value: this.attr(null).nullable(),

      relationshipNames: this.attr([]).nullable(),

      device_id: this.string(''),

      device: this.belongsTo(Device, 'id'),
    }
  }

  id!: string;
  type!: string;

  device_id!: string;

  name!: string;
  title!: string | null;
  comment!: string | null;
  default!: any | null;

  min!: number | null;
  max!: number | null;
  step!: number | null;
  values!: Array<string>;

  value!: any;

  relationshipNames!: Array<string>;

  device!: DeviceInterface | null;

  get isBoolean(): boolean {
    return this.type === DEVICES_NODE_DEVICE_CONFIGURATION_BOOLEAN;
  }

  get isNumber(): boolean {
    return this.type === DEVICES_NODE_DEVICE_CONFIGURATION_NUMBER;
  }

  get isSelect(): boolean {
    return this.type === DEVICES_NODE_DEVICE_CONFIGURATION_SELECT;
  }

  get isText(): boolean {
    return this.type === DEVICES_NODE_DEVICE_CONFIGURATION_TEXT;
  }
}
