<template>
  <div class="fb-triggers-select-action-device__container">
    <template v-for="channel in device.channels">
      <fb-ui-items-container :key="channel.id">
        <template slot="heading">
          {{ channel.title }}
        </template>

        <template v-for="property in channel.properties">
          <triggers-select-action-device-property
            v-if="_.get(value, property.id, null) !== null"
            :key="property.id"
            v-model="value[property.id]"
            :property="property"
          />
        </template>
      </fb-ui-items-container>
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-module/devices/types'

import TriggersSelectActionDeviceProperty from '~/components/triggers/SelectActionDevice/Property/index.vue'

export default defineComponent({

  name: 'TriggersSelectActionDevice',

  props: {

    value: {
      type: Object as PropType<Array<{ selected: boolean, operation: string | boolean | null }>>,
      required: true,
    },

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

  },

  components: {
    TriggersSelectActionDeviceProperty,
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
