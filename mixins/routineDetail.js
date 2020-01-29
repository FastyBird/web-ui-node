import routinesMixin from './routines'

export default {

  mixins: [routinesMixin],

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
