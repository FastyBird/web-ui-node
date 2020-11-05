import {
  Model,
  Fields,
} from '@vuex-orm/core'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import {
  HardwareInterface,
  HardwareEntityTypeType,
  HardwareManufacturerType,
  HardwareModelType,
} from '~/models/devices-node/hardwares/types'

export default class Hardware extends Model implements HardwareInterface {
  static get entity(): string {
    return 'hardware'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(HardwareEntityTypeType.HARDWARE),

      // Common hardware
      model: this.string(HardwareModelType.CUSTOM),
      manufacturer: this.string(HardwareManufacturerType.GENERIC),
      version: this.string(null).nullable(),
      macAddress: this.string(null).nullable(),

      // Relations
      relationshipNames: this.attr([]),

      device: this.belongsTo(Device, 'id'),
      deviceBackward: this.hasOne(Device, 'id', 'deviceId'),

      deviceId: this.string(''),
    }
  }

  id!: string
  type!: HardwareEntityTypeType

  model!: HardwareModelType
  manufacturer!: HardwareManufacturerType
  version!: string | null
  macAddress!: string | null

  relationshipNames!: Array<string>

  device!: DeviceInterface | null

  deviceId!: string

  get isCustom(): boolean {
    return this.model === HardwareModelType.CUSTOM
  }

  get isManufacturerGeneric(): boolean {
    return this.manufacturer === HardwareManufacturerType.GENERIC
  }

  get isManufacturerItead(): boolean {
    return this.manufacturer === HardwareManufacturerType.ITEAD
  }

  get isManufacturerFastyBird(): boolean {
    return this.manufacturer === HardwareManufacturerType.FASTYBIRD
  }
}
