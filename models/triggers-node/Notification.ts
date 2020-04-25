import { Model, Fields } from '@vuex-orm/core'

import Trigger, { TriggerInterface } from './Trigger'

import {
  TRIGGERS_NOTIFICATION_SMS,
  TRIGGERS_NOTIFICATION_EMAIL,
} from './types'

// CREATE ENTITY INTERFACES
// ========================
export interface CreateSmsNotificationInterface extends NotificationCreateInterface {
  phone: string,
}

export interface CreateEmailNotificationInterface extends NotificationCreateInterface {
  email: string,
}

export interface NotificationCreateInterface {
  id: string | null,
  type: string,

  enabled: boolean,

  trigger_id?: string,
}

// UPDATE ENTITY INTERFACES
// ========================
export interface UpdateSmsNotificationInterface extends NotificationUpdateInterface {
  phone: string,
}

export interface UpdateEmailNotificationInterface extends NotificationUpdateInterface {
  email: string,
}

export interface NotificationUpdateInterface {
  enabled: boolean,
}

// ENTITY INTERFACE
// ================
export interface NotificationInterface {
  id: string,
  type: string,

  enabled: boolean,

  email: string | null,

  phone: string | null,

  relationshipNames: Array<string>,

  trigger_id: string,

  trigger: TriggerInterface,

  isSms: boolean,
  isEmail: boolean,
}

// ENTITY MODEL
// ============
export default class Notification extends Model implements NotificationInterface {
  static get entity(): string {
    return 'notification'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      enabled: this.boolean(true),

      // Email notification
      email: this.string(null).nullable(),

      // SMS notification
      phone: this.string(null).nullable(),

      relationshipNames: this.attr([]),

      trigger_id: this.string(''),

      trigger: this.belongsTo(Trigger, 'id'),
    }
  }

  id!: string;
  type!: string;

  enabled!: boolean;

  email!: string | null;

  phone!: string | null;

  relationshipNames!: Array<string>;

  trigger_id!: string;

  trigger!: TriggerInterface;

  get isSms(): boolean {
    return this.type === TRIGGERS_NOTIFICATION_SMS
  }

  get isEmail(): boolean {
    return this.type === TRIGGERS_NOTIFICATION_EMAIL
  }
}
