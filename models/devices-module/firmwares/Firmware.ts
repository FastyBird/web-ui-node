import {
  Model,
  Fields,
} from '@vuex-orm/core'

import Device from '~/models/devices-module/devices/Device'
import { DeviceInterface } from '~/models/devices-module/devices/types'
import {
  FirmwareEntityTypes,
  FirmwareInterface,
  FirmwareManufacturerTypes,
} from '~/models/devices-module/firmwares/types'

// ENTITY MODEL
// ============
export default class Firmware extends Model implements FirmwareInterface {
  static get entity(): string {
    return 'firmware'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(FirmwareEntityTypes.FIRMWARE),

      // Common firmware
      name: this.string(null).nullable(),
      manufacturer: this.string(FirmwareManufacturerTypes.GENERIC),
      version: this.string(null).nullable(),

      // Relations
      relationshipNames: this.attr([]),

      device: this.belongsTo(Device, 'id'),
      deviceBackward: this.hasOne(Device, 'id', 'deviceId'),

      deviceId: this.string(''),
    }
  }

  id!: string
  type!: FirmwareEntityTypes

  name!: string | null
  manufacturer!: FirmwareManufacturerTypes
  version!: string | null

  relationshipNames!: Array<string>

  device!: DeviceInterface | null

  deviceId!: string
}
