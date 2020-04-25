import { Model, Fields } from '@vuex-orm/core'

import Account, { AccountInterface } from './Account'

// ENTITY INTERFACE
// ================
export interface SecurityQuestionInterface {
  id: string,
  type: string,

  is_default: boolean,
  question: string,

  relationshipNames: Array<string>,

  account_id: string,

  account: AccountInterface,

  isDefault: boolean,
}

// ENTITY MODEL
// ============
export default class SecurityQuestion extends Model implements SecurityQuestionInterface {
  static get entity(): string {
    return 'security_question';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      is_custom: this.boolean(false),
      question: this.string(''),

      relationshipNames: this.attr([]).nullable(),

      account_id: this.attr(''),

      account: this.belongsTo(Account, 'id'),
    }
  }

  id!: string;
  type!: string;

  is_default!: boolean;
  question!: string;

  relationshipNames!: Array<string>;

  account_id!: string;

  account!: AccountInterface;

  get isDefault(): boolean {
    return this.is_default
  }
}
