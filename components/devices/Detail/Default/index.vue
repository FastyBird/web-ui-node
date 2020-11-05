<template>
  <div class="fb-devices-detail-default__container">
    <template v-for="channel in channels">
      <fb-ui-items-container
        :key="channel.id"
        class="fb-devices-detail-default__channel"
      >
        <template slot="heading">
          {{ $t('devices.headings.channel', { channel: channel.title }) }}
        </template>

        <channel-container
          :device="device"
          :channel="channel"
        />

        <template
          v-if="channel.control.includes('reset') || channel.control.includes('configure')"
          slot="buttons"
        >
          <fb-ui-button
            v-if="channel.control.includes('configure')"
            variant="link"
            size="xs"
            @click.prevent="$emit('editChannel', device, channel)"
          >
            <font-awesome-icon icon="cog" />
            {{ $t('application.buttons.edit.title') }}
          </fb-ui-button>

          <fb-ui-button
            v-if="channel.control.includes('reset')"
            :disabled="!device.isReady"
            variant="link"
            size="xs"
            @click.prevent="showClearChannel(channel)"
          >
            <font-awesome-icon icon="sync-alt" />
            {{ $t('application.buttons.reset.title') }}
          </fb-ui-button>
        </template>
      </fb-ui-items-container>
    </template>

    <fb-ui-no-results v-if="channels.length === 0">
      <font-awesome-icon
        slot="icon"
        icon="cube"
      />

      <font-awesome-icon
        slot="second-icon"
        icon="plug"
      />

      {{ $t('devices.texts.noChannels') }}
    </fb-ui-no-results>

    <fb-ui-confirmation-window
      v-if="clearChannel !== null"
      :transparent-bg="$options.name !== 'Layout'"
      icon="trash"
      @confirmed="processClearChannel(clearChannel)"
      @close="closeClearChannel"
    >
      <template slot="header">
        {{ $t('devices.headings.resetChannel') }}
      </template>

      <template slot="question">
        <i18n
          path="devices.messages.confirmResetChannel"
          tag="p"
        >
          <strong slot="device">{{ device.title }}</strong>
          <strong slot="channel">{{ clearChannel.title }}</strong>
        </i18n>
      </template>
    </fb-ui-confirmation-window>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  ref,
  SetupContext,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import Channel from '~/models/devices-node/channels/Channel'
import { ChannelInterface } from '~/models/devices-node/channels/types'

import ChannelContainer from '~/components/devices/Detail/Default/ChannelContainer/index.vue'

interface DevicesDetailDefaultPropsInterface {
  device: DeviceInterface,
}

export default defineComponent({

  name: 'DevicesDetailDefault',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

  },

  components: {
    ChannelContainer,
  },

  setup(props: DevicesDetailDefaultPropsInterface, context: SetupContext) {
    const clearChannel = ref<ChannelInterface | null>(null)

    const channels = computed<Array<ChannelInterface>>((): Array<ChannelInterface> => {
      return Channel
        .query()
        .where('deviceId', props.device.id)
        .orderBy('title')
        .get()
    })

    // Check if channel set action is enabled
    function _clearingCheck(channel: ChannelInterface): boolean {
      if (channel.control.includes('reset')) {
        context.root.$flashMessage(context.root.$t('devices.messages.notSupported', {
          device: props.device.title,
        }).toString(), 'error')

        return false
      }

      // Check if device is connected to cloud
      if (!props.device.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
        }).toString(), 'error')

        return false
      }

      return true
    }

    // Show clear value confirmation window
    function showClearChannel(channel: ChannelInterface): void {
      if (!_clearingCheck(channel)) {
        return
      }

      clearChannel.value = channel
    }

    // Close clear value confirmation window
    function closeClearChannel(): void {
      clearChannel.value = null
    }

    // Process resetting of total consumption counter
    function processClearChannel(channel: ChannelInterface): void {
      clearChannel.value = null

      if (!_clearingCheck(channel)) {
        return
      }

      Channel.dispatch('transmitCommand', {
        channel,
        command: 'reset',
      })
        .catch((): void => {
          context.root.$flashMessage(context.root.$t('devices.messages.commandNotAccepted', {
            device: props.device.title,
          }).toString(), 'error')
        })
    }

    return {
      channels,
      clearChannel,
      showClearChannel,
      closeClearChannel,
      processClearChannel,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
