// ENTITY INTERFACE
// ================

import { HardwareInterface } from '~/models/devices-node/hardwares/types'

export interface PropertyInterface {
  id: string

  property: string
  name: string | null
  settable: boolean
  queryable: boolean
  datatype: PropertyDatatypeTypes
  unit: string | null
  format: string | null

  value: any
  expected: any
  pending: boolean

  command: PropertyCommandState | null
  lastResult: PropertyCommandResult | null
  backup: string | null

  relationshipNames: Array<string>

  hardware: HardwareInterface | null

  isAnalogSensor: boolean
  isBinarySensor: boolean
  isAnalogActor: boolean
  isBinaryActor: boolean
  isSwitch: boolean

  isInteger: boolean
  isFloat: boolean
  isNumber: boolean
  isBoolean: boolean
  isString: boolean
  isEnum: boolean
  isColor: boolean

  isSettable: boolean
  isQueryable: boolean

  binaryValue: boolean
  analogValue: string
  formattedValue: string

  icon: string
}

// ENTITY TYPES
// ============

export enum PropertyDatatypeTypes {
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  STRING = 'string',
  ENUM = 'enum',
  COLOR = 'color',
}

export enum PropertyCommandState {
  SENDING = 'sending',
  COMPLETED = 'completed',
}

export enum PropertyCommandResult {
  OK = 'ok',
  ERR = 'err',
}

export enum SensorNameTypes {
  SENSOR = 'sensor',
  AIR_QUALITY = 'air_quality',
  LIGHT_LEVEL = 'light_level',
  NOISE_LEVEL = 'noise_level',
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
}

export enum ActorNameTypes {
  ACTOR = 'actor',
  SWITCH = 'switch',
}
