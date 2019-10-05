import { Model } from '@vuex-orm/core'
import get from 'lodash/get'
import find from 'lodash/find'

import Hardware from './Hardware'
import Firmware from './Firmware'
import Credentials from './Credentials'
import ThingProperty from './ThingProperty'
import ThingConfiguration from './ThingConfiguration'
import ThingSocket from './ThingSocket'

import {
  PROPERTY_TYPE_STATE,
} from './../../../constants'

export default class Thing extends Model {
  static entity = 'thing'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      parent_id: this.string(null).nullable(),

      title: this.string(null).nullable(),
      name: this.string(),
      comment: this.string(null).nullable(),
      is_enabled: this.boolean(false),
      serial_number: this.string(null).nullable(),
      params: this.attr(null),

      relationshipNames: this.attr(null).nullable(),

      channel_ids: this.attr(null),

      hardware: this.hasOne(Hardware, 'thing_id'),
      firmware: this.hasOne(Firmware, 'thing_id'),
      credentials: this.hasOne(Credentials, 'thing_id'),
      children: this.hasMany(Thing, 'parent_id'),
      properties: this.hasMany(ThingProperty, 'thing_id'),
      configuration: this.hasMany(ThingConfiguration, 'thing_id'),
      socket: this.hasOne(ThingSocket, 'id'),
    }
  }

  get label() {
    return this.title !== null ? this.title : this.name
  }

  get hasComment() {
    return this.comment !== null && this.comment !== ''
  }

  get state() {
    const property = find(this.properties, { property: PROPERTY_TYPE_STATE })

    if (property !== undefined) {
      return property.value === 'ready'
    }

    return false
  }

  get stateProperty() {
    return find(get(this, 'properties', []), { 'property': PROPERTY_TYPE_STATE })
  }
}
