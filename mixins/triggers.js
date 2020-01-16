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
     * Change condition state
     *
     * @param {Object} condition
     * @param {Boolean} state
     */
    changeConditionState(condition, state) {
      this._.get(condition, 'rows', [])
        .forEach((row) => {
          this.$store.dispatch('entities/condition/edit', {
            id: row.condition_id,
            data: {
              enabled: state,
            },
          }, {
            root: true,
          })
            .catch((e) => {
              const errorMessage = this.$t('triggers.messages.conditionNotUpdated')

              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                this.handleFormError(e.exception, errorMessage)
              } else {
                this.$flashMessage(errorMessage, 'error')
              }
            })
        })
    },

    /**
     * Change action state
     *
     * @param {Object} action
     * @param {Boolean} state
     */
    changeActionState(action, state) {
      this._.get(action, 'rows', [])
        .forEach((row) => {
          this.$store.dispatch('entities/action/edit', {
            id: row.action_id,
            data: {
              enabled: state,
            },
          }, {
            root: true,
          })
            .catch((e) => {
              const errorMessage = this.$t('triggers.messages.actionNotUpdated')

              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                this.handleFormError(e.exception, errorMessage)
              } else {
                this.$flashMessage(errorMessage, 'error')
              }
            })
        })
    },

    /**
     * Remove condition from trigger
     *
     * @param {Object} condition
     */
    removeCondition(condition) {
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
    removeAction(action) {
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

    /**
     * Find thing object by identifier
     *
     * @param {String} id
     *
     * @returns {Thing}
     */
    _findThing(id) {
      return this.$store.getters['entities/thing/query']()
        .with('device')
        .with('channel')
        .with('channel.properties')
        .where('id', id)
        .first()
    },

  },

}
