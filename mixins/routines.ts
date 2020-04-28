import get from 'lodash/get'
import filter from 'lodash/filter'

import { TriggerInterface } from '~/models/triggers-node/Trigger'
import Action, { ActionInterface } from '~/models/triggers-node/Action'
import Condition, { ConditionInterface } from '~/models/triggers-node/Condition'
import { ThingInterface } from '~/models/things/Thing'

import {
  TRIGGERS_ACTION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_CHANNEL_PROPERTY,
} from '~/models/triggers-node/types'

export interface MappedConditionRow {
  condition_id: string;
  property: string;
  operand: string;
  operator: string;
}

export interface MappedCondition {
  enabled: boolean;
  device: string;
  channel: string;
  rows: Array<MappedConditionRow>;
}

export interface MappedActionRow {
  action_id: string;
  property: string;
  operation: string;
}

export interface MappedAction {
  enabled: boolean;
  device: string;
  channel: string;
  rows: Array<MappedActionRow>;
}

interface CreateConditionInterface {
  id: string | null;
  type: string;
  device: string;
  channel: string;
  enabled: boolean;
  property: string;
  operator: string;
  operand: string;
}

interface UpdateConditionInterface {
  id: string | null;
  enabled: boolean;
  operator: string;
  operand: string;
}

interface CreateActionInterface {
  id: string | null;
  type: string;
  device: string;
  channel: string;
  enabled: boolean;
  property: string;
  value: string;
}

interface UpdateActionInterface {
  id: string | null;
  enabled: boolean;
  value: string;
}

export default {

  methods: {

    mapConditions(trigger: TriggerInterface): Array<MappedCondition> {
      const conditions: Array<MappedCondition> = []

      trigger.conditions
        .forEach((condition: ConditionInterface) => {
          if (typeof conditions.find(storedCondition => (storedCondition.device === condition.device && storedCondition.channel === condition.channel)) === 'undefined') {
            if (condition.device !== null && condition.channel !== null) {
              conditions.push({
                enabled: condition.enabled,
                device: condition.device,
                channel: condition.channel,
                rows: [],
              })
            }
          }
        })

      for (const i in conditions) {
        if (Object.prototype.hasOwnProperty.call(conditions, i)) {
          filter(trigger.conditions, { device: conditions[i].device, channel: conditions[i].channel })
            .forEach((condition: ConditionInterface) => {
              if (condition.property !== null && condition.operand !== null && condition.operator !== null) {
                conditions[i].rows.push({
                  condition_id: condition.id,
                  property: condition.property,
                  operand: condition.operand,
                  operator: condition.operator,
                })
              }
            })
        }
      }

      return conditions
    },

    changeConditionState(condition: MappedCondition, state: boolean): void {
      get(condition, 'rows', [])
        .forEach((row) => {
          Condition.dispatch('edit', {
            id: row.condition_id,
            data: {
              enabled: state,
            },
          })
            .catch((e) => {
              // @ts-ignore
              const errorMessage = this.$t('triggers.messages.conditionNotUpdated')

              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                // @ts-ignore
                this.handleFormError(e.exception, errorMessage)
              } else {
                // @ts-ignore
                this.$flashMessage(errorMessage, 'error')
              }
            })
        })
    },

    addRoutineCondition(routine: TriggerInterface, data: MappedCondition): void {
      const storedConditions = filter(routine.conditions, item => (item.device === data.device && item.channel === data.channel))

      const toCreate: Array<CreateConditionInterface> = []
      const toUpdate: Array<UpdateConditionInterface> = []
      const toDelete: Array<string> = []

      data.rows
        .forEach((row) => {
          const condition = routine.conditions
            .find(item => item.device === data.device && item.channel === data.channel && item.property === row.property)

          // Editing existing condition
          if (typeof condition !== 'undefined') {
            toUpdate.push({
              id: condition.id,
              enabled: !!data.enabled,
              operator: row.operator,
              operand: row.operand,
            })
            // Updating new condition
          } else {
            toCreate.push({
              id: null,
              type: TRIGGERS_CONDITION_CHANNEL_PROPERTY,
              device: data.device,
              channel: data.channel,
              enabled: !!data.enabled,
              property: row.property,
              operator: row.operator,
              operand: row.operand,
            })
          }
        })

      storedConditions
        .forEach((condition) => {
          if (typeof toUpdate.find(({ id }) => id === condition.id) === 'undefined') {
            toDelete.push(condition.id)
          }
        })

      // @ts-ignore
      const errorMessageNotCreated = this.$t('routines.messages.conditionNotCreated', {
        routine: routine.name,
      })

      toCreate
        .forEach((item) => {
          Condition.dispatch('add', {
            trigger: routine,
            data: item,
          })
            .catch((e) => {
              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                // @ts-ignore
                this.handleFormError(e.exception, errorMessageNotCreated)
              } else {
                // @ts-ignore
                this.$flashMessage(errorMessageNotCreated, 'error')
              }
            })
        })

      // @ts-ignore
      const errorMessageNotUpdated = this.$t('routines.messages.conditionNotUpdated', {
        routine: routine.name,
      })

      toUpdate
        .forEach((item) => {
          Condition.dispatch('edit', {
            id: item.id,
            data: item,
          })
            .catch((e) => {
              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                // @ts-ignore
                this.handleFormError(e.exception, errorMessageNotUpdated)
              } else {
                // @ts-ignore
                this.$flashMessage(errorMessageNotUpdated, 'error')
              }
            })
        })

      // @ts-ignore
      const errorMessageNotRemoved = this.$t('routines.messages.conditionNotRemoved', {
        routine: routine.name,
      })

      toDelete
        .forEach((id) => {
          Condition.dispatch('remove', {
            id,
          })
            .catch((e) => {
              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                // @ts-ignore
                this.handleFormError(e.exception, errorMessageNotRemoved)
              } else {
                // @ts-ignore
                this.$flashMessage(errorMessageNotRemoved, 'error')
              }
            })
        })
    },

    removeRoutineCondition(routine: TriggerInterface, thing: ThingInterface): void {
      const thingConditions = filter(this.mapConditions(routine), condition => (condition.device === thing.device.identifier && condition.channel === thing.channel.channel))

      thingConditions.forEach((condition) => {
        condition.rows
          .forEach((row) => {
            Condition.dispatch('remove', {
              id: row.condition_id,
            })
              .catch((e) => {
                // @ts-ignore
                const errorMessage = this.$t('triggers.messages.conditionNotRemoved')

                if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                  // @ts-ignore
                  this.handleFormError(e.exception, errorMessage)
                } else {
                  // @ts-ignore
                  this.$flashMessage(errorMessage, 'error')
                }
              })
          })
      })
    },

    mapActions(trigger: TriggerInterface): Array<MappedAction> {
      const actions: Array<MappedAction> = []

      trigger.actions
        .forEach((action: ActionInterface) => {
          if (typeof actions.find(storedAction => (storedAction.device === action.device && storedAction.channel === action.channel)) === 'undefined') {
            if (action.channel !== null) {
              actions.push({
                enabled: action.enabled,
                device: action.device,
                channel: action.channel,
                rows: [],
              })
            }
          }
        })

      for (const i in actions) {
        if (Object.prototype.hasOwnProperty.call(actions, i)) {
          filter(trigger.actions, { device: actions[i].device, channel: actions[i].channel })
            .forEach((action: ActionInterface) => {
              actions[i].rows.push({
                action_id: action.id,
                property: action.property,
                operation: action.value,
              })
            })
        }
      }

      return actions
    },

    changeActionState(action: MappedAction, state: boolean): void {
      get(action, 'rows', [])
        .forEach((row) => {
          Action.dispatch('edit', {
            id: row.action_id,
            data: {
              enabled: state,
            },
          })
            .catch((e) => {
              // @ts-ignore
              const errorMessage = this.$t('triggers.messages.actionNotUpdated')

              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                // @ts-ignore
                this.handleFormError(e.exception, errorMessage)
              } else {
                // @ts-ignore
                this.$flashMessage(errorMessage, 'error')
              }
            })
        })
    },

    addRoutineAction(routine: TriggerInterface, data: MappedAction): void {
      const storedActions = filter(routine.actions, item => (item.device === data.device && item.channel === data.channel))

      const toCreate: Array<CreateActionInterface> = []
      const toUpdate: Array<UpdateActionInterface> = []
      const toDelete: Array<string> = []

      data.rows
        .forEach((row) => {
          const action = routine.actions
            .find(item => item.device === data.device && item.channel === data.channel && item.property === row.property)

          // Editing existing action
          if (typeof action !== 'undefined') {
            toUpdate.push({
              id: action.id,
              enabled: !!data.enabled,
              value: row.operation,
            })
            // Updating new action
          } else {
            toCreate.push({
              id: null,
              type: TRIGGERS_ACTION_CHANNEL_PROPERTY,
              device: data.device,
              channel: data.channel,
              enabled: !!data.enabled,
              property: row.property,
              value: row.operation,
            })
          }
        })

      storedActions
        .forEach((action) => {
          if (typeof toUpdate.find(({ id }) => id === action.id) === 'undefined') {
            toDelete.push(action.id)
          }
        })

      // @ts-ignore
      const errorMessageNotCreated = this.$t('routines.messages.actionNotCreated', {
        routine: routine.name,
      })

      toCreate
        .forEach((item) => {
          Action.dispatch('add', {
            trigger: routine,
            data: item,
          })
            .catch((e) => {
              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                // @ts-ignore
                this.handleFormError(e.exception, errorMessageNotCreated)
              } else {
                // @ts-ignore
                this.$flashMessage(errorMessageNotCreated, 'error')
              }
            })
        })

      // @ts-ignore
      const errorMessageNotUpdated = this.$t('routines.messages.actionNotUpdated', {
        routine: routine.name,
      })

      toUpdate
        .forEach((item) => {
          Action.dispatch('edit', {
            id: item.id,
            data: item,
          })
            .catch((e) => {
              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                // @ts-ignore
                this.handleFormError(e.exception, errorMessageNotUpdated)
              } else {
                // @ts-ignore
                this.$flashMessage(errorMessageNotUpdated, 'error')
              }
            })
        })

      // @ts-ignore
      const errorMessageNotRemoved = this.$t('routines.messages.actionNotRemoved', {
        routine: routine.name,
      })

      toDelete
        .forEach((id) => {
          Action.dispatch('remove', {
            id,
          })
            .catch((e) => {
              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                // @ts-ignore
                this.handleFormError(e.exception, errorMessageNotRemoved)
              } else {
                // @ts-ignore
                this.$flashMessage(errorMessageNotRemoved, 'error')
              }
            })
        })
    },

    removeRoutineAction(routine: TriggerInterface, thing: ThingInterface): void {
      const thingActions = filter(this.mapActions(routine), action => (action.device === thing.device.identifier && action.channel === thing.channel.channel))

      thingActions.forEach((action) => {
        action.rows
          .forEach((row) => {
            Action.dispatch('remove', {
              id: row.action_id,
            })
              .catch((e) => {
                // @ts-ignore
                const errorMessage = this.$t('triggers.messages.actionNotRemoved')

                if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                  // @ts-ignore
                  this.handleFormError(e.exception, errorMessage)
                } else {
                  // @ts-ignore
                  this.$flashMessage(errorMessage, 'error')
                }
              })
          })
      })
    },

  },

}
