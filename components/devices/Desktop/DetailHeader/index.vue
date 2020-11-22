<template>
  <desktop-detail-heading class="fb-devices-desktop-detail-header__container">
    <h2 slot="heading">
      {{ device.name }}
    </h2>

    <small
      slot="sub-heading"
      v-if="device.hasComment"
    >
      {{ device.comment }}
    </small>

    <font-awesome-icon
      slot="icon"
      :icon="device.icon"
    />

    <template slot="buttons">
      <slot name="buttons" />
    </template>
  </desktop-detail-heading>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-node/devices/types'

export default defineComponent({

  name: 'DevicesDesktopDetailHeader',

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

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
