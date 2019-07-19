import { Model } from '@vuex-orm/core'

import Thing from './Thing'

export default class Hardware extends Model {
  static entity = 'hardware'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      thing_id: this.string(),

      name: this.string(),
      model: this.string(),
      manufacturer: this.string(),
      version: this.string(),
      mac_address: this.string(),

      relationshipNames: this.attr(null).nullable(),

      thing: this.hasOne(Thing, 'id'),
    }
  }
}
