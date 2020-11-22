import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationships,
  TJsonApiRelationshipData,
} from 'jsona/lib/JsonaTypes'

import {
  AccountEntityTypes,
  AccountInterface,
} from '~/models/auth-node/accounts/types'

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

export interface IdentityInterface {
  id: string
  type: IdentityEntityTypes

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

export enum IdentityEntityTypes {
  USER = 'auth-node/user-account-identity',
  MACHINE = 'auth-node/machine-account-identity',
}

export enum IdentityStateTypes {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
  INVALID = 'invalid',
}

// API RESPONSES
// =============

interface IdentityAttributesResponseInterface {
  state: IdentityStateTypes
  uid?: string

  // Machine user identity specific
  password?: string
}

interface IdentityAccountRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: AccountEntityTypes
}

interface IdentityAccountRelationshipsResponseInterface extends TJsonApiRelation {
  data: IdentityAccountRelationshipResponseInterface
}

interface IdentityRelationshipsResponseInterface extends TJsonApiRelationships {
  account: IdentityAccountRelationshipsResponseInterface
}

export interface IdentityDataResponseInterface extends TJsonApiData {
  id: string,
  type: IdentityEntityTypes,
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
  type: IdentityEntityTypes

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
