import { Model } from '@vuex-orm/core'

import Account from './Account'

export default class SecurityQuestion extends Model {
  static entity = 'security_question'

  static fields() {
    return {
      id: this.attr(null),
      type: this.attr(),

      account_id: this.attr(),

      is_custom: this.attr(),
      question: this.attr(),

      account: this.hasOne(Account, 'id'),
    }
  }
}
