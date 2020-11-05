<template>
  <div class="fb-things-detail-button-trigger__container">
    <list-items-container :heading="heading">
      <trigger-action
        v-for="action in trigger.actions"
        :key="action.id"
        :action="action"
        class="fb-things-detail-button-trigger__actions"
        @toggle="toggleActionState(action)"
        @remove="confirmRemoveAction(action)"
      />
    </list-items-container>

    <fb-ui-confirmation-window
      v-if="remove.show"
      :transparent-bg="transparentModal"
      icon="trash"
      @confirmed="removeAction"
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
          <strong slot="thing">{{ remove.thing.channel.title }}</strong>
        </i18n>
      </template>
    </fb-ui-confirmation-window>
  </div>
</template>

<script>
import TriggerAction from './Action'

import {
  DEVICE_FASTYBIRD_BUTTON_PRESS,
  DEVICE_FASTYBIRD_BUTTON_CLICK,
  DEVICE_FASTYBIRD_BUTTON_DBL_CLICK,
} from '~/configuration/devices'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import Action from '~/models/triggers-node/actions/Action'
import Device from '~/models/devices-node/devices/Device'
import Channel from '~/models/devices-node/channels/Channel'
import Thing from '~/models/things/Thing'

export default {

  name: 'ThingsDetailButtonTrigger',

  components: {
    TriggerAction,
  },

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
        item: null,
        thing: null,
      },
    }
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
     * @param {Action} action
     */
    toggleActionState(action) {
      Action.dispatch('edit', {
        id: action.id,
        data: {
          enabled: !action.enabled,
        },
      })
        .catch((e) => {
          const errorMessage = this.$t('triggers.messages.actionNotUpdated')

          if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
            this.handleException(e.exception, errorMessage)
          } else {
            this.$flashMessage(errorMessage, 'error')
          }
        })
    },

    /**
     * Show remove confirmation window for action
     *
     * @param {Action} action
     */
    confirmRemoveAction(action) {
      const device = Device
        .query()
        .where('identifier', action.device)
        .first()

      if (device === null) {
        return
      }

      const channel = Channel
        .query()
        .where('deviceId', device.id)
        .where('channel', action.channel)
        .first()

      if (channel === null) {
        return
      }

      const thing = Thing
        .query()
        .with('device')
        .with('channel')
        .where('channelId', channel.id)
        .first()

      this.remove.show = true
      this.remove.item = action
      this.remove.thing = thing
    },

    /**
     * Close remove confirmation window
     */
    resetRemoveConfirmation() {
      this.remove.show = false
      this.remove.item = null
      this.remove.thing = null
    },

    /**
     * Remove action from trigger
     */
    removeAction() {
      if (this.trigger.actions.length > 1) {
        Action.dispatch('remove', {
          id: this.remove.item.id,
        })
          .catch((e) => {
            const errorMessage = this.$t('triggers.messages.actionNotRemoved')

            if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
              this.handleException(e.exception, errorMessage)
            } else {
              this.$flashMessage(errorMessage, 'error')
            }
          })
      } else {
        Trigger.dispatch('remove', {
          id: this.trigger.id,
        })
          .catch((e) => {
            const errorMessage = this.$t('things.messages.actionNotRemoved')

            if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
              this.handleException(e.exception, errorMessage)
            } else {
              this.$flashMessage(errorMessage, 'error')
            }
          })
      }

      this.resetRemoveConfirmation()
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
