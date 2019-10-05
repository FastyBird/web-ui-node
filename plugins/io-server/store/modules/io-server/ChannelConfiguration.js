import { Model } from '@vuex-orm/core'

import {
  IO_SERVER_CHANNEL_CONFIGURATION_BOOLEAN,
  IO_SERVER_CHANNEL_CONFIGURATION_NUMBER,
  IO_SERVER_CHANNEL_CONFIGURATION_SELECT,
  IO_SERVER_CHANNEL_CONFIGURATION_TEXT,
} from './../../../api/types'

import Channel from './Channel'

export default class ChannelConfiguration extends Model {
  static entity = 'channel_configuration'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      name: this.string(),
      title: this.string(null).nullable(),
      comment: this.string(null).nullable(),
      default: this.attr().nullable(),
      min: this.number(null).nullable(),
      max: this.number(null).nullable(),
      step: this.number(null).nullable(),
      values: this.attr([]),

      relationshipNames: this.attr(null).nullable(),

      channel: this.belongsTo(Channel, 'id'),
    }
  }

  get isBoolean() {
    return this.type === IO_SERVER_CHANNEL_CONFIGURATION_BOOLEAN
  }

  get isNumber() {
    return this.type === IO_SERVER_CHANNEL_CONFIGURATION_NUMBER
  }

  get isSelect() {
    return this.type === IO_SERVER_CHANNEL_CONFIGURATION_SELECT
  }

  get isText() {
    return this.type === IO_SERVER_CHANNEL_CONFIGURATION_TEXT
  }
}
