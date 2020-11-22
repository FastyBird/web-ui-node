import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationships,
  TJsonApiRelationshipData,
} from 'jsona/lib/JsonaTypes'

import {
  DevicePropertyInterface,
  DevicePropertyEntityTypes,
} from '~/models/devices-node/device-properties/types'
import {
  DeviceConfigurationEntityTypes,
  DeviceConfigurationInterface,
} from '~/models/devices-node/device-configuration/types'
import {
  HardwareInterface,
  HardwareEntityTypes,
} from '~/models/devices-node/hardwares/types'
import {
  FirmwareInterface,
  FirmwareEntityTypes,
} from '~/models/devices-node/firmwares/types'
import {
  ChannelInterface,
  ChannelEntityTypes,
  ChannelResponseInterface,
} from '~/models/devices-node/channels/types'

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

export interface DeviceInterface {
  id: string
  type: DeviceEntityTypes

  draft: boolean

  parentId: string | null

  identifier: string
  name: string | null
  comment: string | null

  state: DeviceStateTypes
  enabled: boolean

  control: Array<string>

  owner: string | null

  relationshipNames: Array<string>

  children: Array<DeviceInterface>
  channels: Array<ChannelInterface>
  properties: Array<DevicePropertyInterface>
  configuration: Array<DeviceConfigurationInterface>

  hardware: HardwareInterface | null
  firmware: FirmwareInterface | null

  isEnabled: boolean
  isReady: boolean
  icon: string
  title: string
  hasComment: boolean
}

// ENTITY TYPES
// ============

export enum DeviceEntityTypes {
  PHYSICAL = 'devices-node/physical-device',
}

export enum DeviceStateTypes {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  INIT = 'init',
  READY = 'ready',
  SLEEPING = 'sleeping',
  LOST = 'lost',
  ALERT = 'alert',
  UNKNOWN = 'unknown',
}

// API RESPONSES
// =============

interface DeviceAttributesResponseInterface {
  identifier: string
  name: string | null
  comment: string | null

  state: DeviceStateTypes
  enabled: boolean

  control: Array<string>

  owner: string | null
}

interface DeviceRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: DeviceEntityTypes
}

interface DeviceParentRelationshipsResponseInterface extends TJsonApiRelation {
  data: DeviceRelationshipResponseInterface
}

interface DeviceChildrenRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<DeviceRelationshipResponseInterface>
}

interface DevicePropertyRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: DevicePropertyEntityTypes
}

interface DevicePropertiesRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<DevicePropertyRelationshipResponseInterface>
}

interface DeviceConfigurationRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: DeviceConfigurationEntityTypes
}

interface DeviceConfigurationRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<DeviceConfigurationRelationshipResponseInterface>
}

interface DeviceChannelRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: ChannelEntityTypes
}

interface DeviceChannelsRelationshipsResponseInterface extends TJsonApiRelation {
  data: Array<DeviceChannelRelationshipResponseInterface>
}

interface DeviceHardwareRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: HardwareEntityTypes
}

interface DeviceHardwareRelationshipsResponseInterface extends TJsonApiRelation {
  data: DeviceHardwareRelationshipResponseInterface
}

interface DeviceFirmwareRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: FirmwareEntityTypes
}

interface DeviceFirmwareRelationshipsResponseInterface extends TJsonApiRelation {
  data: DeviceFirmwareRelationshipResponseInterface
}

interface PhysicalDeviceRelationshipsResponseInterface extends TJsonApiRelationships {
  parent: DeviceParentRelationshipsResponseInterface
  children: DeviceChildrenRelationshipsResponseInterface
  properties: DevicePropertiesRelationshipsResponseInterface
  configuration: DeviceConfigurationRelationshipsResponseInterface
  channels: DeviceChannelsRelationshipsResponseInterface
  hardware: DeviceHardwareRelationshipsResponseInterface
  firmware: DeviceFirmwareRelationshipsResponseInterface
}

export interface DeviceDataResponseInterface extends TJsonApiData {
  id: string
  type: DeviceEntityTypes
  attributes: DeviceAttributesResponseInterface
  relationships: PhysicalDeviceRelationshipsResponseInterface
  included?: Array<ChannelResponseInterface>
}

export interface DeviceResponseInterface extends TJsonApiBody {
  data: DeviceDataResponseInterface
}

export interface DevicesResponseInterface extends TJsonApiBody {
  data: Array<DeviceDataResponseInterface>
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.device',
  UPDATED = 'fb.bus.node.entity.updated.device',
  DELETED = 'fb.bus.node.entity.deleted.device',
}

// CREATE ENTITY INTERFACES
// ========================

export interface DeviceCreateInterface {
  id: string | null
  type: DeviceEntityTypes

  identifier: string
  name?: string | null
  comment?: string | null
  enabled?: boolean
}

// UPDATE ENTITY INTERFACES
// ========================

export interface DeviceUpdateInterface {
  name?: string | null
  comment?: string | null
  enabled?: boolean
}
