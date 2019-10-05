import { Model } from '@vuex-orm/core'

import Account from './Account'

export default class Session extends Model {
  static entity = 'session'

  static fields() {
    return {
      id: this.attr(null),
      type: this.attr(),

      expiration: this.string().nullable(),
      token: this.string(),
      token_type: this.string(),
      refresh: this.string(),

      account: this.hasOne(Account, 'account_id'),
    }
  }
}
