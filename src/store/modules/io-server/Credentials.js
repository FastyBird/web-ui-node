import { Model } from '@vuex-orm/core'

import Thing from './Thing'

export default class Credentials extends Model {
  static entity = 'credentials'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      thing_id: this.string(),

      version: this.string(),
      username: this.string(),
      password: this.string(),

      relationshipNames: this.attr(null).nullable(),

      thing: this.hasOne(Thing, 'id'),
    }
  }
}
