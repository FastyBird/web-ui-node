<template>
  <div class="fb-iot-things-detail-button-trigger__container">
    <list-items-container :heading="heading">
      <trigger-action
        v-for="(action, index) in actions"
        :key="index"
        :action="action"
        class="fb-iot-things-detail-button-trigger__actions"
        @toggle="toggleActionState(index)"
        @remove="confirmRemoveAction(index)"
      />
    </list-items-container>

    <fb-confirmation-window
      v-if="remove.show"
      :transparent-bg="transparentModal"
      icon="trash"
      @confirmed="removeTriggerAction"
      @close="resetRemoveConfirmation"
    >
      <template slot="header">
        {{ $t('things.headings.removeAction') }}
      </template>

      <template slot="question">
        <i18n
          path="things.messages.confirmRemoveAction"
          tag="p"
        >
          <strong slot="thing">{{ $tThing(remove.thing) }}</strong>
        </i18n>
      </template>
    </fb-confirmation-window>
  </div>
</template>

<script>
  import {
    DEVICE_FASTYBIRD_BUTTON_PRESS,
    DEVICE_FASTYBIRD_BUTTON_CLICK,
    DEVICE_FASTYBIRD_BUTTON_DBL_CLICK,
  } from '@/configuration/devices'

  const TriggerAction = () => import('./../Action')

  import triggersMixin from '@/mixins/triggers'

  export default {

    name: 'ThingsDetailButtonTrigger',

    components: {
      TriggerAction,
    },

    mixins: [triggersMixin],

    props: {

      thing: {
        type: Object,
        required: true,
      },

      trigger: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        heading: null,
        transparentModal: false,
        remove: {
          show: false,
          index: null,
          thing: null,
        },
      }
    },

    computed: {

      /**
       * Remap trigger actions for displaying
       *
       * @returns {Array}
       */
      actions() {
        return this.mapActions(this.trigger)
      },

      /**
       * Get thing hardware info
       *
       * @returns {Hardware}
       */
      hardware() {
        return this.$store.getters['entities/hardware/query']()
          .where('device_id', this.thing.device_id)
          .first()
      },

    },

    created() {
      this.transparentModal = this.$parent.$options.name !== 'Layout'

      switch (this.trigger.operand) {
        case DEVICE_FASTYBIRD_BUTTON_PRESS:
          this.heading = this.$t('things.headings.buttonActionPressed')
          break

        case DEVICE_FASTYBIRD_BUTTON_CLICK:
          this.heading = this.$t('things.headings.buttonActionClicked')
          break

        case DEVICE_FASTYBIRD_BUTTON_DBL_CLICK:
          this.heading = this.$t('things.headings.buttonActionDblClicked')
          break
      }
    },

    methods: {

      /**
       * Change action state
       *
       * @param {Number} index
       */
      toggleActionState(index) {
        if (this.actions.hasOwnProperty(index)) {
          if (this.actions.hasOwnProperty(index)) {
            this.changeActionState(this.actions[index], !this.actions[index].enabled)
          }
        }
      },

      /**
       * Show remove confirmation window for action
       *
       * @param {Number} index
       */
      confirmRemoveAction(index) {
        this.remove.show = true
        this.remove.index = index
        this.remove.thing = this._findThing(this.actions[index].thing)
      },

      /**
       * Close remove confirmation window
       */
      resetRemoveConfirmation() {
        this.remove.show = false
        this.remove.index = null
        this.remove.thing = null
      },

      /**
       * Remove action from routine
       */
      removeTriggerAction() {
        const index = this.remove.index

        this.resetRemoveConfirmation()

        if (this.actions.hasOwnProperty(index)) {
          if (this.actions.length > 1) {
            this.removeAction(this.actions[index])
          } else {
            this.$store.dispatch('entities/trigger/remove', {
              id: this.trigger.id,
            }, {
              root: true,
            })
              .catch(e => {
                const errorMessage = this.$t('things.messages.actionNotRemoved')

                if (e.hasOwnProperty('exception')) {
                  this.handleFormError(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })
          }
        }
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
