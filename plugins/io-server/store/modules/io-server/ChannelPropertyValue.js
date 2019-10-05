import { Model } from '@vuex-orm/core'

export default class ChannelPropertyValue extends Model {
  static entity = 'channel_property_value'

  // static primaryKey = ['channel_id', 'property_id']

  static fields() {
    return {
      id: this.string(),
      channel_id: this.string(),
      property_id: this.string(),

      value: this.attr(),
      command: this.string(null).nullable(),
      backup: this.string(null).nullable(),
    }
  }
}
