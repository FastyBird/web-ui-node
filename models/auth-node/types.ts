import { TJsonaModel } from 'jsona/lib/JsonaTypes'

import {
  AccountEntityTypes,
  AccountStateTypes,
} from '~/models/auth-node/accounts/types'
import { EmailEntityTypes } from '~/models/auth-node/emails/types'
import {
  IdentityEntityTypes,
  IdentityStateTypes,
} from '~/models/auth-node/identities/types'

export interface AccountJsonModelInterface extends TJsonaModel {
  id: string,
  type: AccountEntityTypes,

  state: AccountStateTypes,

  lastVisit: string | null,
  registered: string | null,
}

export interface EmailJsonModelInterface extends TJsonaModel {
  id: string,
  type: EmailEntityTypes,
}

export interface IdentityJsonModelInterface extends TJsonaModel {
  id: string,
  type: IdentityEntityTypes,

  state: IdentityStateTypes,
}

export const ModuleOriginType = 'com.fastybird.auth-node'
