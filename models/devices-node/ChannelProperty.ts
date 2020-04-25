import { Model, Fields } from '@vuex-orm/core'

import Channel, { ChannelInterface } from './Channel'

import number from './number'

import {
  DATATYPE_INTEGER,
  DATATYPE_FLOAT,
  DATATYPE_BOOLEAN,
  DATATYPE_STRING,
  DATATYPE_ENUM,
  DATATYPE_COLOR,
} from './constants'

// ENTITY INTERFACE
// ================
export interface ChannelPropertyInterface {
  id: string,
  type: string,

  property: string,
  is_settable: boolean,
  is_queryable: boolean,
  datatype: string,
  format: string | null,
  unit: string | null,

  value: any,
  command: string | null,
  backup: string | null,

  relationshipNames: Array<string>,

  channel_id: string,

  channel: ChannelInterface | null,

  isInteger: boolean,
  isFloat: boolean,
  isNumber: boolean,
  isBoolean: boolean,
  isString: boolean,
  isEnum: boolean,
  isColor: boolean,

  isSettable: boolean,
  isQueryable: boolean,

  formattedValue: string,
}

// ENTITY MODEL
// ============
export default class ChannelProperty extends Model implements ChannelPropertyInterface {
  static get entity(): string {
    return 'channel_property';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      // Common property
      property: this.string(''),
      is_settable: this.boolean(false),
      is_queryable: this.boolean(false),
      datatype: this.string(''),
      format: this.string(null).nullable(),
      unit: this.string(null).nullable(),

      // WS data
      value: this.attr(null).nullable(),
      command: this.string(null).nullable(),
      backup: this.string(null).nullable(),

      relationshipNames: this.attr([]).nullable(),

      channel_id: this.string(''),

      channel: this.belongsTo(Channel, 'id'),
    }
  }

  id!: string;
  type!: string;

  property!: string;
  is_settable!: boolean;
  is_queryable!: boolean;
  datatype!: string;
  format!: string | null;
  unit!: string | null;

  value!: any;
  command!: string | null;
  backup!: string | null;

  relationshipNames!: Array<string>;

  channel_id!: string;

  channel!: ChannelInterface | null;

  get isInteger(): boolean {
    return this.datatype === DATATYPE_INTEGER;
  }

  get isFloat(): boolean {
    return this.datatype === DATATYPE_FLOAT;
  }

  get isNumber(): boolean {
    return this.datatype === DATATYPE_INTEGER || this.datatype === DATATYPE_FLOAT;
  }

  get isBoolean(): boolean {
    return this.datatype === DATATYPE_BOOLEAN;
  }

  get isString(): boolean {
    return this.datatype === DATATYPE_STRING;
  }

  get isEnum(): boolean {
    return this.datatype === DATATYPE_ENUM;
  }

  get isColor(): boolean {
    return this.datatype === DATATYPE_COLOR;
  }

  get isSettable(): boolean {
    return this.is_settable;
  }

  get isQueryable(): boolean {
    return this.is_queryable;
  }

  get formattedValue(): string {
    return number.format(parseFloat(this.value), 2, ',', ' ')
  }
}
