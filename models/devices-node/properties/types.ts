// ENTITY INTERFACE
// ================

import { HardwareInterface } from '~/models/devices-node/hardwares/types'

export interface PropertyInterface {
  id: string

  property: string
  name: string | null
  settable: boolean
  queryable: boolean
  datatype: PropertyDatatypeType
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

export enum PropertyDatatypeType {
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
