import {
  Fields,
  Model,
} from '@vuex-orm/core'
import get from 'lodash/get'

import {
  TriggerEntityTypeType,
  TriggerInterface,
} from './types'

import Action from '~/models/triggers-node/actions/Action'
import { ActionInterface } from '~/models/triggers-node/actions/types'
import Condition from '~/models/triggers-node/conditions/Condition'
import {
  ConditionEntityTypeType,
  ConditionInterface,
} from '~/models/triggers-node/conditions/types'
import Notification from '~/models/triggers-node/notifications/Notification'
import { NotificationInterface } from '~/models/triggers-node/notifications/types'
import { ConditionOperatorType } from '~/models/triggers-node/types'

// ENTITY MODEL
// ============
export default class Trigger extends Model implements TriggerInterface {
  static get entity(): string {
    return 'trigger'
  }

  static fields(): Fields {
    return {
      id: this.string(''),
      type: this.string(''),

      draft: this.boolean(false),

      name: this.string(''),
      comment: this.string(null).nullable(),
      enabled: this.boolean(true),

      owner: this.string(null).nullable(),

      // Relations
      relationshipNames: this.attr([]),

      actions: this.hasMany(Action, 'triggerId'),
      conditions: this.hasMany(Condition, 'triggerId'),
      notifications: this.hasMany(Notification, 'triggerId'),

      // Channel property trigger
      device: this.string(null).nullable(),
      channel: this.string(null).nullable(),
      property: this.string(null).nullable(),
      operator: this.string(null).nullable(),
      operand: this.string(null).nullable(),
    }
  }

  id!: string
  type!: TriggerEntityTypeType

  draft!: boolean

  name!: string
  comment!: string | null
  enabled!: boolean

  owner!: string | null

  relationshipNames!: Array<string>

  actions!: Array<ActionInterface>
  conditions!: Array<ConditionInterface>
  notifications!: Array<NotificationInterface>

  operator!: ConditionOperatorType
  operand!: string
  device!: string
  channel!: string
  property!: string

  get isEnabled(): boolean {
    return this.enabled
  }

  get icon(): string {
    return 'magic'
  }

  get hasDescription(): boolean {
    if (this.isTime && (this.comment === null || this.comment === '')) {
      return true
    }

    return this.comment !== null && this.comment !== ''
  }

  get description(): string {
    if (this.isTime) {
      let days: Array<string> = []

      const schedule = Condition
        .query()
        .where('triggerId', this.id)
        .where('type', ConditionEntityTypeType.TIME)
        .first()

      if (schedule !== null) {
        if (schedule.days.length === 7) {
          days.push(Trigger.store().$i18n.t('triggers.texts.everyday').toString())
        } else {
          days = []

          for (const day of schedule.days) {
            switch (day) {
              case 1:
                days.push(Trigger.store().$i18n.t('application.days.mon.short').toString())
                break

              case 2:
                days.push(Trigger.store().$i18n.t('application.days.tue.short').toString())
                break

              case 3:
                days.push(Trigger.store().$i18n.t('application.days.wed.short').toString())
                break

              case 4:
                days.push(Trigger.store().$i18n.t('application.days.thu.short').toString())
                break

              case 5:
                days.push(Trigger.store().$i18n.t('application.days.fri.short').toString())
                break

              case 6:
                days.push(Trigger.store().$i18n.t('application.days.sat.short').toString())
                break

              case 7:
                days.push(Trigger.store().$i18n.t('application.days.sun.short').toString())
                break
            }
          }
        }

        return Trigger.store().$i18n.t('triggers.headings.scheduledTrigger', {
          days: days.join(', '),
          time: Trigger.store().$dateFns.format(new Date(schedule.time), get(Trigger.store().getters['session/getAccount'](), 'timeFormat', 'HH:mm')),
        }).toString()
      }
    }

    if (this.comment !== null && this.comment !== '') {
      return this.comment
    }

    return this.isAutomatic ? Trigger.store().$i18n.t('triggers.headings.automaticTrigger').toString() : Trigger.store().$i18n.t('triggers.headings.manualTrigger').toString()
  }

  get isAutomatic(): boolean {
    return this.type === TriggerEntityTypeType.AUTOMATIC
  }

  get isManual(): boolean {
    return this.type === TriggerEntityTypeType.MANUAL
  }

  get isForChannel(): boolean {
    return this.type === TriggerEntityTypeType.CHANNEL_PROPERTY
  }

  get isDate(): boolean {
    return Condition
      .query()
      .where('triggerId', this.id)
      .where('type', ConditionEntityTypeType.DATE)
      .exists()
  }

  get isTime(): boolean {
    return Condition
      .query()
      .where('triggerId', this.id)
      .where('type', ConditionEntityTypeType.TIME)
      .exists()
  }
}
