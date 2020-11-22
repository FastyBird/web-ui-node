import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationshipData,
  TJsonApiRelationships,
} from 'jsona/lib/JsonaTypes'

import {
  ChannelEntityTypes,
  ChannelInterface,
} from '~/models/devices-node/channels/types'
import {
  PropertyDatatypeTypes,
  PropertyInterface,
} from '~/models/devices-node/properties/types'

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

export interface ChannelPropertyInterface extends PropertyInterface {
  type: ChannelPropertyEntityTypes

  channel: ChannelInterface | null
  channelBackward: ChannelInterface | null

  channelId: string

  title: string
}

// ENTITY TYPES
// ============

export enum ChannelPropertyEntityTypes {
  PROPERTY = 'devices-node/channel-property',
}

// API RESPONSES
// =============

interface ChannelPropertyAttributesResponseInterface {
  property: string
  name: string | null
  settable: boolean
  queryable: boolean

  datatype: PropertyDatatypeTypes | null
  unit: string | null
  format: string | null

  value: string | number | boolean | null
  expected: string | number | boolean | null
  pending: boolean
}

interface ChannelRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: ChannelEntityTypes
}

interface ChannelRelationshipsResponseInterface extends TJsonApiRelation {
  data: ChannelRelationshipResponseInterface
}

interface ChannelPropertyRelationshipsResponseInterface extends TJsonApiRelationships {
  device: ChannelRelationshipsResponseInterface
}

export interface ChannelPropertyDataResponseInterface extends TJsonApiData {
  id: string
  type: ChannelPropertyEntityTypes
  attributes: ChannelPropertyAttributesResponseInterface
  relationships: ChannelPropertyRelationshipsResponseInterface
}

export interface ChannelPropertyResponseInterface extends TJsonApiBody {
  data: ChannelPropertyDataResponseInterface
}

export interface ChannelPropertiesResponseInterface extends TJsonApiBody {
  data: Array<ChannelPropertyDataResponseInterface>
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.channel.property',
  UPDATED = 'fb.bus.node.entity.updated.channel.property',
  DELETED = 'fb.bus.node.entity.deleted.channel.property',
}

export enum PublishRoutingKeys {
  DATA = 'fb.bus.node.data.channel.property',
}
