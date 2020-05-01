import { Model, Fields } from '@vuex-orm/core'

import Condition, { ConditionInterface } from '~/models/triggers-node/Condition'

// ENTITY INTERFACE
// ================
export interface RoutineConditionPropertyInterface {
  id: string,

  routine_condition_id: string,

  condition: ConditionInterface | null,

  enabled: boolean,

  operator: string | null,
  operand: string | null,

  property: string | null,
}

// ENTITY MODEL
// ============
export default class RoutineConditionProperty extends Model implements RoutineConditionPropertyInterface {
  static get entity(): string {
    return 'routine_condition_property';
  }

  static fields(): Fields {
    return {
      id: this.string(''),

      routine_condition_id: this.string(''),

      // Trigger condition mapping
      condition: this.hasOne(Condition, 'id', 'id'),
    }
  }

  id!: string;

  routine_condition_id!: string;

  condition!: ConditionInterface | null;

  get enabled(): boolean {
    if (this.condition === null || typeof this.condition === 'undefined') {
      throw new Error('Condition is not fetched')
    }

    return this.condition.enabled
  }

  get operator(): string | null {
    if (this.condition === null || typeof this.condition === 'undefined') {
      throw new Error('Condition is not fetched')
    }

    return this.condition.operator
  }

  get operand(): string | null {
    if (this.condition === null || typeof this.condition === 'undefined') {
      throw new Error('Condition is not fetched')
    }

    return this.condition.operand
  }

  get property(): string | null {
    if (this.condition === null || typeof this.condition === 'undefined') {
      throw new Error('Condition is not fetched')
    }

    return this.condition.property
  }
}
