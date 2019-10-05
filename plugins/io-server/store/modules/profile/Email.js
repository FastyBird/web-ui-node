import { Model } from '@vuex-orm/core'

import Account from './Account'

export default class Email extends Model {
  static entity = 'email'

  static fields() {
    return {
      id: this.attr(null),
      type: this.attr(),

      account_id: this.attr(),

      address: this.attr(),
      is_default: this.attr(),
      is_private: this.attr(),
      is_verified: this.attr(),

      account: this.belongsTo(Account, 'id'),
    }
  }
}
