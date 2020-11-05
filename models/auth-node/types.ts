import { TJsonaModel } from 'jsona/lib/JsonaTypes'

import {
  AccountEntityTypeType,
  AccountStateType,
} from '~/models/auth-node/accounts/types'
import { EmailEntityTypeType } from '~/models/auth-node/emails/types'
import {
  IdentityEntityTypeType,
  IdentityStateType,
} from '~/models/auth-node/identities/types'

export interface AccountJsonModelInterface extends TJsonaModel {
  id: string,
  type: AccountEntityTypeType,

  state: AccountStateType,

  lastVisit: string | null,
  registered: string | null,
}

export interface EmailJsonModelInterface extends TJsonaModel {
  id: string,
  type: EmailEntityTypeType,
}

export interface IdentityJsonModelInterface extends TJsonaModel {
  id: string,
  type: IdentityEntityTypeType,

  state: IdentityStateType,
}

export const ModuleOriginType = 'com.fastybird.auth-node'
