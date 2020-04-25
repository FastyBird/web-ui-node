import { Model, Fields } from '@vuex-orm/core'

import {
  TRIGGER_AUTOMATIC,
  TRIGGER_MANUAL,
  TRIGGER_CHANNEL_PROPERTY,
} from './types'

import Action, { ActionInterface, ActionCreateInterface } from './Action'
import Condition, { ConditionInterface, ConditionCreateInterface } from './Condition'
import Notification, { NotificationInterface, NotificationCreateInterface } from './Notification'

// CREATE ENTITY INTERFACES
// ========================
export interface CreateChannelPropertyTriggerInterface extends TriggerCreateInterface {
  operator: string,
  operand: string,
  device: string,
  channel: string,
  property: string,
}

export interface CreateManualTriggerInterface extends TriggerCreateInterface {
  date: string,
}

export interface CreateAutomaticTriggerInterface extends TriggerCreateInterface {
  conditions: Array<ConditionCreateInterface>,
}

export interface TriggerCreateInterface {
  id: string | null,
  type: string,

  name: string,
  comment: string | null,
  enabled: boolean,

  actions: Array<ActionCreateInterface>,
  notifications: Array<NotificationCreateInterface>,
}

// ENTITY INTERFACE
// ================
export interface TriggerInterface {
  id: string,
  type: string,

  name: string,
  comment: string | null,
  enabled: boolean,

  params: any | null,

  relationshipNames: Array<string>,

  actions: Array<ActionInterface>,
  conditions: Array<ConditionInterface>,
  notifications: Array<NotificationInterface>,

  operator: string | null,
  operand: string | null,
  device: string | null,
  channel: string | null,
  property: string | null,

  hasComment: boolean,
  isAutomatic: boolean,
  isManual: boolean,
  isForChannel: boolean,
}

// ENTITY MODEL
// ============
export default class Trigger extends Model implements TriggerInterface {
  static get entity(): string {
    return 'trigger'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      name: this.string(''),
      comment: this.string(null).nullable(),
      enabled: this.boolean(true),

      params: this.attr(null).nullable(),

      relationshipNames: this.attr([]),

      actions: this.hasMany(Action, 'trigger_id'),
      conditions: this.hasMany(Condition, 'trigger_id'),
      notifications: this.hasMany(Notification, 'trigger_id'),

      device: this.string(null).nullable(),
      channel: this.string(null).nullable(),
      property: this.string(null).nullable(),
      operator: this.string(null).nullable(),
      operand: this.string(null).nullable(),
    }
  }

  id!: string;
  type!: string;

  name!: string;
  comment!: string | null;
  enabled!: boolean;

  params!: any | null;

  relationshipNames!: Array<string>;

  actions!: Array<ActionInterface>;
  conditions!: Array<ConditionInterface>;
  notifications!: Array<NotificationInterface>;

  operator!: string | null;
  operand!: string | null;
  device!: string | null;
  channel!: string | null;
  property!: string | null;

  get hasComment(): boolean {
    return this.comment !== null && this.comment !== ''
  }

  get isAutomatic(): boolean {
    return this.type === TRIGGER_AUTOMATIC
  }

  get isManual(): boolean {
    return this.type === TRIGGER_MANUAL
  }

  get isForChannel(): boolean {
    return this.type === TRIGGER_CHANNEL_PROPERTY
  }
}
