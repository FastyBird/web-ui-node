import { Model, Fields } from '@vuex-orm/core'
import get from 'lodash/get'

import Session, { SessionInterface } from './Session'
import SecurityQuestion, { SecurityQuestionInterface } from './SecurityQuestion'
import Email, { EmailInterface } from './Email'
import Identity, { IdentityInterface } from './Identity'

interface AccountDetailsInterface {
  first_name: string,
  last_name: string,
  middle_name: string | null,
}

// ENTITY INTERFACE
// ================
export interface AccountInterface {
  id: string,
  type: string,

  name: string,
  email: string,
  details: AccountDetailsInterface,

  language: string,

  last_visit: string,
  registered: string,

  status: string,

  params: any,

  relationshipNames: Array<string>,

  session_id: string | null,

  session: SessionInterface | null,
  security_question: SecurityQuestionInterface | null,
  emails: Array<EmailInterface>,
  identities: Array<IdentityInterface>,

  firstName: string,
  lastName: string,
  middleName: string | null,
  primaryEmail: Email | null,
  weekStart: number,
  timeZone: string,
  dateFormat: string,
  timeFormat: string,
}

// ENTITY MODEL
// ============
export default class Account extends Model implements AccountInterface {
  static get entity(): string {
    return 'account';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      name: this.string(''),
      email: this.string(''),
      details: this.attr(null),

      language: this.string('en'),

      last_visit: this.string(''),
      registered: this.string(''),

      status: this.string('unknown'),

      params: this.attr(''),

      relationshipNames: this.attr([]).nullable(),

      session_id: this.string(''),

      session: this.belongsTo(Session, 'session_id'),
      security_question: this.hasOne(SecurityQuestion, 'account_id'),
      emails: this.hasMany(Email, 'account_id'),
      identities: this.hasMany(Identity, 'account_id'),
    }
  }

  id!: string;
  type!: string;

  name!: string;
  email!: string;
  details!: AccountDetailsInterface;

  language!: string;

  last_visit!: string;
  registered!: string;

  status!: string;

  params: any;

  relationshipNames!: Array<string>;

  session_id!: string | null;

  session!: SessionInterface | null;
  security_question!: SecurityQuestionInterface | null;
  emails!: Array<EmailInterface>;
  identities!: Array<IdentityInterface>;

  get firstName(): string {
    return get(this.details, 'first_name')
  }

  get lastName(): string {
    return get(this.details, 'last_name')
  }

  get middleName(): string | null {
    return get(this.details, 'middle_name')
  }

  get primaryEmail(): Email | null {
    return Email
      .query()
      .where('account_id', this.id)
      .where('is_default', true)
      .first()
  }

  get weekStart(): number {
    return parseInt(get(this.params, 'datetime.week_start', 1), 10)
  }

  get timeZone(): string {
    return get(this.params, 'datetime.zone', 'Europe/London')
  }

  get dateFormat(): string {
    return get(this.params, 'datetime.format.date', 'DD.MM.YYYY')
  }

  get timeFormat(): string {
    return get(this.params, 'datetime.format.time', 'HH:mm')
  }
}
