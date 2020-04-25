import { Model, Fields } from '@vuex-orm/core'

import Device, { DeviceInterface } from './Device'

// ENTITY INTERFACE
// ================
export interface CredentialsInterface {
  id: string,
  type: string,

  username: string,
  password: string,

  relationshipNames: Array<string>,

  device_id: string,

  device: DeviceInterface | null,
}

// ENTITY MODEL
// ============
export default class Credentials extends Model implements CredentialsInterface {
  static get entity(): string {
    return 'credentials';
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      // Common credentials
      username: this.string(''),
      password: this.string(''),

      relationshipNames: this.attr([]).nullable(),

      device_id: this.string(''),

      device: this.belongsTo(Device, 'id'),
    }
  }

  id!: string;
  type!: string;

  username!: string;
  password!: string;

  relationshipNames!: Array<string>;

  device_id!: string;

  device!: DeviceInterface | null;
}
