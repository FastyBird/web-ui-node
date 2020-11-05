import {
  Model,
  Fields,
} from '@vuex-orm/core'

import Account from '~/models/auth-node/accounts/Account'
import { AccountInterface } from '~/models/auth-node/accounts/types'
import {
  IdentityInterface,
  IdentityEntityTypeType,
  IdentityStateType,
} from '~/models/auth-node/identities/types'

export default class Identity extends Model implements IdentityInterface {
  static get entity(): string {
    return 'identity'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      draft: this.boolean(false),

      state: this.string(IdentityStateType.ACTIVE),
      uid: this.string(''),
      password: this.string(null).nullable(),

      // Relations
      relationshipNames: this.attr([]),

      account: this.belongsTo(Account, 'id'),

      accountId: this.attr(''),
    }
  }

  id!: string
  type!: IdentityEntityTypeType

  draft!: boolean

  state!: string
  uid!: string
  password!: string

  // Relations
  relationshipNames!: Array<string>

  account!: AccountInterface | null

  accountId!: string
}
