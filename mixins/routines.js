import Action from '~/models/triggers-node/Action'
import Condition from '~/models/triggers-node/Condition'

export default {

  methods: {

    /**
     * Map trigger conditions to grouped conditions
     *
     * @param {Trigger} trigger
     *
     * @returns {Array}
     */
    mapConditions(trigger) {
      const conditions = []

      trigger.conditions
        .forEach((condition) => {
          if (typeof conditions.find(storedCondition => (storedCondition.device === condition.device && storedCondition.channel === condition.channel)) === 'undefined') {
            conditions.push({
              enabled: condition.enabled,
              device: condition.device,
              channel: condition.channel,
              rows: [],
            })
          }
        })

      for (const i in conditions) {
        if (Object.prototype.hasOwnProperty.call(conditions, i)) {
          this._.filter(trigger.conditions, { device: conditions[i].device, channel: conditions[i].channel })
            .forEach((condition) => {
              conditions[i].rows.push({
                condition_id: condition.id,
                property: condition.property,
                operand: condition.operand,
                operator: condition.operator,
              })
            })
        }
      }

      return conditions
    },

    /**
     * Map trigger actions to grouped actions
     *
     * @param {Trigger} trigger
     *
     * @returns {Array}
     */
    mapActions(trigger) {
      const actions = []

      trigger.actions
        .forEach((action) => {
          if (typeof actions.find(storedAction => (storedAction.device === action.device && storedAction.channel === action.channel)) === 'undefined') {
            actions.push({
              enabled: action.enabled,
              device: action.device,
              channel: action.channel,
              rows: [],
            })
          }
        })

      for (const i in actions) {
        if (Object.prototype.hasOwnProperty.call(actions, i)) {
          this._.filter(trigger.actions, { device: actions[i].device, channel: actions[i].channel })
            .forEach((action) => {
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

    /**
     * Remove condition from trigger
     *
     * @param {Object} condition
     */
    removeTriggerCondition(condition) {
      condition.rows
        .forEach((row) => {
          Condition.dispatch('remove', {
            id: row.condition_id,
          })
            .catch((e) => {
              const errorMessage = this.$t('triggers.messages.conditionNotRemoved')

              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                this.handleFormError(e.exception, errorMessage)
              } else {
                this.$flashMessage(errorMessage, 'error')
              }
            })
        })
    },

    /**
     * Remove action from trigger
     *
     * @param {Object} action
     */
    removeTriggerAction(action) {
      action.rows
        .forEach((row) => {
          Action.dispatch('remove', {
            id: row.action_id,
          })
            .catch((e) => {
              const errorMessage = this.$t('triggers.messages.actionNotRemoved')

              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                this.handleFormError(e.exception, errorMessage)
              } else {
                this.$flashMessage(errorMessage, 'error')
              }
            })
        })
    },

  },

}
