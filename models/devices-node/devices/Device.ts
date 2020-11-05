import {
  Fields,
  Model,
} from '@vuex-orm/core'
import capitalize from 'lodash/capitalize'

import {
  DeviceEntityTypeType,
  DeviceInterface,
  DeviceStateType,
} from '~/models/devices-node/devices/types'
import DeviceProperty from '~/models/devices-node/device-properties/DeviceProperty'
import { DevicePropertyInterface } from '~/models/devices-node/device-properties/types'
import DeviceConfiguration from '~/models/devices-node/device-configuration/DeviceConfiguration'
import { DeviceConfigurationInterface } from '~/models/devices-node/device-configuration/types'
import Hardware from '~/models/devices-node/hardwares/Hardware'
import {
  HardwareInterface,
  HardwareModelType,
} from '~/models/devices-node/hardwares/types'
import Firmware from '~/models/devices-node/firmwares/Firmware'
import { FirmwareInterface } from '~/models/devices-node/firmwares/types'
import Channel from '~/models/devices-node/channels/Channel'
import { ChannelInterface } from '~/models/devices-node/channels/types'

// ENTITY MODEL
// ============
export default class Device extends Model implements DeviceInterface {
  static get entity(): string {
    return 'device'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      draft: this.boolean(false),

      parentId: this.string(null).nullable(),

      // Common device
      identifier: this.string(''),
      name: this.string(null).nullable(),
      comment: this.string(null).nullable(),
      state: this.string(DeviceStateType.UNKNOWN),
      enabled: this.boolean(false),

      control: this.attr([]),

      owner: this.string(null).nullable(),

      // Relations
      relationshipNames: this.attr([]),

      // Common device
      children: this.hasMany(Device, 'parentId'),
      channels: this.hasMany(Channel, 'deviceId'),
      properties: this.hasMany(DeviceProperty, 'deviceId'),
      configuration: this.hasMany(DeviceConfiguration, 'deviceId'),

      // Physical device
      hardware: this.hasOne(Hardware, 'deviceId'),
      firmware: this.hasOne(Firmware, 'deviceId'),
    }
  }

  id!: string
  type!: DeviceEntityTypeType

  draft!: boolean

  parentId!: string | null

  identifier!: string
  name!: string | null
  comment!: string | null
  state!: DeviceStateType
  enabled!: boolean

  control!: Array<string>

  owner!: string | null

  relationshipNames!: Array<string>

  children!: Array<DeviceInterface>
  channels!: Array<ChannelInterface>
  properties!: Array<DevicePropertyInterface>
  configuration!: Array<DeviceConfigurationInterface>

  hardware!: HardwareInterface | null
  firmware!: FirmwareInterface | null

  get isEnabled(): boolean {
    return this.enabled
  }

  get isReady(): boolean {
    return this.state === DeviceStateType.READY
  }

  get icon(): string {
    const hardware = Hardware
      .query()
      .where('deviceId', this.id)
      .first()

    if (hardware === null || hardware.isCustom) {
      return 'plug'
    }

    if (hardware.isManufacturerItead) {
      switch (hardware.model) {
        case HardwareModelType.SONOFF_SC:
          return 'thermometer-half'

        case HardwareModelType.SONOFF_POW:
        case HardwareModelType.SONOFF_POW_R2:
          return 'calculator'
      }
    }

    return 'plug'
  }

  get title(): string {
    if (this.name !== null) {
      return this.name
    }

    if (Object.prototype.hasOwnProperty.call(Device.store(), '$i18n')) {
      const hardware = Hardware
        .query()
        .where('deviceId', this.id)
        .first()

      if (!hardware || hardware.isCustom) {
        return capitalize(this.identifier)
      }

      if (!Device.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.devices.${hardware.model}.title`).toString().includes('devices.vendors.')) {
        return Device.store().$i18n.t(`devices.vendors.${hardware.manufacturer}.devices.${hardware.model}.title`).toString()
      }
    }

    return capitalize(this.identifier)
  }

  get hasComment(): boolean {
    return this.comment !== null && this.comment !== ''
  }
}
