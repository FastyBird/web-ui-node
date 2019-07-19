import { Model } from '@vuex-orm/core'

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

      thing: this.hasOne(Thing, 'id'),
    }
  }
}
