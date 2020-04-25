import { Model, Fields } from '@vuex-orm/core'

import Account, { AccountInterface } from './Account'

// ENTITY INTERFACE
// ================
export interface IdentityInterface {
  id: string,
  type: string,

  uid: string,
  email: string,
  status: string,

  relationshipNames: Array<string>,

  account_id: string,

  account: AccountInterface,
}

// ENTITY MODEL
// ============
export default class Identity extends Model implements IdentityInterface {
  static get entity(): string {
    return 'identity';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      uid: this.string(''),
      email: this.string(''),
      status: this.string(''),

      relationshipNames: this.attr([]).nullable(),

      account_id: this.attr(''),

      account: this.belongsTo(Account, 'id'),
    }
  }

  id!: string;
  type!: string;

  uid!: string;
  email!: string;
  status!: string;

  relationshipNames!: Array<string>;

  account_id!: string;

  account!: AccountInterface;
}
