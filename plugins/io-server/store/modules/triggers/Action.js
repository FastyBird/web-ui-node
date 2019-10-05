import { Model } from '@vuex-orm/core'

import {
  TRIGGERS_ACTION_THING_PROPERTY,
  TRIGGERS_ACTION_CHANNEL_PROPERTY,
} from './../../../api/types'

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

  get isThingProperty() {
    return this.type === TRIGGERS_ACTION_THING_PROPERTY
  }

  get isChannelProperty() {
    return this.type === TRIGGERS_ACTION_CHANNEL_PROPERTY
  }
}
