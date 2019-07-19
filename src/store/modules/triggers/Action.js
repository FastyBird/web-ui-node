import { Model } from '@vuex-orm/core'

export default class Action extends Model {
  static entity = 'action'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),
      value: this.string(),

      relationshipNames: this.attr(null).nullable(),

      trigger_id: this.string(),
      channel_id: this.string(),
      property_id: this.string(),
    }
  }
}
