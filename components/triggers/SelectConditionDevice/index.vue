<template>
  <div class="fb-triggers-select-device__container">
    <template v-for="channel in device.channels">
      <fb-ui-items-container :key="channel.id">
        <template slot="heading">
          {{ channel.title }}
        </template>

        <template v-for="property in channel.properties">
          <triggers-select-condition-device-property
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

import { ConditionOperatorType } from '~/models/triggers-node/types'

import { DeviceInterface } from '~/models/devices-node/devices/types'

import TriggersSelectConditionDeviceProperty from '~/components/triggers/SelectConditionDevice/Property/index.vue'

interface TriggersSelectDeviceInterface {
  value: Array<{ selected: boolean, operator: ConditionOperatorType, operand: string | boolean | null }>
  device: DeviceInterface
}

export default defineComponent({

  name: 'TriggersSelectConditionDevice',

  props: {

    value: {
      type: Object as PropType<Array<{ selected: boolean, operator: ConditionOperatorType, operand: string | boolean | null }>>,
      required: true,
    },

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

  },

  components: {
    TriggersSelectConditionDeviceProperty,
  },

})
</script>
