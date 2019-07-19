import { Model } from '@vuex-orm/core'

import Thing from './Thing'

export default class Firmware extends Model {
  static entity = 'firmware'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      thing_id: this.string(),

      name: this.string(),
      manufacturer: this.string(),
      version: this.string(),

      relationshipNames: this.attr(null).nullable(),

      thing: this.hasOne(Thing, 'id'),
    }
  }
}
