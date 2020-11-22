import {
  Model,
  Fields,
} from '@vuex-orm/core'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import {
  HardwareInterface,
  HardwareEntityTypes,
  HardwareManufacturerTypes,
  HardwareModelTypes,
} from '~/models/devices-node/hardwares/types'

export default class Hardware extends Model implements HardwareInterface {
  static get entity(): string {
    return 'hardware'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(HardwareEntityTypes.HARDWARE),

      // Common hardware
      model: this.string(HardwareModelTypes.CUSTOM),
      manufacturer: this.string(HardwareManufacturerTypes.GENERIC),
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
  type!: HardwareEntityTypes

  model!: HardwareModelTypes
  manufacturer!: HardwareManufacturerTypes
  version!: string | null
  macAddress!: string | null

  relationshipNames!: Array<string>

  device!: DeviceInterface | null

  deviceId!: string

  get isCustom(): boolean {
    return this.model === HardwareModelTypes.CUSTOM
  }

  get isManufacturerGeneric(): boolean {
    return this.manufacturer === HardwareManufacturerTypes.GENERIC
  }

  get isManufacturerItead(): boolean {
    return this.manufacturer === HardwareManufacturerTypes.ITEAD
  }

  get isManufacturerFastyBird(): boolean {
    return this.manufacturer === HardwareManufacturerTypes.FASTYBIRD
  }
}
