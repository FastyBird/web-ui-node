import {
  Fields,
  Model,
} from '@vuex-orm/core'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import {
  ActionEntityTypeType,
  ActionInterface,
} from '~/models/triggers-node/actions/types'

// ENTITY MODEL
// ============
export default class Action extends Model implements ActionInterface {
  static get entity(): string {
    return 'action'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      draft: this.boolean(false),

      enabled: this.boolean(true),

      // Device or channel property action
      value: this.string(''),
      device: this.string(''),
      channel: this.string(null).nullable(),
      property: this.string(''),

      relationshipNames: this.attr([]),

      trigger: this.belongsTo(Trigger, 'id'),
      triggerBackward: this.hasOne(Trigger, 'id', 'triggerId'),

      triggerId: this.string(''),
    }
  }

  id!: string
  type!: ActionEntityTypeType

  draft!: boolean

  enabled!: boolean

  value!: string
  device!: string
  channel!: string
  property!: string

  relationshipNames!: Array<string>

  trigger!: TriggerInterface | null
  triggerBackward!: TriggerInterface | null

  triggerId!: string

  get isDeviceProperty(): boolean {
    return this.type === ActionEntityTypeType.DEVICE_PROPERTY
  }

  get isChannelProperty(): boolean {
    return this.type === ActionEntityTypeType.CHANNEL_PROPERTY
  }
}
