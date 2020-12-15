import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationshipData,
  TJsonApiRelationships,
} from 'jsona/lib/JsonaTypes'

import {
  DeviceEntityTypes,
  DeviceInterface,
} from '~/models/devices-module/devices/types'
import {
  PropertyDatatypeTypes,
  PropertyInterface,
} from '~/models/devices-module/properties/types'

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

export interface DevicePropertyInterface extends PropertyInterface {
  type: DevicePropertyEntityTypes

  device: DeviceInterface | null
  deviceBackward: DeviceInterface | null

  deviceId: string

  title: string
}

// ENTITY TYPES
// ============

export enum DevicePropertyEntityTypes {
  PROPERTY = 'devices-module/device-property',
}

// API RESPONSES
// =============

interface DevicePropertyAttributesResponseInterface {
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

interface DeviceRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: DeviceEntityTypes
}

interface DeviceRelationshipsResponseInterface extends TJsonApiRelation {
  data: DeviceRelationshipResponseInterface
}

interface DevicePropertyRelationshipsResponseInterface extends TJsonApiRelationships {
  device: DeviceRelationshipsResponseInterface
}

export interface DevicePropertyDataResponseInterface extends TJsonApiData {
  id: string
  type: DevicePropertyEntityTypes
  attributes: DevicePropertyAttributesResponseInterface
  relationships: DevicePropertyRelationshipsResponseInterface
}

export interface DevicePropertyResponseInterface extends TJsonApiBody {
  data: DevicePropertyDataResponseInterface
}

export interface DevicePropertiesResponseInterface extends TJsonApiBody {
  data: Array<DevicePropertyDataResponseInterface>
}

// RABBIT MQ MESSAGES
// ==================

export enum RoutingKeys {
  CREATED = 'fb.bus.node.entity.created.device.property',
  UPDATED = 'fb.bus.node.entity.updated.device.property',
  DELETED = 'fb.bus.node.entity.deleted.device.property',
}
