import { Model, Fields } from '@vuex-orm/core'

import Device, { DeviceInterface } from './Device'

import {
  MANUFACTURER_GENERIC,
  MANUFACTURER_ITEAD,
  MANUFACTURER_FASTYBIRD,

  HARDWARE_MODEL_CUSTOM,
} from './constants'

export interface HardwareInterface {
  id: string,
  type: string,

  model: string,
  manufacturer: string,
  version: string | null,
  mac_address: string | null,

  relationshipNames: Array<string>,

  device_id: string,

  device: DeviceInterface | null,

  isCustom: boolean,
  isManufacturerGeneric: boolean,
  isManufacturerItead: boolean,
  isManufacturerFastyBird: boolean,
}

export default class Hardware extends Model implements HardwareInterface {
  static get entity(): string {
    return 'hardware';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      // Common hardware
      model: this.string(HARDWARE_MODEL_CUSTOM),
      manufacturer: this.string(MANUFACTURER_GENERIC),
      version: this.string(null).nullable(),
      mac_address: this.string(null).nullable(),

      relationshipNames: this.attr([]).nullable(),

      device_id: this.string(''),

      device: this.belongsTo(Device, 'id'),
    }
  }

  id!: string;
  type!: string;

  model!: string;
  manufacturer!: string;
  version!: string | null;
  mac_address!: string | null;

  relationshipNames!: Array<string>;

  device_id!: string;

  device!: DeviceInterface | null;

  get isCustom(): boolean {
    return this.model === HARDWARE_MODEL_CUSTOM;
  }

  get isManufacturerGeneric(): boolean {
    return this.manufacturer === MANUFACTURER_GENERIC;
  }

  get isManufacturerItead(): boolean {
    return this.manufacturer === MANUFACTURER_ITEAD;
  }

  get isManufacturerFastyBird(): boolean {
    return this.manufacturer === MANUFACTURER_FASTYBIRD;
  }
}
