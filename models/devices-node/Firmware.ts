import { Model, Fields } from '@vuex-orm/core'

import Device, { DeviceInterface } from './Device'

import {
  MANUFACTURER_GENERIC,
} from './constants'

// ENTITY INTERFACE
// ================
export interface FirmwareInterface {
  id: string,
  type: string,

  name: string | null,
  manufacturer: string,
  version: string | null,

  relationshipNames: Array<string>,

  device_id: string,

  device: DeviceInterface | null,
}

// ENTITY MODEL
// ============
export default class Firmware extends Model implements FirmwareInterface {
  static get entity(): string {
    return 'firmware';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      // Common firmware
      name: this.string(null).nullable(),
      manufacturer: this.string(MANUFACTURER_GENERIC),
      version: this.string(null).nullable(),

      relationshipNames: this.attr([]).nullable(),

      device_id: this.string(''),

      device: this.belongsTo(Device, 'id'),
    }
  }

  id!: string;
  type!: string;

  name!: string | null;
  manufacturer!: string;
  version!: string | null;

  relationshipNames!: Array<string>;

  device_id!: string;

  device!: DeviceInterface | null;
}
