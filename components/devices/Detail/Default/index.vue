<template>
  <div class="fb-devices-detail-default__container">
    <scroll-shadow>
      <devices-detail-default-channel-container
        v-for="channel in channels"
        :key="channel.id"
        :device="device"
        :channel="channel"
        :edit-mode="editMode"
      />
    </scroll-shadow>

    <no-results
      v-if="channels.length === 0"
      icon="cube"
    >
      {{ $t('devices.texts.noChannels') }}
    </no-results>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-module/devices/types'
import Channel from '~/models/devices-module/channels/Channel'
import { ChannelInterface } from '~/models/devices-module/channels/types'

import DevicesDetailDefaultChannelContainer from '~/components/devices/Detail/Default/ChannelContainer/index.vue'

interface DevicesDetailDefaultPropsInterface {
  device: DeviceInterface
  editMode: boolean
}

export default defineComponent({

  name: 'DevicesDetailDefault',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    editMode: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    DevicesDetailDefaultChannelContainer,
  },

  setup(props: DevicesDetailDefaultPropsInterface) {
    const channels = computed<Array<ChannelInterface>>((): Array<ChannelInterface> => {
      return Channel
        .query()
        .where('deviceId', props.device.id)
        .orderBy('title')
        .get()
    })

    return {
      channels,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
