import { Model, Fields } from '@vuex-orm/core'

import Account, { AccountInterface } from './Account'

// ENTITY INTERFACE
// ================
export interface SessionInterface {
  id: string,
  type: string,

  expiration: string | null,
  token_type: string,
  token: string,
  refresh: string,

  relationshipNames: Array<string>,

  account: AccountInterface,
}

// ENTITY MODEL
// ============
export default class Session extends Model implements SessionInterface {
  static get entity(): string {
    return 'session';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      expiration: this.string(null).nullable(),
      token_type: this.string(''),
      token: this.string(''),
      refresh: this.string(''),

      relationshipNames: this.attr([]).nullable(),

      account: this.hasOne(Account, 'account_id'),
    }
  }

  id!: string;
  type!: string;

  expiration!: string | null;
  token_type!: string;
  token!: string;
  refresh!: string;

  relationshipNames!: Array<string>;

  account!: AccountInterface;
}
