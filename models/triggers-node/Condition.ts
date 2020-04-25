import { Model, Fields } from '@vuex-orm/core'

import Trigger, { TriggerInterface } from './Trigger'

import {
  TRIGGERS_CONDITION_DEVICE_PROPERTY,
  TRIGGERS_CONDITION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_TIME,
  TRIGGERS_CONDITION_DATE,
} from './types'

// CREATE ENTITY INTERFACES
// ========================
export interface CreateDevicePropertyConditionInterface extends ConditionCreateInterface {
  operator: string,
  operand: string,
  device: string,
  property: string,
}

export interface CreateChannelPropertyConditionInterface extends ConditionCreateInterface {
  operator: string,
  operand: string,
  device: string,
  channel: string,
  property: string,
}

export interface CreateDateConditionInterface extends ConditionCreateInterface {
  date: string,
}

export interface CreateTimeConditionInterface extends ConditionCreateInterface {
  time: string,
  days: Array<number>,
}

export interface ConditionCreateInterface {
  id: string | null,
  type: string,

  enabled: boolean,

  trigger_id?: string,
}

// UPDATE ENTITY INTERFACES
// ========================
export interface UpdateDevicePropertyConditionInterface extends ConditionUpdateInterface {
  operator: string,
  operand: string,
  device: string,
  property: string,
}

export interface UpdateChannelPropertyConditionInterface extends ConditionUpdateInterface {
  operator: string,
  operand: string,
  device: string,
  channel: string,
  property: string,
}

export interface UpdateDateConditionInterface extends ConditionUpdateInterface {
  date: string,
}

export interface UpdateTimeConditionInterface extends ConditionUpdateInterface {
  time: string,
  days: Array<number>,
}

export interface ConditionUpdateInterface {
  enabled: boolean,
}

// ENTITY INTERFACE
// ================
export interface ConditionInterface {
  id: string,
  type: string,

  enabled: boolean,

  operator: string | null,
  operand: string | null,
  device: string | null,
  channel: string | null,
  property: string | null,

  time: string | null,
  days: Array<number>,

  date: string | null,

  relationshipNames: Array<string>,

  trigger_id: string,

  trigger: TriggerInterface,

  isDeviceProperty: boolean,
  isChannelProperty: boolean,
  isTime: boolean,
  isDate: boolean,
}

// ENTITY MODEL
// ============
export default class Condition extends Model implements ConditionInterface {
  static get entity(): string {
    return 'condition'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      enabled: this.boolean(true),

      // Device or channel property condition
      operator: this.string(null).nullable(),
      operand: this.attr(null).nullable(),
      device: this.string(null).nullable(),
      channel: this.string(null).nullable(),
      property: this.string(null).nullable(),

      // Time condition
      time: this.attr(null).nullable(),
      days: this.attr([]),

      // Date condition
      date: this.attr(null),

      relationshipNames: this.attr([]),

      trigger_id: this.string(''),

      trigger: this.belongsTo(Trigger, 'id'),
    }
  }

  id!: string;
  type!: string;

  enabled!: boolean;

  operator!: string | null;
  operand!: string | null;
  device!: string | null;
  channel!: string | null;
  property!: string | null;

  time!: string | null;
  days!: Array<number>;

  date!: string | null;

  relationshipNames!: Array<string>;

  trigger_id!: string;

  trigger!: TriggerInterface;

  get isDeviceProperty(): boolean {
    return this.type === TRIGGERS_CONDITION_DEVICE_PROPERTY
  }

  get isChannelProperty(): boolean {
    return this.type === TRIGGERS_CONDITION_CHANNEL_PROPERTY
  }

  get isTime(): boolean {
    return this.type === TRIGGERS_CONDITION_TIME
  }

  get isDate(): boolean {
    return this.type === TRIGGERS_CONDITION_DATE
  }
}
