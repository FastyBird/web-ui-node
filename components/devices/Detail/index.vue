<template>
  <devices-detail-default
    :device="device"
    :edit-mode="editMode"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-node/devices/types'

import DevicesDetailDefault from '~/components/devices/Detail/Default/index.vue'

export default defineComponent({

  name: 'DevicesDetail',

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
    DevicesDetailDefault,
  },

})
</script>
