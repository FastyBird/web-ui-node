import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationships,
  TJsonApiRelationshipData,
} from 'jsona/lib/JsonaTypes'

import {
  TriggerInterface,
  TriggerEntityTypeType,
} from '~/models/triggers-node/triggers/types'

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

export interface NotificationInterface {
  id: string
  type: NotificationEntityTypeType

  draft: boolean

  enabled: boolean

  // Email notifications specific
  email?: string

  // SMS notifications specific
  phone?: string

  // Relations
  relationshipNames: Array<string>

  triggerId: string

  trigger: TriggerInterface | null
  triggerBackward: TriggerInterface | null

  isSms: boolean
  isEmail: boolean
}

// ENTITY TYPES
// ============

export enum NotificationEntityTypeType {
  EMAIL = 'triggers-node/notification-email',
  SMS = 'triggers-node/notification-sms',
}

// API RESPONSES
// =============

interface NotificationAttributesResponseInterface {
  enabled: boolean

  // Email notifications specific
  email?: string

  // SMS notifications specific
  phone?: string
}

interface NotificationTriggerRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: TriggerEntityTypeType
}

interface NotificationTriggerRelationshipsResponseInterface extends TJsonApiRelation {
  data: NotificationTriggerRelationshipResponseInterface
}

interface NotificationRelationshipsResponseInterface extends TJsonApiRelationships {
  trigger: NotificationTriggerRelationshipsResponseInterface
}

export interface NotificationDataResponseInterface extends TJsonApiData {
  id: string
  type: NotificationEntityTypeType
  attributes: NotificationAttributesResponseInterface
  relationships: NotificationRelationshipsResponseInterface
}

export interface NotificationResponseInterface extends TJsonApiBody {
  data: NotificationDataResponseInterface
}

export interface NotificationsResponseInterface extends TJsonApiBody {
  data: Array<NotificationDataResponseInterface>
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.notification',
  UPDATED = 'fb.bus.node.entity.updated.notification',
  DELETED = 'fb.bus.node.entity.deleted.notification',
}

// CREATE ENTITY INTERFACES
// ========================

export interface CreateSmsNotificationInterface extends NotificationCreateInterface {
  phone: string
}

export interface CreateEmailNotificationInterface extends NotificationCreateInterface {
  email: string
}

export interface NotificationCreateInterface {
  type: NotificationEntityTypeType

  enabled: boolean
}

// UPDATE ENTITY INTERFACES
// ========================

export interface UpdateSmsNotificationInterface extends NotificationUpdateInterface {
  phone?: string
}

export interface UpdateEmailNotificationInterface extends NotificationUpdateInterface {
  email?: string
}

export interface NotificationUpdateInterface {
  enabled?: boolean
}
