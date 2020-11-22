import {
  Model,
  Fields,
  Item,
} from '@vuex-orm/core'

import {
  AccountInterface,
  AccountEntityTypes,
  AccountStateTypes,
} from '~/models/auth-node/accounts/types'
import Email from '~/models/auth-node/emails/Email'
import { EmailInterface } from '~/models/auth-node/emails/types'
import Identity from '~/models/auth-node/identities/Identity'
import { IdentityInterface } from '~/models/auth-node/identities/types'

export default class Account extends Model implements AccountInterface {
  static get entity(): string {
    return 'account'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      draft: this.boolean(false),

      state: this.string('active'),

      lastVisit: this.string(null).nullable(),
      registered: this.string(null).nullable(),

      // User account specific
      firstName: this.string(''),
      lastName: this.string(''),
      middleName: this.string(null).nullable(),

      language: this.string('en'),

      weekStart: this.number(1),
      timezone: this.string(''),
      dateFormat: this.string(''),
      timeFormat: this.string(''),

      // Machine account specific
      device: this.string(''),

      // Relations
      relationshipNames: this.attr([]),

      emails: this.hasMany(Email, 'accountId'),
      identities: this.hasMany(Identity, 'accountId'),
    }
  }

  id!: string
  type!: AccountEntityTypes

  draft!: boolean

  state!: AccountStateTypes

  lastVisit!: string
  registered!: string

  // User account specific
  firstName!: string
  lastName!: string
  middleName!: string | null

  language!: string

  weekStart!: number
  timezone!: string
  dateFormat!: string
  timeFormat!: string

  // Machine account specific
  device!: string
  owner!: string

  // Relations
  relationshipNames!: Array<string>

  emails!: Array<EmailInterface>
  identities!: Array<IdentityInterface>

  // Entity transformers
  get name(): string {
    if (this.type !== AccountEntityTypes.USER) {
      throw new Error(`This field is not allowed for entity type ${this.type}`)
    }

    return `${this.firstName} ${this.lastName}`
  }

  get email(): EmailInterface | null {
    if (this.type !== AccountEntityTypes.USER) {
      throw new Error(`This field is not allowed for entity type ${this.type}`)
    }

    return Email
      .query()
      .where('accountId', this.id)
      .where('default', true)
      .first()
  }

  get ownerAccount(): Item<Account> {
    if (this.type !== AccountEntityTypes.MACHINE) {
      throw new Error(`This field is not allowed for entity type ${this.type}`)
    }

    return Account.query().where('id', this.owner).where('type', AccountEntityTypes.USER).first()
  }
}
