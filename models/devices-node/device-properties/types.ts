import {
  TJsonApiBody,
  TJsonApiData,
  TJsonApiRelation,
  TJsonApiRelationshipData,
  TJsonApiRelationships,
} from 'jsona/lib/JsonaTypes'

import {
  DeviceEntityTypeType,
  DeviceInterface,
} from '~/models/devices-node/devices/types'
import {
  PropertyDatatypeType,
  PropertyInterface,
} from '~/models/devices-node/properties/types'

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

export interface DevicePropertyInterface extends PropertyInterface {
  type: DevicePropertyEntityTypeType

  device: DeviceInterface | null
  deviceBackward: DeviceInterface | null

  deviceId: string

  title: string
}

// ENTITY TYPES
// ============

export enum DevicePropertyEntityTypeType {
  PROPERTY = 'devices-node/device-property',
}

// API RESPONSES
// =============

interface DevicePropertyAttributesResponseInterface {
  property: string
  name: string | null
  settable: boolean
  queryable: boolean

  datatype: PropertyDatatypeType | null
  unit: string | null
  format: string | null

  value: string | number | boolean | null
  expected: string | number | boolean | null
  pending: boolean
}

interface DeviceRelationshipResponseInterface extends TJsonApiRelationshipData {
  id: string
  type: DeviceEntityTypeType
}

interface DeviceRelationshipsResponseInterface extends TJsonApiRelation {
  data: DeviceRelationshipResponseInterface
}

interface DevicePropertyRelationshipsResponseInterface extends TJsonApiRelationships {
  device: DeviceRelationshipsResponseInterface
}

export interface DevicePropertyDataResponseInterface extends TJsonApiData {
  id: string
  type: DevicePropertyEntityTypeType
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
