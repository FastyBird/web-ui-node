import { Model } from '@vuex-orm/core'
import get from 'lodash/get'
import find from 'lodash/find'

import {
  PROPERTY_TYPE_STATE,

  CHANNEL_TYPE_ANALOG_SENSOR,
  CHANNEL_TYPE_ANALOG_ACTOR,
  CHANNEL_TYPE_BINARY_SENSOR,
  CHANNEL_TYPE_BINARY_ACTOR,
  CHANNEL_TYPE_EVENT,
  CHANNEL_TYPE_BUTTON,
  CHANNEL_TYPE_ENERGY,
  CHANNEL_TYPE_ENVIRONMENT,
  CHANNEL_TYPE_LIGHT,
  CHANNEL_TYPE_SWITCH,
} from './../../../constants'

import ChannelConfiguration from './ChannelConfiguration'
import ChannelProperty from './ChannelProperty'
import Thing from './Thing'

export default class Channel extends Model {
  static entity = 'channel'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      thing_id: this.string(),

      title: this.string(null).nullable(),
      name: this.string(),
      comment: this.string().nullable(),
      channel: this.string(),
      structure_type: this.string(),
      params: this.attr(),

      relationshipNames: this.attr(null).nullable(),

      property_ids: this.attr(null),
      properties: this.hasManyBy(ChannelProperty, 'property_ids'),

      configuration_ids: this.attr(null),
      configuration: this.hasManyBy(ChannelConfiguration, 'configuration_ids'),

      thing: this.belongsTo(Thing, 'id'),
    }
  }

  get label() {
    return this.title !== null ? this.title : this.name
  }

  get hasComment() {
    return this.comment !== null && this.comment !== ''
  }

  get stateProperty() {
    return find(get(this, 'properties', []), { 'property': PROPERTY_TYPE_STATE })
  }

  get isAnalogSensor() {
    return this.structure_type === CHANNEL_TYPE_ANALOG_SENSOR
  }

  get isAnalogActor() {
    return this.structure_type === CHANNEL_TYPE_ANALOG_ACTOR
  }

  get isBinarySensor() {
    return this.structure_type === CHANNEL_TYPE_BINARY_SENSOR
  }

  get isBinaryActor() {
    return this.structure_type === CHANNEL_TYPE_BINARY_ACTOR
  }

  get isEvent() {
    return this.structure_type === CHANNEL_TYPE_EVENT
  }

  get isButton() {
    return this.structure_type === CHANNEL_TYPE_BUTTON
  }

  get isEnergy() {
    return this.structure_type === CHANNEL_TYPE_ENERGY
  }

  get isEnvironment() {
    return this.structure_type === CHANNEL_TYPE_ENVIRONMENT
  }

  get isLight() {
    return this.structure_type === CHANNEL_TYPE_LIGHT
  }

  get isSwitch() {
    return this.structure_type === CHANNEL_TYPE_SWITCH
  }
}
