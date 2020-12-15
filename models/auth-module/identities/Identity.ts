import {
  Model,
  Fields,
} from '@vuex-orm/core'

import Account from '~/models/auth-module/accounts/Account'
import { AccountInterface } from '~/models/auth-module/accounts/types'
import {
  IdentityInterface,
  IdentityEntityTypes,
  IdentityStateTypes,
} from '~/models/auth-module/identities/types'

export default class Identity extends Model implements IdentityInterface {
  static get entity(): string {
    return 'identity'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      draft: this.boolean(false),

      state: this.string(IdentityStateTypes.ACTIVE),
      uid: this.string(''),
      password: this.string(null).nullable(),

      // Relations
      relationshipNames: this.attr([]),

      account: this.belongsTo(Account, 'id'),

      accountId: this.attr(''),
    }
  }

  id!: string
  type!: IdentityEntityTypes

  draft!: boolean

  state!: string
  uid!: string
  password!: string

  // Relations
  relationshipNames!: Array<string>

  account!: AccountInterface | null

  accountId!: string
}
