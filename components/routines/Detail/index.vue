<template>
  <div class="fb-routines-detail__container">
    <list-items-container :heading="$t('routines.headings.conditions')">
      <list-condition
        v-for="(condition, index) in conditions"
        :key="`c-${index}`"
        :condition="condition"
        class="fb-routines-detail__conditions-container"
        @toggle="toggleConditionState(index)"
      />
    </list-items-container>

    <list-items-container :heading="$t('routines.headings.actions')">
      <list-action
        v-for="(action, index) in actions"
        :key="`a-${index}`"
        :action="action"
        class="fb-routines-detail__actions-container"
        @toggle="toggleActionState(index)"
      />
    </list-items-container>
  </div>
</template>

<script>
  const ListAction = () => import('./ListAction')
  const ListCondition = () => import('./ListCondition')

  export default {

    name: 'RoutinesDetail',

    components: {
      ListAction,
      ListCondition,
    },

    props: {

      routine: {
        type: Object,
        required: true,
      },

    },

    computed: {

      /**
       * Remap trigger conditions to routine conditions
       *
       * @returns {Array}
       */
      conditions() {
        const conditions = []

        this._.get(this.routine, 'conditions', [])
          .forEach(condition => {
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
          if (conditions.hasOwnProperty(i)) {
            this._.filter(this._.get(this.routine, 'conditions', []), { 'channel_id': conditions[i].channel_id })
              .forEach(condition => {
                conditions[i].rows.push({
                  id: condition.id,
                  property_id: condition.property_id,
                  operands: condition.operands,
                  operator: condition.operator,
                })
              })
          }
        }

        return conditions
      },

      /**
       * Remap trigger actions to routine actions
       *
       * @returns {Array}
       */
      actions() {
        const actions = []

        this._.get(this.routine, 'actions', [])
          .forEach(action => {
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
          if (actions.hasOwnProperty(i)) {
            this._.filter(this._.get(this.routine, 'actions', []), { 'channel_id': actions[i].channel_id })
              .forEach(action => {
                actions[i].rows.push({
                  id: action.id,
                  property_id: action.property_id,
                  operation: action.value,
                })
              })
          }
        }

        return actions
      },

    },

    beforeMount() {
      if (!this.$store.getters['entities/thing/firstLoadFinished']()) {
        this.$store.dispatch('entities/thing/fetch', null, {
          root: true,
        })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }
    },

    methods: {

      /**
       * Change condition state
       *
       * @param {Number} index
       */
      toggleConditionState(index) {
        if (this.conditions.hasOwnProperty(index)) {
          this.conditions[index].rows
            .forEach(condition => {
              this.$store.dispatch('entities/condition/edit', {
                id: condition.id,
                data: {
                  enabled: !this.conditions[index].enabled,
                },
              }, {
                root: true,
              })
                .catch(e => {
                  const errorMessage = this.$t('routines.messages.conditionNotUpdated')

                  if (e.hasOwnProperty('exception')) {
                    this.handleFormError(e.exception, errorMessage)
                  } else {
                    this.$flashMessage(errorMessage, 'error')
                  }
                })
            })
        }
      },

      /**
       * Change action state
       *
       * @param {Number} index
       */
      toggleActionState(index) {
        if (this.actions.hasOwnProperty(index)) {
          this.actions[index].rows
            .forEach(action => {
              this.$store.dispatch('entities/action/edit', {
                id: action.id,
                data: {
                  enabled: !this.actions[index].enabled,
                },
              }, {
                root: true,
              })
                .catch(e => {
                  const errorMessage = this.$t('routines.messages.actionNotUpdated')

                  if (e.hasOwnProperty('exception')) {
                    this.handleFormError(e.exception, errorMessage)
                  } else {
                    this.$flashMessage(errorMessage, 'error')
                  }
                })
            })
        }
      },

      /**
       * Remove condition from routine
       *
       * @param {Object} condition
       */
      removeCondition(condition) {
        if (this.routine.conditions.length <= 1) {
          this.$flashMessage(this.$t('routines.messages.minimumConditions'), 'error')

          return
        }

        const errorMessage = this.$t('routines.messages.conditionNotRemoved')

        this.$store.dispatch('entities/condition/remove', {
          id: condition.id,
        }, {
          root: true,
        })
          .catch(e => {
            if (e.hasOwnProperty('exception')) {
              this.handleFormError(e.exception, errorMessage)
            } else {
              this.$flashMessage(errorMessage, 'error')
            }
          })
      },

      /**
       * Remove action from routine
       *
       * @param {Object} action
       */
      removeAction(action) {
        if (!this.enabledRemovingActionNotification) {
          this.$flashMessage(this.$t('routines.messages.minimumActionsNotification'), 'error')

          return
        }

        const errorMessage = this.$t('routines.messages.actionNotRemoved')

        this.$store.dispatch('entities/action/remove', {
          id: action.id,
        }, {
          root: true,
        })
          .catch(e => {
            if (e.hasOwnProperty('exception')) {
              this.handleFormError(e.exception, errorMessage)
            } else {
              this.$flashMessage(errorMessage, 'error')
            }
          })
      },

      /**
       * Remove notification from routine
       *
       * @param {Object} notification
       */
      removeNotification(notification) {
        if (!this.enabledRemovingActionNotification) {
          this.$flashMessage(this.$t('routines.messages.minimumActionsNotification'), 'error')

          return
        }

        const errorMessage = this.$t('routines.messages.notificationNotRemoved')

        this.$store.dispatch('entities/notification/remove', {
          id: notification.id,
        }, {
          root: true,
        })
          .catch(e => {
            if (e.hasOwnProperty('exception')) {
              this.handleFormError(e.exception, errorMessage)
            } else {
              this.$flashMessage(errorMessage, 'error')
            }
          })
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
