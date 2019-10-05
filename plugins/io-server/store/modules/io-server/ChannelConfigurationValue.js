import { Model } from '@vuex-orm/core'

export default class ChannelConfigurationValue extends Model {
  static entity = 'channel_configuration_value'

  // static primaryKey = ['channel_id', 'configuration_id']

  static fields() {
    return {
      id: this.string(),

      channel_id: this.string(),
      configuration_id: this.string(),

      value: this.attr(),
    }
  }
}
