import { Model } from '@vuex-orm/core'

import Action from './Action'
import Condition from './Condition'
import Notification from './Notification'

export default class Trigger extends Model {
  static entity = 'trigger'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),
      name: this.string(),
      comment: this.string().nullable(),
      enabled: this.boolean(true),
      params: this.attr(),

      relationshipNames: this.attr(null).nullable(),

      actions: this.hasMany(Action, 'trigger_id'),
      conditions: this.hasMany(Condition, 'trigger_id'),
      notifications: this.hasMany(Notification, 'trigger_id'),
    }
  }
}
