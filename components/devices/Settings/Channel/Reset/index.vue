<template>
  <fb-ui-confirmation-window
    :transparent-bg="transparentBg"
    @confirmed="handleReset"
    @close="handleClose"
  >
    <font-awesome-icon
      slot="icon"
      icon="trash"
      class="fb-devices-settings-channel-reset__icon"
    />

    <template slot="header">
      {{ $t('devices.headings.resetChannel') }}
    </template>

    <template slot="question">
      <i18n
        path="devices.messages.confirmResetChannel"
        tag="p"
      >
        <strong slot="device">{{ device.title }}</strong>
        <strong slot="channel">{{ channel.title }}</strong>
      </i18n>
    </template>
  </fb-ui-confirmation-window>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import {
  ChannelInterface,
  CommandRoutingKeys,
} from '~/models/devices-node/channels/types'
import Channel from '~/models/devices-node/channels/Channel'

interface DevicesSettingsChannelResetPropsInterface {
  device: DeviceInterface
  channel: ChannelInterface
  transparentBg: boolean
}

export default defineComponent({

  name: 'DevicesSettingsChannelReset',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    channel: {
      type: Object as PropType<ChannelInterface>,
      required: true,
    },

    transparentBg: {
      type: Boolean,
      default: false,
    },

  },

  setup(props: DevicesSettingsChannelResetPropsInterface, context: SetupContext) {
    function handleReset(event?: MouseEvent): void {
      event && event.preventDefault()

      if (props.channel.control.includes('reset')) {
        context.root.$flashMessage(context.root.$t('devices.messages.notSupported', {
          device: props.device.title,
        }).toString(), 'error')

        return
      }

      if (!props.device.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
        }).toString(), 'error')

        return
      }

      Channel.dispatch('transmitCommand', {
        channel: props.channel,
        command: CommandRoutingKeys.RESET,
      })
        .catch((): void => {
          context.root.$flashMessage(context.root.$t('devices.messages.commandNotAccepted', {
            device: props.device.title,
          }).toString(), 'error')
        })

      context.emit('reseted')
    }

    function handleClose(): void {
      context.emit('close')
    }

    return {
      handleReset,
      handleClose,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
