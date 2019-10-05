import { Model } from '@vuex-orm/core'
import get from 'lodash/get'
import find from 'lodash/find'

import Session from './Session'
import Email from './Email'
import Profile from './Profile'
import SecurityQuestion from './SecurityQuestion'

export default class Account extends Model {
  static entity = 'account'

  static fields() {
    return {
      id: this.attr(null),
      type: this.attr(),

      language: this.attr(),
      last_visit: this.attr(),
      registered: this.attr(),
      status: this.attr(),
      params: this.attr(),

      profile: this.hasOne(Profile, 'account_id'),

      security_question: this.hasOne(SecurityQuestion, 'account_id'),

      emails: this.hasMany(Email, 'account_id'),

      session: this.belongsTo(Session, 'session_id'),
    }
  }

  get primaryEmail() {
    const primary = find(this.emails, { is_default: true })

    return primary !== undefined ? primary : null
  }

  get weekStart() {
    return get(this.params, 'datetime.week_start', 1)
  }

  get timeZone() {
    return get(this.params, 'datetime.zone', 'Europe/London')
  }

  get dateFormat() {
    return get(this.params, 'datetime.format.date', 'DD.MM.YYYY')
  }

  get timeFormat() {
    return get(this.params, 'datetime.format.time', 'HH:mm')
  }
}
