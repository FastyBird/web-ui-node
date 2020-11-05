import { DeviceInterface } from '~/models/devices-node/devices/types'
import { HardwareInterface } from '~/models/devices-node/hardwares/types'

// ENTITY INTERFACE
// ================

export interface ValuesItemInterface {
  name: string
  value: any
}

export interface DeviceConfigurationInterface {
  id: string
  type: DeviceConfigurationEntityTypeType

  configuration: string
  name: string | null
  comment: string | null
  default: any | null
  min: number | null
  max: number | null
  step: number | null
  values: Array<ValuesItemInterface>

  value: any

  relationshipNames: Array<string>

  device: DeviceInterface | null
  deviceBackward: DeviceInterface | null

  deviceId: string

  isBoolean: boolean
  isNumber: boolean
  isSelect: boolean
  isText: boolean

  title: string
  description: string | null

  selectValues: Array<ValuesItemInterface>

  formattedValue: any

  hardware: HardwareInterface | null
}

// ENTITY TYPES
// ============

export enum DeviceConfigurationEntityTypeType {
  BOOLEAN = 'devices-node/device-configuration-boolean',
  NUMBER = 'devices-node/device-configuration-number',
  SELECT = 'devices-node/device-configuration-select',
  TEXT = 'devices-node/device-configuration-text',
}
