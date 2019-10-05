import { Model } from '@vuex-orm/core'

import Thing from './Thing'

export default class ThingSocket extends Model {
  static entity = 'thing_socket'

  static fields() {
    return {
      id: this.string(),

      connected_at: this.string(),
      last_message: this.string().nullable(),

      thing: this.belongsTo(Thing, 'id'),
    }
  }
}
