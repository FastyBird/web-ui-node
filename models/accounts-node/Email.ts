import { Model, Fields } from '@vuex-orm/core'

import Account, { AccountInterface } from './Account'

// ENTITY INTERFACE
// ================
export interface EmailInterface {
  id: string,
  type: string,

  address: string,
  is_default: boolean,
  is_private: boolean,
  is_verified: boolean,

  relationshipNames: Array<string>,

  account_id: string,

  account: AccountInterface,

  isDefault: boolean,
  isPrivate: boolean,
  isVerified: boolean,
}

// ENTITY MODEL
// ============
export default class Email extends Model implements EmailInterface {
  static get entity(): string {
    return 'email';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      address: this.string(''),
      is_default: this.boolean(false),
      is_private: this.boolean(false),
      is_verified: this.boolean(false),

      relationshipNames: this.attr([]).nullable(),

      account_id: this.attr(''),

      account: this.belongsTo(Account, 'id'),
    }
  }

  id!: string;
  type!: string;

  address!: string;
  is_default!: boolean;
  is_private!: boolean;
  is_verified!: boolean;

  relationshipNames!: Array<string>;

  account_id!: string;

  account!: AccountInterface;

  get isDefault(): boolean {
    return this.is_default
  }

  get isPrivate(): boolean {
    return this.is_private
  }

  get isVerified(): boolean {
    return this.is_verified
  }
}
