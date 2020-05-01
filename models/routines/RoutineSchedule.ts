import { Model, Fields } from '@vuex-orm/core'

import Routine, { RoutineInterface } from '~/models/routines/Routine'
import Condition, { ConditionInterface } from '~/models/triggers-node/Condition'

// ENTITY INTERFACE
// ================
export interface RoutineScheduleInterface {
  id: string,

  routine_id: string,

  routine: RoutineInterface | null,

  condition: ConditionInterface | null,
}

// ENTITY MODEL
// ============
export default class RoutineSchedule extends Model implements RoutineScheduleInterface {
  static get entity(): string {
    return 'routine_schedule';
  }

  static fields(): Fields {
    return {
      id: this.string(''),

      routine_id: this.string(''),

      routine: this.belongsTo(Routine, 'id'),

      // Trigger condition mapping
      condition: this.hasOne(Condition, 'id', 'id'),
    }
  }

  id!: string;

  routine_id!: string;

  routine!: RoutineInterface | null;

  condition!: ConditionInterface;

  get time(): string | null {
    if (this.condition === null || typeof this.condition === 'undefined') {
      throw new Error('Condition is not fetched')
    }

    return this.condition.time
  }

  get days(): Array<number> {
    if (this.condition === null || typeof this.condition === 'undefined') {
      throw new Error('Condition is not fetched')
    }

    return this.condition.days
  }

  get date(): string | null {
    if (this.condition === null || typeof this.condition === 'undefined') {
      throw new Error('Condition is not fetched')
    }

    return this.condition.date
  }

  get isTime(): boolean {
    if (this.condition === null || typeof this.condition === 'undefined') {
      throw new Error('Condition is not fetched')
    }

    return this.condition.isTime
  }

  get isDate(): boolean {
    if (this.condition === null || typeof this.condition === 'undefined') {
      throw new Error('Condition is not fetched')
    }

    return this.condition.isDate
  }
}
