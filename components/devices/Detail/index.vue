<template>
  <device-detail-default
    :device="device"
    @editChannel="openChannelSettings"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import { ChannelInterface } from '~/models/devices-node/channels/types'

import DeviceDetailDefault from '~/components/devices/Detail/Default/index.vue'

interface DevicesDetailPropsInterface {
  device: DeviceInterface
}

export default defineComponent({

  name: 'DevicesDetail',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

  },

  components: {
    DeviceDetailDefault,
  },

  setup(props: DevicesDetailPropsInterface, context: SetupContext) {
    function openChannelSettings(device: DeviceInterface, channel: ChannelInterface) {
      context.emit('editChannel', device, channel)
    }

    return {
      openChannelSettings,
    }
  },

})
</script>
