import { Model, Fields } from '@vuex-orm/core'

import Channel, { ChannelInterface } from './Channel'

import {
  DEVICES_NODE_CHANNEL_CONFIGURATION_BOOLEAN,
  DEVICES_NODE_CHANNEL_CONFIGURATION_NUMBER,
  DEVICES_NODE_CHANNEL_CONFIGURATION_SELECT,
  DEVICES_NODE_CHANNEL_CONFIGURATION_TEXT,
} from './types'

// ENTITY INTERFACE
// ================
export interface ChannelConfigurationInterface {
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

  channel_id: string,

  channel: ChannelInterface | null,

  isBoolean: boolean,
  isNumber: boolean,
  isSelect: boolean,
  isText: boolean,
}

// ENTITY MODEL
// ============
export default class ChannelConfiguration extends Model implements ChannelConfigurationInterface {
  static get entity(): string {
    return 'channel_configuration';
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

      channel_id: this.string(''),

      channel: this.belongsTo(Channel, 'id'),
    }
  }

  id!: string;
  type!: string;

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

  channel_id!: string;

  channel!: ChannelInterface | null;

  get isBoolean(): boolean {
    return this.type === DEVICES_NODE_CHANNEL_CONFIGURATION_BOOLEAN;
  }

  get isNumber(): boolean {
    return this.type === DEVICES_NODE_CHANNEL_CONFIGURATION_NUMBER;
  }

  get isSelect(): boolean {
    return this.type === DEVICES_NODE_CHANNEL_CONFIGURATION_SELECT;
  }

  get isText(): boolean {
    return this.type === DEVICES_NODE_CHANNEL_CONFIGURATION_TEXT;
  }
}
