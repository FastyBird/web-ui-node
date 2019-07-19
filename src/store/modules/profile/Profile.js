import { Model } from '@vuex-orm/core'

import Account from './Account'

export default class Profile extends Model {
  static entity = 'profile'

  static fields() {
    return {
      id: this.attr(null),
      type: this.attr(),
      account_id: this.attr(),
      name: this.attr(),
      email: this.attr(),
      details: this.attr(),
      account: this.hasOne(Account, 'id'),
    }
  }
}
