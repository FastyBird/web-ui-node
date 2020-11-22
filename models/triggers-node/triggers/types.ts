import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationships,
  TJsonApiRelationshipData,
} from 'jsona/lib/JsonaTypes'

import {
  ActionInterface,
  ActionEntityTypes,
  ActionCreateInterface,
} from '~/models/triggers-node/actions/types'
import {
  NotificationInterface,
  NotificationEntityTypes,
  NotificationCreateInterface,
} from '~/models/triggers-node/notifications/types'
import {
  ConditionInterface,
  ConditionEntityTypes,
  ConditionCreateInterface,
} from '~/models/triggers-node/conditions/types'
import { ConditionOperatorTypes } from '~/models/triggers-node/types'

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

export interface TriggerInterface {
  id: string
  type: TriggerEntityTypes

  draft: boolean

  name: string
  comment: string | null
  enabled: boolean

  owner: string | null

  // Channel property specific
  device: string
  channel: string
  property: string
  operator: ConditionOperatorTypes
  operand: string

  // Relations
  relationshipNames: Array<string>

  actions: Array<ActionInterface>
  notifications: Array<NotificationInterface>
  conditions: Array<ConditionInterface>

  // Entity transformers
  isEnabled: boolean
  icon: string
  description: string

  isAutomatic: boolean
  isManual: boolean
  isForChannel: boolean
  isDate: boolean
  isTime: boolean
}

// ENTITY TYPES
// ============

export enum TriggerEntityTypes {
  AUTOMATIC = 'triggers-node/trigger-automatic',
  MANUAL = 'triggers-node/trigger-manual',
  CHANNEL_PROPERTY = 'triggers-node/trigger-channel-property',
}

// API RESPONSES
// =============

interface TriggerAttributesResponseInterface {
  name: string
  comment: string | null
  enabled: boolean

  owner: string | null

  device?: string
  channel?: string
  property?: string
  operator?: ConditionOperatorTypes
  operand?: string
}

interface TriggerConditionRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: ConditionEntityTypes
}

interface TriggerConditionsRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<TriggerConditionRelationshipResponseInterface>
}

interface TriggerNotificationRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: NotificationEntityTypes
}

interface TriggerNotificationsRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<TriggerNotificationRelationshipResponseInterface>
}

interface TriggerActionRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: ActionEntityTypes
}

interface TriggerActionsRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<TriggerActionRelationshipResponseInterface>
}

interface AutomaticTriggerRelationshipsResponseInterface extends TriggerRelationshipsResponseInterface {
  conditions: TriggerConditionsRelationshipsResponseInterface
}

interface ChannelPropertyTriggerRelationshipsResponseInterface extends TJsonApiRelationships {
  actions: TriggerActionsRelationshipsResponseInterface
}

interface TriggerRelationshipsResponseInterface extends TJsonApiRelationships {
  actions: TriggerActionsRelationshipsResponseInterface
  notifications: TriggerNotificationsRelationshipsResponseInterface
}

export interface TriggerDataResponseInterface extends TJsonApiData {
  id: string
  type: TriggerEntityTypes
  attributes: TriggerAttributesResponseInterface
  relationships: TriggerRelationshipsResponseInterface | ChannelPropertyTriggerRelationshipsResponseInterface | AutomaticTriggerRelationshipsResponseInterface
}

export interface TriggerResponseInterface extends TJsonApiBody {
  data: TriggerDataResponseInterface
}

export interface TriggersResponseInterface extends TJsonApiBody {
  data: Array<TriggerDataResponseInterface>
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.trigger',
  UPDATED = 'fb.bus.node.entity.updated.trigger',
  DELETED = 'fb.bus.node.entity.deleted.trigger',
}

// CREATE ENTITY INTERFACES
// ========================

export interface CreateChannelPropertyTriggerInterface extends TriggerCreateInterface {
  operator: string
  operand: string
  device: string
  channel: string
  property: string
}

export interface CreateManualTriggerInterface extends TriggerCreateInterface {
  date: string
}

export interface CreateAutomaticTriggerInterface extends TriggerCreateInterface {
  conditions: Array<ConditionCreateInterface>
}

export interface TriggerCreateInterface {
  type: TriggerEntityTypes

  name: string
  comment: string | null
  enabled: boolean

  actions: Array<ActionCreateInterface>
  notifications: Array<NotificationCreateInterface>
}

// UPDATE ENTITY INTERFACES
// ========================

export interface TriggerUpdateInterface {
  name?: string
  comment?: string | null
  enabled?: boolean
}
