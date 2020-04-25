import routines from './routines'

import Action from '~/models/triggers-node/Action'
import Condition from '~/models/triggers-node/Condition'

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

  },

}
