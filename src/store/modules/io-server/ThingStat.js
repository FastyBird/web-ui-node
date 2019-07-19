import { Model } from '@vuex-orm/core'

import Thing from './Thing'

export default class ThingStat extends Model {
  static entity = 'thing_stat'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      thing_id: this.string(),

      name: this.string(),
      value: this.attr(),

      relationshipNames: this.attr(null).nullable(),

      thing: this.hasOne(Thing, 'id'),
    }
  }
}
