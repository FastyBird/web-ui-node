import { Model, Fields } from '@vuex-orm/core'

import Trigger, { TriggerInterface } from '~/models/triggers-node/Trigger'
import RoutineCondition, { RoutineConditionInterface } from '~/models/routines/RoutineCondition'
import RoutineAction, { RoutineActionInterface } from '~/models/routines/RoutineAction'
import RoutineSchedule, { RoutineScheduleInterface } from '~/models/routines/RoutineSchedule'

// ENTITY INTERFACE
// ================
export interface RoutineInterface {
  trigger_id: string,

  trigger?: TriggerInterface | null,

  conditions: Array<RoutineConditionInterface>,
  actions: Array<RoutineActionInterface>,
  schedule: RoutineScheduleInterface | null,

  name?: string;
}

// ENTITY MODEL
// ============
export default class Routine extends Model implements RoutineInterface {
  static get entity(): string {
    return 'routine';
  }

  static get primaryKey(): string {
    return 'trigger_id';
  }

  static fields(): Fields {
    return {
      trigger_id: this.string(''),

      trigger: this.hasOne(Trigger, 'id', 'trigger_id'),

      conditions: this.hasMany(RoutineCondition, 'routine_id', 'trigger_id'),
      actions: this.hasMany(RoutineAction, 'routine_id', 'trigger_id'),
      schedule: this.hasOne(RoutineSchedule, 'routine_id', 'trigger_id'),
    }
  }

  trigger_id!: string;

  trigger?: TriggerInterface | null;

  conditions!: Array<RoutineConditionInterface>;
  actions!: Array<RoutineActionInterface>;
  schedule!: RoutineScheduleInterface | null;

  get id(): string {
    return this.trigger_id
  }

  get name(): string {
    if (this.trigger === null || typeof this.trigger === 'undefined') {
      throw new Error('Trigger is not fetched')
    }

    return this.trigger.name
  }

  get comment(): string | null {
    if (this.trigger === null || typeof this.trigger === 'undefined') {
      throw new Error('Trigger is not fetched')
    }

    return this.trigger.comment
  }

  get hasComment(): boolean {
    if (this.trigger === null || typeof this.trigger === 'undefined') {
      throw new Error('Trigger is not fetched')
    }

    return this.trigger.hasComment
  }

  get enabled(): boolean {
    if (this.trigger === null || typeof this.trigger === 'undefined') {
      throw new Error('Trigger is not fetched')
    }

    return this.trigger.enabled
  }

  get isAutomatic(): boolean {
    if (this.trigger === null || typeof this.trigger === 'undefined') {
      throw new Error('Trigger is not fetched')
    }

    return this.trigger.isAutomatic
  }

  get isManual(): boolean {
    if (this.trigger === null || typeof this.trigger === 'undefined') {
      throw new Error('Trigger is not fetched')
    }

    return this.trigger.isManual
  }

  get isForChannel(): boolean {
    if (this.trigger === null || typeof this.trigger === 'undefined') {
      throw new Error('Trigger is not fetched')
    }

    return this.trigger.isForChannel
  }
}
