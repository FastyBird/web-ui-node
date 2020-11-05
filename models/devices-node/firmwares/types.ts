import { DeviceInterface } from '~/models/devices-node/devices/types'

// ENTITY INTERFACE
// ================

export interface FirmwareInterface {
  id: string
  type: FirmwareEntityTypeType

  name: string | null
  manufacturer: FirmwareManufacturerType
  version: string | null

  relationshipNames: Array<string>

  device: DeviceInterface | null

  deviceId: string
}

// ENTITY TYPES
// ============

export enum FirmwareEntityTypeType {
  FIRMWARE = 'devices-node/firmware',
}

export enum FirmwareManufacturerType {
  GENERIC = 'generic',
  FASTYBIRD = 'fastybird',
}
