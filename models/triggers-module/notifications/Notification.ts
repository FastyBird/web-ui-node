import {
  Fields,
  Model,
} from '@vuex-orm/core'

import Trigger from '~/models/triggers-module/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-module/triggers/types'
import {
  NotificationEntityTypes,
  NotificationInterface,
} from '~/models/triggers-module/notifications/types'

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

      draft: this.boolean(false),

      enabled: this.boolean(true),

      // Email notification
      email: this.string(null).nullable(),

      // SMS notification
      phone: this.string(null).nullable(),

      relationshipNames: this.attr([]),

      trigger: this.belongsTo(Trigger, 'id'),
      triggerBackward: this.hasOne(Trigger, 'id', 'triggerId'),

      triggerId: this.string(''),
    }
  }

  id!: string
  type!: NotificationEntityTypes

  draft!: boolean

  enabled!: boolean

  email!: string

  phone!: string

  relationshipNames!: Array<string>

  trigger!: TriggerInterface | null
  triggerBackward!: TriggerInterface | null

  triggerId!: string

  get isSms(): boolean {
    return this.type === NotificationEntityTypes.SMS
  }

  get isEmail(): boolean {
    return this.type === NotificationEntityTypes.EMAIL
  }
}
