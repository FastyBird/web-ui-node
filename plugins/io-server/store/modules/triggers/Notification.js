import { Model } from '@vuex-orm/core'

import {
  TRIGGERS_NOTIFICATION_SMS,
  TRIGGERS_NOTIFICATION_EMAIL,
  TRIGGERS_NOTIFICATION_CUSTOM_EMAIL,
} from './../../../api/types'

export default class Notification extends Model {
  static entity = 'notification'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),
      address: this.string(null).nullable(),
      phone: this.string(null).nullable(),

      relationshipNames: this.attr(null).nullable(),

      trigger_id: this.string(),
    }
  }

  get isSms() {
    return this.type === TRIGGERS_NOTIFICATION_SMS
  }

  get isEmail() {
    return this.type === TRIGGERS_NOTIFICATION_EMAIL
  }

  get isCustomEmail() {
    return this.type === TRIGGERS_NOTIFICATION_CUSTOM_EMAIL
  }
}
