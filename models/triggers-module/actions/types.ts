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

export interface ActionInterface {
  id: string
  type: ActionEntityTypes

  draft: boolean

  enabled: boolean

  value: string
  device: string
  channel?: string
  property: string

  // Relations
  relationshipNames: Array<string>

  triggerId: string

  trigger: TriggerInterface | null
  triggerBackward: TriggerInterface | null

  isDeviceProperty: boolean
  isChannelProperty: boolean
}

// ENTITY TYPES
// ============

export enum ActionEntityTypes {
  DEVICE_PROPERTY = 'triggers-module/action-device-property',
  CHANNEL_PROPERTY = 'triggers-module/action-channel-property',
}

// API RESPONSES
// =============

interface ActionAttributesResponseInterface {
  enabled: boolean

  // Channel property conditions specific
  device?: string
  channel?: string
  property: string
  value?: string
}

interface ActionTriggerRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: TriggerEntityTypes
}

interface ActionTriggerRelationshipsResponseInterface extends TJsonApiRelation {
  data: ActionTriggerRelationshipResponseInterface
}

interface ActionRelationshipsResponseInterface extends TJsonApiRelationships {
  trigger: ActionTriggerRelationshipsResponseInterface
}

export interface ActionDataResponseInterface extends TJsonApiData {
  id: string
  type: ActionEntityTypes
  attributes: ActionAttributesResponseInterface
  relationships: ActionRelationshipsResponseInterface
}

export interface ActionResponseInterface extends TJsonApiBody {
  data: ActionDataResponseInterface
}

export interface ActionsResponseInterface extends TJsonApiBody {
  data: Array<ActionDataResponseInterface>
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.action',
  UPDATED = 'fb.bus.node.entity.updated.action',
  DELETED = 'fb.bus.node.entity.deleted.action',
}

// CREATE ENTITY INTERFACES
// ========================

export interface CreateDevicePropertyActionInterface extends ActionCreateInterface {
  value: string
  device: string
  property: string
}

export interface CreateChannelPropertyActionInterface extends ActionCreateInterface {
  value: string
  device: string
  channel: string
  property: string
}

export interface ActionCreateInterface {
  type: ActionEntityTypes

  enabled: boolean
}

// UPDATE ENTITY INTERFACES
// ========================

export interface UpdateDevicePropertyActionInterface extends ActionUpdateInterface {
  value?: string
}

export interface UpdateChannelPropertyActionInterface extends ActionUpdateInterface {
  value?: string
}

export interface ActionUpdateInterface {
  enabled?: boolean
}
