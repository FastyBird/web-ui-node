import { orderBy } from 'natural-orderby'

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

      this._.get(trigger, 'conditions', [])
        .forEach((condition) => {
          if (typeof conditions.find(({ channel_id }) => channel_id === condition.channel_id) === 'undefined') {
            conditions.push({
              thing: condition.channel_id,
              enabled: condition.enabled,
              device_id: condition.device_id,
              channel_id: condition.channel_id,
              rows: [],
            })
          }
        })

      for (const i in conditions) {
        if (Object.prototype.hasOwnProperty.call(conditions, i)) {
          this._.filter(this._.get(trigger, 'conditions', []), { channel_id: conditions[i].channel_id })
            .forEach((condition) => {
              conditions[i].rows.push({
                condition_id: condition.id,
                property_id: condition.property_id,
                operand: condition.operand,
                operator: condition.operator,
              })
            })
        }
      }

      return orderBy(
        conditions,
        [
          v => v.thing_id,
        ],
        ['asc'],
      )
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

      this._.get(trigger, 'actions', [])
        .forEach((action) => {
          if (typeof actions.find(({ channel_id }) => channel_id === action.channel_id) === 'undefined') {
            actions.push({
              thing: action.channel_id,
              enabled: action.enabled,
              device_id: action.device_id,
              channel_id: action.channel_id,
              rows: [],
            })
          }
        })

      for (const i in actions) {
        if (Object.prototype.hasOwnProperty.call(actions, i)) {
          this._.filter(this._.get(trigger, 'actions', []), { channel_id: actions[i].channel_id })
            .forEach((action) => {
              actions[i].rows.push({
                action_id: action.id,
                property_id: action.property_id,
                operation: action.value,
              })
            })
        }
      }

      return orderBy(
        actions,
        [
          v => v.thing_id,
        ],
        ['asc'],
      )
    },

    /**
     * Remove condition from trigger
     *
     * @param {Object} condition
     */
    removeTriggerCondition(condition) {
      this._.get(condition, 'rows', [])
        .forEach((row) => {
          this.$store.dispatch('entities/condition/remove', {
            id: row.condition_id,
          }, {
            root: true,
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
      this._.get(action, 'rows', [])
        .forEach((row) => {
          this.$store.dispatch('entities/action/remove', {
            id: row.action_id,
          }, {
            root: true,
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
