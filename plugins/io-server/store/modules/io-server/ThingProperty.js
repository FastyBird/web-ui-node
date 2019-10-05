import { Model } from '@vuex-orm/core'

import {
  DATA_TYPE_INTEGER,
  DATA_TYPE_FLOAT,
  DATA_TYPE_BOOLEAN,
  DATA_TYPE_STRING,
  DATA_TYPE_ENUM,
  DATA_TYPE_COLOR,
} from './../../../constants'

import Thing from './Thing'

export default class ThingProperty extends Model {
  static entity = 'thing_property'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      thing_id: this.string(),

      property: this.string(),
      name: this.string(),
      is_settable: this.boolean(false),
      data_type: this.string(),
      format: this.string(null).nullable(),

      value: this.attr(),

      relationshipNames: this.attr(null).nullable(),

      thing: this.belongsTo(Thing, 'id'),
    }
  }

  get isInteger() {
    return this.data_type === DATA_TYPE_INTEGER
  }

  get isFloat() {
    return this.data_type === DATA_TYPE_FLOAT
  }

  get isNumber() {
    return this.data_type === DATA_TYPE_INTEGER || this.data_type === DATA_TYPE_FLOAT
  }

  get isBoolean() {
    return this.data_type === DATA_TYPE_BOOLEAN
  }

  get isString() {
    return this.data_type === DATA_TYPE_STRING
  }

  get isEnum() {
    return this.data_type === DATA_TYPE_ENUM
  }

  get isColor() {
    return this.data_type === DATA_TYPE_COLOR
  }
}
