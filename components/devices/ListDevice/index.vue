<template>
  <list-item
    :variant="listItemTypes.LIST"
    @click="handleClick"
  >
    <devices-icon
      slot="icon"
      :device="device"
    />

    <template slot="heading">
      {{ device.title }}
    </template>

    <template
      slot="sub-heading"
      v-if="device.hasComment"
    >
      {{ device.comment }}
    </template>
  </list-item>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-node/devices/types'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

import DevicesIcon from '~/components/devices/Icon/index.vue'

export default defineComponent({

  name: 'DevicesListDevice',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

  },

  components: {
    DevicesIcon,
  },

  setup(props: {}, context: SetupContext) {
    function handleClick(): void {
      context.emit('click')
    }

    return {
      handleClick,
      listItemTypes: ListItemSizeTypes,
    }
  },

})
</script>
