import { Model } from '@vuex-orm/core'

import {
  IO_SERVER_THING_CONFIGURATION_BOOLEAN,
  IO_SERVER_THING_CONFIGURATION_NUMBER,
  IO_SERVER_THING_CONFIGURATION_SELECT,
  IO_SERVER_THING_CONFIGURATION_TEXT,
} from './../../../api/types'

import Thing from './Thing'

export default class ThingConfiguration extends Model {
  static entity = 'thing_configuration'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      thing_id: this.string(),

      name: this.string(),
      title: this.string(null).nullable(),
      comment: this.string(null).nullable(),
      default: this.attr().nullable(),
      min: this.number(null).nullable(),
      max: this.number(null).nullable(),
      step: this.number(null).nullable(),
      values: this.attr([]),
      value: this.attr().nullable(),

      relationshipNames: this.attr(null).nullable(),

      thing: this.belongsTo(Thing, 'id'),
    }
  }

  get isBoolean() {
    return this.type === IO_SERVER_THING_CONFIGURATION_BOOLEAN
  }

  get isNumber() {
    return this.type === IO_SERVER_THING_CONFIGURATION_NUMBER
  }

  get isSelect() {
    return this.type === IO_SERVER_THING_CONFIGURATION_SELECT
  }

  get isText() {
    return this.type === IO_SERVER_THING_CONFIGURATION_TEXT
  }
}
