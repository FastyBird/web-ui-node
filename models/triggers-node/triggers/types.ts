import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationships,
  TJsonApiRelationshipData,
} from 'jsona/lib/JsonaTypes'

import {
  ActionInterface,
  ActionEntityTypeType,
  ActionCreateInterface,
} from '~/models/triggers-node/actions/types'
import {
  NotificationInterface,
  NotificationEntityTypeType,
  NotificationCreateInterface,
} from '~/models/triggers-node/notifications/types'
import {
  ConditionInterface,
  ConditionEntityTypeType,
  ConditionCreateInterface,
} from '~/models/triggers-node/conditions/types'
import { ConditionOperatorType } from '~/models/triggers-node/types'

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

export interface TriggerInterface {
  id: string
  type: TriggerEntityTypeType

  draft: boolean

  name: string
  comment: string | null
  enabled: boolean

  owner: string | null

  // Channel property specific
  device: string
  channel: string
  property: string
  operator: ConditionOperatorType
  operand: string

  // Relations
  relationshipNames: Array<string>

  actions: Array<ActionInterface>
  notifications: Array<NotificationInterface>
  conditions: Array<ConditionInterface>

  // Entity transformers
  isEnabled: boolean
  icon: string
  hasDescription: boolean
  description: string

  isAutomatic: boolean
  isManual: boolean
  isForChannel: boolean
  isDate: boolean
  isTime: boolean
}

// ENTITY TYPES
// ============

export enum TriggerEntityTypeType {
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
  operator?: ConditionOperatorType
  operand?: string
}

interface TriggerConditionRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: ConditionEntityTypeType
}

interface TriggerConditionsRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<TriggerConditionRelationshipResponseInterface>
}

interface TriggerNotificationRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: NotificationEntityTypeType
}

interface TriggerNotificationsRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<TriggerNotificationRelationshipResponseInterface>
}

interface TriggerActionRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: ActionEntityTypeType
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
  type: TriggerEntityTypeType
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
  type: TriggerEntityTypeType

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
