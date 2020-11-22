import { Fields } from '@vuex-orm/core'
import capitalize from 'lodash/capitalize'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import Hardware from '~/models/devices-node/hardwares/Hardware'
import {
  DevicePropertyInterface,
  DevicePropertyEntityTypes,
} from '~/models/devices-node/device-properties/types'
import Property from '~/models/devices-node/properties/Property'
import { HardwareInterface } from '~/models/devices-node/hardwares/types'

// ENTITY MODEL
// ============
export default class DeviceProperty extends Property implements DevicePropertyInterface {
  static get entity(): string {
    return 'device_property'
  }

  static fields(): Fields {
    return Object.assign(Property.fields(), {
      type: this.string(DevicePropertyEntityTypes.PROPERTY),

      device: this.belongsTo(Device, 'id'),
      deviceBackward: this.hasOne(Device, 'id', 'deviceId'),

      deviceId: this.string(''),
    })
  }

  type!: DevicePropertyEntityTypes

  device!: DeviceInterface | null
  deviceBackward!: DeviceInterface | null

  deviceId!: string

  get title(): string {
    if (this.name !== null) {
      return this.name
    }

    if (
      this.hardware !== null &&
      !this.hardware.isCustom &&
      Object.prototype.hasOwnProperty.call(DeviceProperty.store(), '$i18n') &&
      DeviceProperty.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.title`).toString().includes('devices.vendors.')
    ) {
      return DeviceProperty.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.properties.${this.property}.title`).toString()
    }

    return capitalize(this.property)
  }

  get hardware(): HardwareInterface | null {
    return Hardware
      .query()
      .where('deviceId', this.id)
      .first()
  }
}
