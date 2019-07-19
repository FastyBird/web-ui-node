import { Model } from '@vuex-orm/core'

import Thing from './Thing'

export default class ThingProperty extends Model {
  static entity = 'thing_property'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      thing_id: this.string(),

      property: this.string(),
      name: this.string(),
      is_settable: this.boolean(false),
      data_type: this.string(),
      format: this.string(),

      value: this.attr(),

      relationshipNames: this.attr(null).nullable(),

      thing: this.hasOne(Thing, 'id'),
    }
  }
}
