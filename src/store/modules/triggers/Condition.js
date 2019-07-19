import { Model } from '@vuex-orm/core'

export default class Condition extends Model {
  static entity = 'condition'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),
      operator: this.string(),
      operands: this.attr(),

      relationshipNames: this.attr(null).nullable(),

      trigger_id: this.string(),
      thing_id: this.string(),
      property_id: this.string(),
      channel_id: this.string(),
    }
  }
}
