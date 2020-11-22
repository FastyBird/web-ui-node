import {
  Fields,
  Model,
} from '@vuex-orm/core'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import {
  ConditionEntityTypes,
  ConditionInterface,
} from '~/models/triggers-node/conditions/types'
import { ConditionOperatorTypes } from '~/models/triggers-node/types'

// ENTITY MODEL
// ============
export default class Condition extends Model implements ConditionInterface {
  static get entity(): string {
    return 'condition'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      draft: this.boolean(false),

      enabled: this.boolean(true),

      // Device or channel property condition
      operator: this.string(null).nullable(),
      operand: this.attr(null).nullable(),
      device: this.string(null).nullable(),
      channel: this.string(null).nullable(),
      property: this.string(null).nullable(),

      // Time condition
      time: this.attr(null).nullable(),
      days: this.attr([]),

      // Date condition
      date: this.attr(null),

      relationshipNames: this.attr([]),

      trigger: this.belongsTo(Trigger, 'id'),
      triggerBackward: this.hasOne(Trigger, 'id', 'triggerId'),

      triggerId: this.string(''),
    }
  }

  id!: string
  type!: ConditionEntityTypes

  draft!: boolean

  enabled!: boolean

  operator!: ConditionOperatorTypes
  operand!: string
  device!: string
  channel!: string
  property!: string

  time!: string
  days!: Array<number>

  date!: string

  relationshipNames!: Array<string>

  trigger!: TriggerInterface | null
  triggerBackward!: TriggerInterface | null

  triggerId!: string

  get isDeviceProperty(): boolean {
    return this.type === ConditionEntityTypes.DEVICE_PROPERTY
  }

  get isChannelProperty(): boolean {
    return this.type === ConditionEntityTypes.CHANNEL_PROPERTY
  }

  get isTime(): boolean {
    return this.type === ConditionEntityTypes.TIME
  }

  get isDate(): boolean {
    return this.type === ConditionEntityTypes.DATE
  }
}
