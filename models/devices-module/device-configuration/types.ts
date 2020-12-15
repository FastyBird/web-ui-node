import { DeviceInterface } from '~/models/devices-module/devices/types'
import { HardwareInterface } from '~/models/devices-module/hardwares/types'

// ENTITY INTERFACE
// ================

export interface ValuesItemInterface {
  name: string
  value: any
}

export interface DeviceConfigurationInterface {
  id: string
  type: DeviceConfigurationEntityTypes

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

export enum DeviceConfigurationEntityTypes {
  BOOLEAN = 'devices-module/device-configuration-boolean',
  NUMBER = 'devices-module/device-configuration-number',
  SELECT = 'devices-module/device-configuration-select',
  TEXT = 'devices-module/device-configuration-text',
}
