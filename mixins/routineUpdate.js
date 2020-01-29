import routinesMixin from './routines'

export default {

  mixins: [routinesMixin],

  methods: {

    /**
     * Condition was selected
     *
     * @param {Trigger} routine
     * @param {Object} data
     */
    addRoutineCondition(routine, data) {
      const storedConditions = this._.filter(this._.get(routine, 'conditions', []), ({ channel_id }) => channel_id === data.thing)

      const toCreate = []
      const toUpdate = []
      const toDelete = []

      this._.get(data, 'rows', [])
        .forEach((row) => {
          const condition = this._.get(routine, 'conditions', [])
            .find(item => item.channel_id === this._.get(data, 'thing') && item.property_id === this._.get(row, 'property_id'))

          // Editing existing condition
          if (typeof condition !== 'undefined') {
            toUpdate.push({
              id: condition.id,
              enabled: this._.get(data, 'enabled', false),
              operator: this._.get(row, 'operator'),
              operand: this._.get(row, 'operand'),
            })
            // Updating new condition
          } else {
            toCreate.push({
              trigger: this._.get(data, 'thing'),
              enabled: this._.get(data, 'enabled', false),
              property: this._.get(row, 'property_id'),
              operator: this._.get(row, 'operator'),
              operand: this._.get(row, 'operand'),
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
          this.$store.dispatch('entities/condition/add', {
            trigger: routine,
            data: item,
          }, {
            root: true,
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
          this.$store.dispatch('entities/condition/edit', {
            id: item.id,
            data: item,
          }, {
            root: true,
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
          this.$store.dispatch('entities/condition/remove', {
            id: item.id,
          }, {
            root: true,
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
      const thingConditions = this._.filter(this.mapConditions(routine), condition => condition.thing === thing.id)

      thingConditions.forEach((condition) => {
        this.removeTriggerCondition(condition)
      })
    },

    /**
     * Action was selected
     *
     * @param {Trigger} routine
     * @param {Object} data
     */
    addRoutineAction(routine, data) {
      const storedActions = this._.filter(this._.get(routine, 'actions', []), ({ channel_id }) => channel_id === data.thing)

      const toCreate = []
      const toUpdate = []
      const toDelete = []

      this._.get(data, 'rows', [])
        .forEach((row) => {
          const action = this._.get(routine, 'actions', [])
            .find(item => item.channel_id === this._.get(data, 'thing') && item.property_id === this._.get(row, 'property_id'))

          // Editing existing action
          if (typeof action !== 'undefined') {
            toUpdate.push({
              id: action.id,
              enabled: this._.get(data, 'enabled', false),
              value: this._.get(row, 'operation'),
            })
            // Updating new action
          } else {
            toCreate.push({
              channel: this._.get(data, 'thing'),
              enabled: this._.get(data, 'enabled', false),
              property: this._.get(row, 'property_id'),
              value: this._.get(row, 'operation'),
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
          this.$store.dispatch('entities/action/add', {
            trigger: routine,
            data: item,
          }, {
            root: true,
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
          this.$store.dispatch('entities/action/edit', {
            id: item.id,
            data: item,
          }, {
            root: true,
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
          this.$store.dispatch('entities/action/remove', {
            id: item.id,
          }, {
            root: true,
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
      const thingActions = this._.filter(this.mapActions(routine), action => action.thing === thing.id)

      thingActions.forEach((action) => {
        this.removeTriggerAction(action)
      })
    },

  },

}
