import { Model } from '@vuex-orm/core'

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
    }
  }
}
