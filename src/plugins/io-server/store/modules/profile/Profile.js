import { Model } from '@vuex-orm/core'
import get from 'lodash/get'

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

  get firstName() {
    return get(this.details, 'first_name')
  }

  get lastName() {
    return get(this.details, 'last_name')
  }

  get middleName() {
    return get(this.details, 'middle_name')
  }
}
