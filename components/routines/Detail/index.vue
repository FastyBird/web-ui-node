<template>
  <div class="fb-routines-detail__container">
    <list-items-container
      v-if="routine.isAutomatic && schedule === null"
      :heading="$t('routines.headings.conditions')"
    >
      <list-condition
        v-for="(condition, index) in conditions"
        :key="`c-${index}`"
        :condition="condition"
        class="fb-routines-detail__conditions-container"
        @toggle="toggleConditionState(index)"
        @remove="confirmRemoveCondition(index)"
      />
    </list-items-container>

    <list-items-container :heading="$t('routines.headings.actions')">
      <list-action
        v-for="(action, index) in actions"
        :key="`a-${index}`"
        :action="action"
        class="fb-routines-detail__actions-container"
        @toggle="toggleActionState(index)"
        @remove="confirmRemoveAction(index)"
      />
    </list-items-container>

    <fb-confirmation-window
      v-if="remove.show"
      :transparent-bg="transparentModal"
      icon="trash"
      @confirmed="removeItem"
      @close="resetRemoveConfirmation"
    >
      <template v-if="remove.type === 'condition'">
        <template slot="header">
          {{ $t('routines.headings.removeCondition') }}
        </template>

        <template slot="question">
          <i18n
            path="routines.messages.confirmRemoveCondition"
            tag="p"
          >
            <strong slot="thing">{{ $tThing(remove.thing) }}</strong>
          </i18n>
        </template>
      </template>

      <template v-if="remove.type === 'action'">
        <template slot="header">
          {{ $t('routines.headings.removeAction') }}
        </template>

        <template slot="question">
          <i18n
            path="routines.messages.confirmRemoveAction"
            tag="p"
          >
            <strong slot="thing">{{ $tThing(remove.thing) }}</strong>
          </i18n>
        </template>
      </template>
    </fb-confirmation-window>
  </div>
</template>

<script>
import triggersMixin from '@/mixins/triggers'

const ListAction = () => import('./ListAction')
const ListCondition = () => import('./ListCondition')

export default {

  name: 'RoutinesDetail',

  components: {
    ListAction,
    ListCondition,
  },

  mixins: [triggersMixin],

  props: {

    routine: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      transparentModal: false,
      remove: {
        show: false,
        type: null,
        index: null,
        thing: null,
      },
    }
  },

  computed: {

    account() {
      return this.$store.getters['entities/account/query']()
        .first()
    },

    /**
     * Remap trigger conditions to routine conditions
     *
     * @returns {Array}
     */
    conditions() {
      return this.mapConditions(this.routine)
    },

    /**
     * Remap trigger actions to routine actions
     *
     * @returns {Array}
     */
    actions() {
      return this.mapActions(this.routine)
    },

    /**
     * Remap trigger notifications to routine notifications
     *
     * @returns {Array}
     */
    notifications() {
      return []
    },

    /**
     * View routine data
     *
     * @returns {(Condition|null)}
     */
    schedule() {
      const condition = this._.get(this.routine, 'conditions', []).find(item => item.isTime)

      if (typeof condition === 'undefined') {
        return null
      }

      return condition
    },

    /**
     * Flag signalizing that action or notification could be removed
     *
     * @returns {Boolean}
     */
    enabledRemovingActionNotification() {
      return this.actions.length > 1 || this.notifications.length > 1
    },

  },

  created() {
    this.transparentModal = this.$parent.$options.name !== 'Layout'
  },

  beforeMount() {
    if (!this.$store.getters['entities/thing/firstLoadFinished']()) {
      this.$store.dispatch('entities/thing/fetch', null, {
        root: true,
      })
        .catch(() => {
          this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
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
      if (Object.prototype.hasOwnProperty.call(this.conditions, index)) {
        this.changeConditionState(this.conditions[index], !this.conditions[index].enabled)
      }
    },

    /**
     * Change action state
     *
     * @param {Number} index
     */
    toggleActionState(index) {
      if (Object.prototype.hasOwnProperty.call(this.actions, index)) {
        this.changeActionState(this.actions[index], !this.actions[index].enabled)
      }
    },

    /**
     * Show remove confirmation window for condition
     *
     * @param {Number} index
     */
    confirmRemoveCondition(index) {
      this.remove.show = true
      this.remove.type = 'condition'
      this.remove.index = index
      this.remove.thing = this._findThing(this.conditions[index].thing)
    },

    /**
     * Show remove confirmation window for action
     *
     * @param {Number} index
     */
    confirmRemoveAction(index) {
      this.remove.show = true
      this.remove.type = 'action'
      this.remove.index = index
      this.remove.thing = this._findThing(this.actions[index].thing)
    },

    /**
     * Close remove confirmation window
     */
    resetRemoveConfirmation() {
      this.remove.show = false
      this.remove.type = null
      this.remove.index = null
      this.remove.thing = null
    },

    /**
     * Remove was confirmed
     */
    removeItem() {
      if (this.remove.type === 'condition') {
        if (this.routine.conditions.length <= 1) {
          this.$flashMessage(this.$t('routines.messages.minimumConditions'), 'error')

          return
        }

        if (Object.prototype.hasOwnProperty.call(this.conditions, this.remove.index)) {
          this.removeCondition(this.conditions[this.remove.index])

          this.resetRemoveConfirmation()
        }
      } else if (this.remove.type === 'action') {
        if (!this.enabledRemovingActionNotification) {
          this.$flashMessage(this.$t('routines.messages.minimumActionsNotification'), 'error')

          return
        }

        if (Object.prototype.hasOwnProperty.call(this.actions, this.remove.index)) {
          this.removeAction(this.actions[this.remove.index])

          this.resetRemoveConfirmation()
        }
      } else if (this.remove.type === 'notification') {
        this.removeNotification(this.remove.index)

        this.resetRemoveConfirmation()
      } else {
        this.resetRemoveConfirmation()
      }
    },

    /**
     * Remove notification from routine
     *
     * @param {Number} index
     */
    removeNotification(index) {
      this.resetRemoveConfirmation()

      if (!this.enabledRemovingActionNotification) {
        this.$flashMessage(this.$t('routines.messages.minimumActionsNotification'), 'error')

        return
      }

      if (Object.prototype.hasOwnProperty.call(this.notifications, index)) {
        const errorMessage = this.$t('routines.messages.notificationNotRemoved')

        this.$store.dispatch('entities/notification/remove', {
          id: this.notifications[index].id,
        }, {
          root: true,
        })
          .catch((e) => {
            if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
              this.handleFormError(e.exception, errorMessage)
            } else {
              this.$flashMessage(errorMessage, 'error')
            }
          })
      }
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
