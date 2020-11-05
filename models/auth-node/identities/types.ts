import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationships,
  TJsonApiRelationshipData,
} from 'jsona/lib/JsonaTypes'

import {
  AccountEntityTypeType,
  AccountInterface,
} from '~/models/auth-node/accounts/types'

// STORE
// =====

export enum SemaphoreType {
  FETCHING = 'fetching',
  GETTING = 'getting',
  CREATING = 'creating',
  UPDATING = 'updating',
  DELETING = 'deleting',
}

// ENTITY INTERFACE
// ================

export interface IdentityInterface {
  id: string
  type: IdentityEntityTypeType

  draft: boolean

  state: string
  uid: string
  password: string

  relationshipNames: Array<string>

  account: AccountInterface | null

  accountId: string
}

// ENTITY TYPES
// ============

export enum IdentityEntityTypeType {
  USER = 'auth-node/user-account-identity',
  MACHINE = 'auth-node/machine-account-identity',
}

export enum IdentityStateType {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
  INVALID = 'invalid',
}

// API RESPONSES
// =============

interface IdentityAttributesResponseInterface {
  state: IdentityStateType
  uid?: string

  // Machine user identity specific
  password?: string
}

interface IdentityAccountRelationhipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: AccountEntityTypeType
}

interface IdentityAccountRelationshipsResponseInterface extends TJsonApiRelation {
  data: IdentityAccountRelationhipResponseInterface
}

interface IdentityRelationshipsResponseInterface extends TJsonApiRelationships {
  account: IdentityAccountRelationshipsResponseInterface
}

export interface IdentityDataResponseInterface extends TJsonApiData {
  id: string,
  type: IdentityEntityTypeType,
  attributes: IdentityAttributesResponseInterface,
  relationships: IdentityRelationshipsResponseInterface,
}

export interface IdentityResponseInterface extends TJsonApiBody {
  data: IdentityDataResponseInterface,
}

export interface IdentitiesResponseInterface extends TJsonApiBody {
  data: Array<IdentityDataResponseInterface>,
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.identity',
  UPDATED = 'fb.bus.node.entity.updated.identity',
  DELETED = 'fb.bus.node.entity.deleted.identity',
}

// CREATE ENTITY INTERFACES
// ========================

export interface IdentityCreateInterface {
  type: IdentityEntityTypeType

  uid: string,
  password: string
}

// UPDATE ENTITY INTERFACES
// ========================

export interface IdentityUpdateInterface {
  password: {
    current: string
    new: string
  }
}
