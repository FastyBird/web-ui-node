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

export interface EmailInterface {
  readonly id: string
  readonly type: EmailEntityTypeType

  draft: boolean

  readonly address: string
  default: boolean
  private: boolean
  verified: boolean

  // Relations
  relationshipNames: Array<string>

  account: AccountInterface | null

  accountId: string

  // Entity transformers
  isDefault: boolean
  isPrivate: boolean
  isVerified: boolean
}

// ENTITY TYPES
// ============

export enum EmailEntityTypeType {
  EMAIL = 'auth-node/email',
}

// API RESPONSES
// =============

interface EmailAttributesResponseInterface {
  address: string
  default: boolean
  private: boolean
  verified: boolean
}

interface EmailAccountRelationhipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: AccountEntityTypeType
}

interface EmailAccountRelationshipsResponseInterface extends TJsonApiRelation {
  data: EmailAccountRelationhipResponseInterface
}

interface EmailRelationshipsResponseInterface extends TJsonApiRelationships {
  account: EmailAccountRelationshipsResponseInterface
}

export interface EmailDataResponseInterface extends TJsonApiData {
  id: string,
  type: EmailEntityTypeType,
  attributes: EmailAttributesResponseInterface,
  relationships: EmailRelationshipsResponseInterface,
}

export interface EmailResponseInterface extends TJsonApiBody {
  data: EmailDataResponseInterface,
}

export interface EmailsResponseInterface extends TJsonApiBody {
  data: Array<EmailDataResponseInterface>,
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.email',
  UPDATED = 'fb.bus.node.entity.updated.email',
  DELETED = 'fb.bus.node.entity.deleted.email',
}

// CREATE ENTITY INTERFACES
// ========================

export interface EmailCreateInterface {
  type: EmailEntityTypeType

  address: string
  default?: boolean
  private?: boolean
}

// UPDATE ENTITY INTERFACES
// ========================

export interface EmailUpdateInterface {
  default?: boolean
  private?: boolean
}
