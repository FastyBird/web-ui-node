import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationships,
  TJsonApiRelationshipData,
} from 'jsona/lib/JsonaTypes'

import {
  EmailEntityTypes,
  EmailInterface,
  EmailDataResponseInterface,
} from '~/models/auth-module/emails/types'
import {
  IdentityDataResponseInterface,
  IdentityEntityTypes,
  IdentityInterface,
} from '~/models/auth-module/identities/types'

// STORE
// =====

export enum SemaphoreTypes {
  FETCHING = 'fetching',
  GETTING = 'getting',
  CREATING = 'creating',
  UPDATING = 'updating',
  DELETING = 'deleting',
}

// ENTITY INTERFACE
// ================

export interface AccountInterface {
  readonly id: string
  readonly type: AccountEntityTypes

  draft: boolean

  state: AccountStateTypes

  lastVisit: string | null
  registered: string | null

  // User account specific
  firstName: string
  lastName: string
  middleName: string | null

  language: string

  weekStart: number
  timezone: string
  dateFormat: string
  timeFormat: string

  // Machine account specific
  device: string
  owner: string

  // Relations
  relationshipNames: Array<string>

  emails: Array<EmailInterface>
  identities: Array<IdentityInterface>

  // Entity transformers
  email: EmailInterface | null
  ownerAccount: AccountInterface | null
}

// ENTITY TYPES
// ============

export enum AccountEntityTypes {
  USER = 'auth-module/user-account',
  MACHINE = 'auth-module/machine-account',
}

export enum AccountStateTypes {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
  NOT_ACTIVATED = 'notActivated',
  APPROVAL_WAITING = 'approvalWaiting',
}

// API RESPONSES
// =============

interface AccountDetailAttributesResponseInterface {
  first_name: string
  last_name: string
  middle_name: string | null
}

interface AccountDatetimeAttributesResponseInterface {
  timezone: string
  date_format: string
  time_format: string
}

interface AccountAttributesResponseInterface {
  state: AccountStateTypes

  // User account specific
  datetime?: AccountDatetimeAttributesResponseInterface
  details?: AccountDetailAttributesResponseInterface
  language?: string
  last_visit?: string | null
  registered?: string | null
  week_start?: number

  // Machine account specific
  device?: string
}

interface EmailRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: EmailEntityTypes
}

interface AccountEmailsRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<EmailRelationshipResponseInterface>
}

interface IdentityRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: IdentityEntityTypes
}

interface AccountIdentitiesRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<IdentityRelationshipResponseInterface>
}

interface RoleRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: string
}

interface AccountRolesRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<RoleRelationshipResponseInterface>
}

interface UserAccountRelationshipsResponseInterface extends TJsonApiRelationships {
  emails: AccountEmailsRelationshipsResponseInterface
  identities: AccountIdentitiesRelationshipsResponseInterface
  roles: AccountRolesRelationshipsResponseInterface
}

interface MachineAccountRelationshipsResponseInterface extends TJsonApiRelationships {
  identities: AccountIdentitiesRelationshipsResponseInterface
  roles: AccountRolesRelationshipsResponseInterface
}

interface AccountDataResponseInterface extends TJsonApiData {
  id: string,
  type: AccountEntityTypes,
  attributes: AccountAttributesResponseInterface,
  relationships: UserAccountRelationshipsResponseInterface | MachineAccountRelationshipsResponseInterface,
}

export interface AccountResponseInterface extends TJsonApiBody {
  data: AccountDataResponseInterface,
  included?: Array<EmailDataResponseInterface | IdentityDataResponseInterface>
}

export interface AccountsResponseInterface extends TJsonApiBody {
  data: Array<AccountDataResponseInterface>,
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.account',
  UPDATED = 'fb.bus.node.entity.updated.account',
  DELETED = 'fb.bus.node.entity.deleted.account',
}

// CREATE ENTITY INTERFACES
// ========================

export interface AccountCreateInterface {
  type: AccountEntityTypes
}

// UPDATE ENTITY INTERFACES
// ========================

export interface AccountUpdateInterface {
  firstName?: string
  lastName?: string
  middleName?: string | null
  language?: string
  weekStart?: number
  timezone?: string
  dateFormat?: string
  timeFormat?: string
}
