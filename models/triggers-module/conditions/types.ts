import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationships,
  TJsonApiRelationshipData,
} from 'jsona/lib/JsonaTypes'

import {
  TriggerInterface,
  TriggerEntityTypes,
} from '~/models/triggers-module/triggers/types'
import { ConditionOperatorTypes } from '~/models/triggers-module/types'

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

export interface ConditionInterface {
  id: string
  type: ConditionEntityTypes

  draft: boolean

  enabled: boolean

  // Device & Channel property conditions specific
  operator?: ConditionOperatorTypes
  operand?: string
  device?: string
  channel?: string
  property?: string

  // Time conditions specific
  time?: string
  days?: Array<number>

  // Date conditions specific
  date?: string

  // Relations
  relationshipNames: Array<string>

  triggerId: string

  trigger: TriggerInterface | null
  triggerBackward: TriggerInterface | null

  isDeviceProperty: boolean
  isChannelProperty: boolean
  isTime: boolean
  isDate: boolean
}

// ENTITY TYPES
// ============

export enum ConditionEntityTypes {
  TIME = 'triggers-module/condition-time',
  DATE = 'triggers-module/condition-date',
  DEVICE_PROPERTY = 'triggers-module/condition-device-property',
  CHANNEL_PROPERTY = 'triggers-module/condition-channel-property',
}

// API RESPONSES
// =============

interface ConditionAttributesResponseInterface {
  enabled: boolean

  // Device & Channel property conditions specific
  operator?: ConditionOperatorTypes
  operand?: string
  device?: string
  channel?: string
  property?: string

  // Time conditions specific
  time?: string
  days?: Array<number>

  // Date conditions specific
  date?: string
}

interface ConditionTriggerRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: TriggerEntityTypes
}

interface ConditionTriggerRelationshipsResponseInterface extends TJsonApiRelation {
  data: ConditionTriggerRelationshipResponseInterface
}

interface ConditionRelationshipsResponseInterface extends TJsonApiRelationships {
  trigger: ConditionTriggerRelationshipsResponseInterface
}

export interface ConditionDataResponseInterface extends TJsonApiData {
  id: string
  type: ConditionEntityTypes
  attributes: ConditionAttributesResponseInterface
  relationships: ConditionRelationshipsResponseInterface
}

export interface ConditionResponseInterface extends TJsonApiBody {
  data: ConditionDataResponseInterface
}

export interface ConditionsResponseInterface extends TJsonApiBody {
  data: Array<ConditionDataResponseInterface>
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.condition',
  UPDATED = 'fb.bus.node.entity.updated.condition',
  DELETED = 'fb.bus.node.entity.deleted.condition',
}

// CREATE ENTITY INTERFACES
// ========================

export interface CreateDevicePropertyConditionInterface extends ConditionCreateInterface {
  operator: ConditionOperatorTypes
  operand: string
  device: string
  property: string
}

export interface CreateChannelPropertyConditionInterface extends ConditionCreateInterface {
  operator: ConditionOperatorTypes
  operand: string
  device: string
  channel: string
  property: string
}

export interface CreateDateConditionInterface extends ConditionCreateInterface {
  date: string
}

export interface CreateTimeConditionInterface extends ConditionCreateInterface {
  time: string
  days: Array<number>
}

export interface ConditionCreateInterface {
  type: ConditionEntityTypes

  enabled: boolean
}

// UPDATE ENTITY INTERFACES
// ========================

export interface UpdateDevicePropertyConditionInterface extends ConditionUpdateInterface {
  operator?: ConditionOperatorTypes
  operand?: string
}

export interface UpdateChannelPropertyConditionInterface extends ConditionUpdateInterface {
  operator?: ConditionOperatorTypes
  operand?: string
}

export interface UpdateDateConditionInterface extends ConditionUpdateInterface {
  date?: string
}

export interface UpdateTimeConditionInterface extends ConditionUpdateInterface {
  time?: string
  days?: Array<number>
}

export interface ConditionUpdateInterface {
  enabled?: boolean
}
