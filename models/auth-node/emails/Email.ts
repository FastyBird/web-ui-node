import {
  Model,
  Fields,
} from '@vuex-orm/core'

import Account from '~/models/auth-node/accounts/Account'
import { AccountInterface } from '~/models/auth-node/accounts/types'
import {
  EmailInterface,
  EmailEntityTypeType,
} from '~/models/auth-node/emails/types'

export default class Email extends Model implements EmailInterface {
  static get entity(): string {
    return 'email'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      draft: this.boolean(false),

      address: this.string(''),
      default: this.boolean(false),
      private: this.boolean(false),
      verified: this.boolean(false),

      // Relations
      relationshipNames: this.attr([]),

      account: this.belongsTo(Account, 'id'),

      accountId: this.attr(''),
    }
  }

  id!: string
  type!: EmailEntityTypeType

  draft!: boolean

  address!: string
  default!: boolean
  private!: boolean
  verified!: boolean

  // Relations
  relationshipNames!: Array<string>

  account!: AccountInterface | null

  accountId!: string

  // Entity transformers
  get isDefault(): boolean {
    return this.default
  }

  get isPrivate(): boolean {
    return this.private
  }

  get isVerified(): boolean {
    return this.verified
  }
}
