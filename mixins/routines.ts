import filter from 'lodash/filter'

import { TriggerInterface } from '~/models/triggers-node/Trigger'
import { ActionInterface } from '~/models/triggers-node/Action'
import { ConditionInterface } from '~/models/triggers-node/Condition'

interface MappedConditionRow {
  condition_id: string;
  property: string;
  operand: string;
  operator: string;
}

interface MappedCondition {
  enabled: boolean;
  device: string;
  channel: string;
  rows: Array<MappedConditionRow>;
}

interface MappedActionRow {
  action_id: string;
  property: string;
  operation: string;
}

interface MappedAction {
  enabled: boolean;
  device: string;
  channel: string;
  rows: Array<MappedActionRow>;
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

  },

}
