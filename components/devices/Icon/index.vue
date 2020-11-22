<template>
  <div
    :data-device-state="device.state"
    class="fb-devices-icon__container"
  >
    <fb-ui-icon-with-child>
      <font-awesome-icon
        slot="icon"
        :icon="device.icon"
      />
      <font-awesome-icon
        slot="child-icon"
        icon="check-circle"
      />
    </fb-ui-icon-with-child>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api'

import {
  DeviceInterface,
} from '~/models/devices-node/devices/types'

export default defineComponent({

  name: 'DevicesIcon',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
