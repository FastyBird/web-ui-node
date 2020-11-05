import {
  Model,
  Fields,
} from '@vuex-orm/core'
import capitalize from 'lodash/capitalize'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import {
  DeviceConfigurationInterface,
  DeviceConfigurationEntityTypeType,
  ValuesItemInterface,
} from '~/models/devices-node/device-configuration/types'
import Hardware from '~/models/devices-node/hardwares/Hardware'
import { HardwareInterface } from '~/models/devices-node/hardwares/types'

// ENTITY MODEL
// ============
export default class DeviceConfiguration extends Model implements DeviceConfigurationInterface {
  static get entity(): string {
    return 'device_configuration'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      // Common configuration
      configuration: this.string(''),
      name: this.string(null).nullable(),
      comment: this.string(null).nullable(),
      default: this.attr(null).nullable(),

      // Specific configuration
      min: this.number(null).nullable(),
      max: this.number(null).nullable(),
      step: this.number(null).nullable(),
      values: this.attr([]),

      // WS data
      value: this.attr(null).nullable(),

      // Relations
      relationshipNames: this.attr([]),

      device: this.belongsTo(Device, 'id'),
      deviceBackward: this.hasOne(Device, 'id', 'deviceId'),

      deviceId: this.string(''),
    }
  }

  id!: string
  type!: DeviceConfigurationEntityTypeType

  configuration!: string
  name!: string | null
  comment!: string | null
  default!: any | null

  min!: number | null
  max!: number | null
  step!: number | null
  values!: Array<ValuesItemInterface>

  value!: any

  relationshipNames!: Array<string>

  device!: DeviceInterface | null
  deviceBackward!: DeviceInterface | null

  deviceId!: string

  get isBoolean(): boolean {
    return this.type === DeviceConfigurationEntityTypeType.BOOLEAN
  }

  get isNumber(): boolean {
    return this.type === DeviceConfigurationEntityTypeType.NUMBER
  }

  get isSelect(): boolean {
    return this.type === DeviceConfigurationEntityTypeType.SELECT
  }

  get isText(): boolean {
    return this.type === DeviceConfigurationEntityTypeType.TEXT
  }

  get title(): string {
    if (this.name !== null) {
      return this.name
    }

    if (
      this.hardware !== null &&
      !this.hardware.isCustom &&
      Object.prototype.hasOwnProperty.call(DeviceConfiguration.store(), '$i18n') &&
      !DeviceConfiguration.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.configuration.${this.configuration}.title`).toString().includes('devices.vendors.')
    ) {
      return DeviceConfiguration.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.configuration.${this.configuration}.title`).toString()
    }

    return capitalize(this.configuration)
  }

  get description(): string | null {
    if (this.comment !== null) {
      return this.comment
    }

    if (
      this.hardware !== null &&
      !this.hardware.isCustom &&
      Object.prototype.hasOwnProperty.call(DeviceConfiguration.store(), '$i18n') &&
      !DeviceConfiguration.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.configuration.${this.configuration}.description`).toString().includes('devices.vendors.')
    ) {
      return DeviceConfiguration.store().$i18n.t(`devices.vendors.${this.hardware.manufacturer}.configuration.${this.configuration}.description`).toString()
    }

    return null
  }

  get selectValues(): Array<ValuesItemInterface> {
    if (!this.isSelect) {
      throw new Error(`This field is not allowed for entity type ${this.type}`)
    }

    if (
      this.hardware !== null &&
      !this.hardware.isCustom &&
      Object.prototype.hasOwnProperty.call(DeviceConfiguration.store(), '$i18n')
    ) {
      const items: Array<ValuesItemInterface> = []

      const hardware = this.hardware

      this.values
        .forEach((item) => {
          items.push({
            value: item.value,
            name: DeviceConfiguration.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.configuration.${this.configuration}.values.${item.name}`).toString(),
          })
        })

      return items
    }

    return this.values
  }

  get formattedValue(): any {
    if (this.isSelect) {
      if (
        this.hardware !== null &&
        !this.hardware.isCustom &&
        Object.prototype.hasOwnProperty.call(DeviceConfiguration.store(), '$i18n')
      ) {
        const hardware = this.hardware

        this.values
          .forEach((item) => {
            // eslint-disable-next-line eqeqeq
            if (item.value == this.value) {
              if (!DeviceConfiguration.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.configuration.${this.configuration}.values.${item.name}`).toString().includes('devices.vendors.')) {
                return DeviceConfiguration.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.configuration.${this.configuration}.values.${item.name}`)
              } else {
                return this.value
              }
            }
          })
      }
    }

    return this.value
  }

  get hardware(): HardwareInterface | null {
    return Hardware
      .query()
      .where('deviceId', this.deviceId)
      .first()
  }
}
