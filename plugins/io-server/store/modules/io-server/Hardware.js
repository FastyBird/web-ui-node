import { Model } from '@vuex-orm/core'

import {
  MANUFACTURER_GENERIC,
  MANUFACTURER_ITEAD,

  HARDWARE_MODEL_CUSTOM,
} from './../../../constants'

import Thing from './Thing'

export default class Hardware extends Model {
  static entity = 'hardware'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      thing_id: this.string(),

      name: this.string(),
      model: this.string(HARDWARE_MODEL_CUSTOM),
      manufacturer: this.string(MANUFACTURER_GENERIC),
      version: this.string(),
      mac_address: this.string(),

      relationshipNames: this.attr(null).nullable(),

      thing: this.belongsTo(Thing, 'id'),
    }
  }

  get isCustom() {
    return this.model === HARDWARE_MODEL_CUSTOM
  }

  get isManufacturerGeneric() {
    return this.manufacturer === MANUFACTURER_GENERIC
  }

  get isManufacturerItead() {
    return this.manufacturer === MANUFACTURER_ITEAD
  }
}
