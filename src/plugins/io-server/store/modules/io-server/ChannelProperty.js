import { Model } from '@vuex-orm/core'

export default class ChannelProperty extends Model {
  static entity = 'channel_property'

  static fields() {
    return {
      id: this.string(),
      type: this.string(),

      property: this.string(),
      name: this.string(),
      is_settable: this.boolean(false),
      data_type: this.string(),
      format: this.string(null).nullable(),
      units: this.string(null).nullable(),

      relationshipNames: this.attr(null).nullable(),
    }
  }
}
