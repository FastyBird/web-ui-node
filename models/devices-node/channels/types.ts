import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationships,
  TJsonApiRelationshipData,
} from 'jsona/lib/JsonaTypes'

import {
  DeviceInterface,
  DeviceEntityTypeType,
} from '~/models/devices-node/devices/types'
import {
  ChannelPropertyInterface,
  ChannelPropertyEntityTypeType,
} from '~/models/devices-node/channel-properties/types'
import {
  ChannelConfigurationInterface,
  ChannelConfigurationEntityTypeType,
} from '~/models/devices-node/channel-configuration/types'

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

export interface ChannelInterface {
  id: string
  type: ChannelEntityTypeType

  channel: string
  name: string | null
  comment: string | null

  control: Array<string>

  relationshipNames: Array<string>

  properties: Array<ChannelPropertyInterface>
  configuration: Array<ChannelConfigurationInterface>

  device: DeviceInterface | null
  deviceBackward: DeviceInterface | null

  deviceId: string

  title: string
}

// ENTITY TYPES
// ============

export enum ChannelEntityTypeType {
  CHANNEL = 'devices-node/channel',
}

// API RESPONSES
// =============

interface ChannelAttributesResponseInterface {
  channel: string
  name: string | null
  comment: string | null

  control: Array<string>
}

interface ChannelDeviceRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: DeviceEntityTypeType
}

interface ChannelDeviceRelationshipsResponseInterface extends TJsonApiRelation {
  data: ChannelDeviceRelationshipResponseInterface
}

interface ChannelPropertyRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: ChannelPropertyEntityTypeType
}

interface ChannelPropertiesRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<ChannelPropertyRelationshipResponseInterface>
}

interface ChannelConfigurationRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: ChannelConfigurationEntityTypeType
}

interface ChannelConfigurationRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<ChannelConfigurationRelationshipResponseInterface>
}

interface ChannelRelationshipsResponseInterface extends TJsonApiRelationships {
  device: ChannelDeviceRelationshipsResponseInterface
  properties: ChannelPropertiesRelationshipsResponseInterface
  configuration: ChannelConfigurationRelationshipsResponseInterface
}

export interface ChannelDataResponseInterface extends TJsonApiData {
  id: string
  type: ChannelEntityTypeType
  attributes: ChannelAttributesResponseInterface
  relationships: ChannelRelationshipsResponseInterface
}

export interface ChannelResponseInterface extends TJsonApiBody {
  data: ChannelDataResponseInterface
}

export interface ChannelsResponseInterface extends TJsonApiBody {
  data: Array<ChannelDataResponseInterface>
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.channel',
  UPDATED = 'fb.bus.node.entity.updated.channel',
  DELETED = 'fb.bus.node.entity.deleted.channel',
}
