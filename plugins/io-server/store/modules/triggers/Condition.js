import { Model } from '@vuex-orm/core'

import {
  TRIGGERS_CONDITION_THING_PROPERTY,
  TRIGGERS_CONDITION_CHANNEL_PROPERTY,
} from './../../../api/types'

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

  get isThingProperty() {
    return this.type === TRIGGERS_CONDITION_THING_PROPERTY
  }

  get isChannelProperty() {
    return this.type === TRIGGERS_CONDITION_CHANNEL_PROPERTY
  }
}
