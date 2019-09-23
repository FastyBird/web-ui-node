import { Model } from '@vuex-orm/core'

import Thing from './Thing'
import ChannelConfiguration from './ChannelConfiguration'
import ChannelProperty from './ChannelProperty'

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

      thing: this.hasOne(Thing, 'id'),

      property_ids: this.attr(null),
      properties: this.hasManyBy(ChannelProperty, 'property_ids'),

      configuration_ids: this.attr(null),
      configuration: this.hasManyBy(ChannelConfiguration, 'configuration_ids'),
    }
  }

  get label() {
    return this.title !== null ? this.title : this.name
  }

  get hasComment() {
    return this.comment !== null && this.comment !== ''
  }
}
