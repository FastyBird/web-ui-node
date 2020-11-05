import {
  Model,
  Fields,
} from '@vuex-orm/core'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import {
  FirmwareEntityTypeType,
  FirmwareInterface,
  FirmwareManufacturerType,
} from '~/models/devices-node/firmwares/types'

// ENTITY MODEL
// ============
export default class Firmware extends Model implements FirmwareInterface {
  static get entity(): string {
    return 'firmware'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(FirmwareEntityTypeType.FIRMWARE),

      // Common firmware
      name: this.string(null).nullable(),
      manufacturer: this.string(FirmwareManufacturerType.GENERIC),
      version: this.string(null).nullable(),

      // Relations
      relationshipNames: this.attr([]),

      device: this.belongsTo(Device, 'id'),
      deviceBackward: this.hasOne(Device, 'id', 'deviceId'),

      deviceId: this.string(''),
    }
  }

  id!: string
  type!: FirmwareEntityTypeType

  name!: string | null
  manufacturer!: FirmwareManufacturerType
  version!: string | null

  relationshipNames!: Array<string>

  device!: DeviceInterface | null

  deviceId!: string
}
