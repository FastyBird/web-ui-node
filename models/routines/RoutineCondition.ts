import { Model, Fields } from '@vuex-orm/core'

import Routine, { RoutineInterface } from '~/models/routines/Routine'
import RoutineConditionProperty, { RoutineConditionPropertyInterface } from '~/models/routines/RoutineConditionProperty'

// CREATE ENTITY INTERFACES
// ========================
export interface CreateRoutineConditionPropertyInterface {
  property: string;
  operator: string;
  operand: string;
}

export interface CreateRoutineConditionInterface {
  device: string;
  channel: string;
  enabled: boolean;
  rows: Array<CreateRoutineConditionPropertyInterface>;
}

// UPDATE ENTITY INTERFACES
// ========================
export interface UpdateRoutineConditionPropertyInterface {
  property: string;
  operator: string;
  operand: string;
}

export interface UpdateRoutineConditionInterface {
  device: string;
  channel: string;
  enabled: boolean;
  rows: Array<UpdateRoutineConditionPropertyInterface>;
}

// ENTITY INTERFACE
// ================
export interface RoutineConditionInterface {
  id: string,

  device: string,
  channel: string,
  deleted: boolean,

  routine_id: string,

  rows: Array<RoutineConditionPropertyInterface>,

  routine: RoutineInterface | null,
}

// ENTITY MODEL
// ============
export default class RoutineCondition extends Model implements RoutineConditionInterface {
  static get entity(): string {
    return 'routine_condition';
  }

  static fields(): Fields {
    return {
      id: this.string(''),

      device: this.string(''),
      channel: this.string(''),
      deleted: this.boolean(false),

      routine_id: this.string(''),

      rows: this.hasMany(RoutineConditionProperty, 'routine_condition_id'),

      routine: this.belongsTo(Routine, 'id'),
    }
  }

  id!: string;

  device!: string;
  channel!: string;
  deleted!: boolean;

  routine_id!: string;

  rows!: Array<RoutineConditionPropertyInterface>;

  routine!: RoutineInterface | null;

  get enabled(): boolean {
    let enabled = false

    this.rows
      .forEach((row: RoutineConditionPropertyInterface): void => {
        if (row.enabled) {
          enabled = true
        }
      })

    return enabled
  }
}
