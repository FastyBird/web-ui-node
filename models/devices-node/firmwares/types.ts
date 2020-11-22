import { DeviceInterface } from '~/models/devices-node/devices/types'

// ENTITY INTERFACE
// ================

export interface FirmwareInterface {
  id: string
  type: FirmwareEntityTypes

  name: string | null
  manufacturer: FirmwareManufacturerTypes
  version: string | null

  relationshipNames: Array<string>

  device: DeviceInterface | null

  deviceId: string
}

// ENTITY TYPES
// ============

export enum FirmwareEntityTypes {
  FIRMWARE = 'devices-node/firmware',
}

export enum FirmwareManufacturerTypes {
  GENERIC = 'generic',
  FASTYBIRD = 'fastybird',
}
