import { Model, Fields } from '@vuex-orm/core'

import Trigger, { TriggerInterface } from './Trigger'

import {
  TRIGGERS_ACTION_DEVICE_PROPERTY,
  TRIGGERS_ACTION_CHANNEL_PROPERTY,
} from './types'

// CREATE ENTITY INTERFACES
// ========================
export interface CreateDevicePropertyActionInterface extends ActionCreateInterface {
  value: string,
  device: string,
  property: string,
}

export interface CreateChannelPropertyActionInterface extends ActionCreateInterface {
  value: string,
  device: string,
  channel: string,
  property: string,
}

export interface ActionCreateInterface {
  id: string | null,
  type: string,

  enabled: boolean,

  trigger_id?: string,
}

// UPDATE ENTITY INTERFACES
// ========================
export interface UpdateDevicePropertyActionInterface extends ActionUpdateInterface {
  value: string,
  device: string,
  property: string,
}

export interface UpdateChannelPropertyActionInterface extends ActionUpdateInterface {
  value: string,
  device: string,
  channel: string,
  property: string,
}

export interface ActionUpdateInterface {
  enabled: boolean,
}

// ENTITY INTERFACE
// ================
export interface ActionInterface {
  id: string,
  type: string,

  enabled: boolean,

  value: string,
  device: string,
  channel: string | null,
  property: string,

  relationshipNames: Array<string>,

  trigger_id: string,

  trigger: TriggerInterface,

  isDeviceProperty: boolean,
  isChannelProperty: boolean,
}

// ENTITY MODEL
// ============
export default class Action extends Model implements ActionInterface {
  static get entity(): string {
    return 'action'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      enabled: this.boolean(true),

      // Device or channel property action
      value: this.string(''),
      device: this.string(''),
      channel: this.string(null).nullable(),
      property: this.string(''),

      relationshipNames: this.attr([]),

      trigger_id: this.string(''),

      trigger: this.belongsTo(Trigger, 'id'),
    }
  }

  id!: string;
  type!: string;

  enabled!: boolean;

  value!: string;
  device!: string;
  channel!: string | null;
  property!: string;

  relationshipNames!: Array<string>;

  trigger_id!: string;

  trigger!: TriggerInterface;

  get isDeviceProperty(): boolean {
    return this.type === TRIGGERS_ACTION_DEVICE_PROPERTY
  }

  get isChannelProperty(): boolean {
    return this.type === TRIGGERS_ACTION_CHANNEL_PROPERTY
  }
}
