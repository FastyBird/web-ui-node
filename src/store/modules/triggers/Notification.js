import { Model } from '@vuex-orm/core'

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
}
