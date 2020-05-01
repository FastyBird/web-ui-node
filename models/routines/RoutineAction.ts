import { Model, Fields } from '@vuex-orm/core'

import Routine, { RoutineInterface } from '~/models/routines/Routine'
import RoutineActionProperty, { RoutineActionPropertyInterface } from '~/models/routines/RoutineActionProperty'

// CREATE ENTITY INTERFACES
// ========================
export interface CreateRoutineActionPropertyInterface {
  property: string;
  operation: string;
}

export interface CreateRoutineActionInterface {
  device: string;
  channel: string;
  enabled: boolean;
  rows: Array<CreateRoutineActionPropertyInterface>;
}

// UPDATE ENTITY INTERFACES
// ========================
export interface UpdateRoutineActionPropertyInterface {
  property: string;
  operation: string;
}

export interface UpdateRoutineActionInterface {
  device: string;
  channel: string;
  enabled: boolean;
  rows: Array<UpdateRoutineActionPropertyInterface>;
}

// ENTITY INTERFACE
// ================
export interface RoutineActionInterface {
  id: string,

  device: string,
  channel: string,

  deleted: boolean,

  routine_id: string,

  rows: Array<RoutineActionPropertyInterface>,

  routine: RoutineInterface | null,
}

// ENTITY MODEL
// ============
export default class RoutineAction extends Model implements RoutineActionInterface {
  static get entity(): string {
    return 'routine_action';
  }

  static fields(): Fields {
    return {
      id: this.string(''),

      device: this.string(''),
      channel: this.string(''),

      deleted: this.boolean(false),

      routine_id: this.string(''),

      rows: this.hasMany(RoutineActionProperty, 'routine_action_id'),

      routine: this.belongsTo(Routine, 'id'),
    }
  }

  id!: string;

  device!: string;
  channel!: string;

  deleted!: boolean;

  routine_id!: string;

  rows!: Array<RoutineActionPropertyInterface>;

  routine!: RoutineInterface | null;

  get enabled(): boolean {
    let enabled = false

    this.rows
      .forEach((row: RoutineActionPropertyInterface): void => {
        if (row.enabled) {
          enabled = true
        }
      })

    return enabled
  }
}
