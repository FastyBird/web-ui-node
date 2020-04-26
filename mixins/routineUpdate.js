import routines from './routines'

import Action from '~/models/triggers-node/Action'
import Condition from '~/models/triggers-node/Condition'

import {
  TRIGGERS_ACTION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_CHANNEL_PROPERTY,
} from '~/models/triggers-node/types'

export default {

  mixins: [routines],

  methods: {

    /**
     * Change condition state
     *
     * @param {Object} condition
     * @param {Boolean} state
     */
    changeConditionState(condition, state) {
      this._.get(condition, 'rows', [])
        .forEach((row) => {
          Condition.dispatch('edit', {
            id: row.condition_id,
            data: {
              enabled: state,
            },
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
     * Condition was selected
     *
     * @param {Trigger} routine
     * @param {Object} data
     */
    addRoutineCondition(routine, data) {
      const storedConditions = this._.filter(routine.conditions, item => (item.device === data.device && item.channel === data.channel))

      const toCreate = []
      const toUpdate = []
      const toDelete = []

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
            toDelete.push({
              id: condition.id,
            })
          }
        })

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
                this.handleFormError(e.exception, errorMessageNotCreated)
              } else {
                this.$flashMessage(errorMessageNotCreated, 'error')
              }
            })
        })

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
                this.handleFormError(e.exception, errorMessageNotUpdated)
              } else {
                this.$flashMessage(errorMessageNotUpdated, 'error')
              }
            })
        })

      const errorMessageNotRemoved = this.$t('routines.messages.conditionNotRemoved', {
        routine: routine.name,
      })

      toDelete
        .forEach((item) => {
          Condition.dispatch('remove', {
            id: item.id,
          })
            .catch((e) => {
              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                this.handleFormError(e.exception, errorMessageNotRemoved)
              } else {
                this.$flashMessage(errorMessageNotRemoved, 'error')
              }
            })
        })
    },

    /**
     * Remove thing condition via edit window
     *
     * @param {Trigger} routine
     * @param {Object} thing
     */
    removeRoutineCondition(routine, thing) {
      const thingConditions = this._.filter(this.mapConditions(routine), condition => (condition.device === thing.device.identifier && condition.channel === thing.channel.channel))

      thingConditions.forEach((condition) => {
        this.removeTriggerCondition(condition)
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
          Action.dispatch('edit', {
            id: row.action_id,
            data: {
              enabled: state,
            },
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
     * Action was selected
     *
     * @param {Trigger} routine
     * @param {Object} data
     */
    addRoutineAction(routine, data) {
      const storedActions = this._.filter(routine.actions, item => (item.device === data.device && item.channel === data.channel))

      const toCreate = []
      const toUpdate = []
      const toDelete = []

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
            toDelete.push({
              id: action.id,
            })
          }
        })

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
                this.handleFormError(e.exception, errorMessageNotCreated)
              } else {
                this.$flashMessage(errorMessageNotCreated, 'error')
              }
            })
        })

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
                this.handleFormError(e.exception, errorMessageNotUpdated)
              } else {
                this.$flashMessage(errorMessageNotUpdated, 'error')
              }
            })
        })

      const errorMessageNotRemoved = this.$t('routines.messages.actionNotRemoved', {
        routine: routine.name,
      })

      toDelete
        .forEach((item) => {
          Action.dispatch('remove', {
            id: item.id,
          })
            .catch((e) => {
              if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                this.handleFormError(e.exception, errorMessageNotRemoved)
              } else {
                this.$flashMessage(errorMessageNotRemoved, 'error')
              }
            })
        })
    },

    /**
     * Remove thing action via edit window
     *
     * @param {Trigger} routine
     * @param {Object} thing
     */
    removeRoutineAction(routine, thing) {
      const thingActions = this._.filter(this.mapActions(routine), action => (action.device === thing.device.identifier && action.channel === thing.channel.channel))

      thingActions.forEach((action) => {
        this.removeTriggerAction(action)
      })
    },

  },

}
