import { Model, Fields } from '@vuex-orm/core'

import Action, { ActionInterface } from '~/models/triggers-node/Action'

// ENTITY INTERFACE
// ================
export interface RoutineActionPropertyInterface {
  id: string,

  routine_action_id: string,

  action: ActionInterface | null,

  enabled: boolean,

  operation: string | null,

  property: string | null,
}

// ENTITY MODEL
// ============
export default class RoutineActionProperty extends Model implements RoutineActionPropertyInterface {
  static get entity(): string {
    return 'routine_action_property';
  }

  static fields(): Fields {
    return {
      id: this.string(''),

      routine_action_id: this.string(''),

      // Trigger action mapping
      action: this.hasOne(Action, 'id', 'id'),
    }
  }

  id!: string;

  routine_action_id!: string;

  action!: ActionInterface | null;

  get enabled(): boolean {
    if (this.action === null || typeof this.action === 'undefined') {
      throw new Error('Action is not fetched')
    }

    return this.action.enabled
  }

  get operation(): string | null {
    if (this.action === null || typeof this.action === 'undefined') {
      throw new Error('Action is not fetched')
    }

    return this.action.value
  }

  get property(): string | null {
    if (this.action === null || typeof this.action === 'undefined') {
      throw new Error('Action is not fetched')
    }

    return this.action.property
  }
}
