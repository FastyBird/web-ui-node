<template>
  <settings-list-item
    v-if="parameter.isBoolean"
    data-style="single-row"
  >
    <fb-ui-switch-element
      slot="suffix"
      :ref="parameter.name"
      :status="parameter.value"
      :disabled="!device.isReady"
      variant="primary"
      @change="$emit('submit')"
    />
    {{ parameter.title }}
  </settings-list-item>

  <settings-list-item
    v-else
    type="button"
    data-style="multi-row"
    @click="$emit('openForm')"
  >
    <fb-ui-spinner
      v-if="loading"
      slot="prefix"
      size="sm"
    />
    <font-awesome-icon
      slot="suffix"
      icon="angle-right"
    />

    {{ parameter.title }}
    <small>
      {{ $t('application.states.actual') }}:
      <strong>{{ parameter.formattedValue }}</strong>
    </small>
  </settings-list-item>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import { DeviceConfigurationInterface } from '~/models/devices-node/device-configuration/types'

export default defineComponent({

  name: 'DevicesSettingsDeviceParameter',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    parameter: {
      type: Object as PropType<DeviceConfigurationInterface>,
      required: true,
    },

    loading: {
      type: Boolean,
      default: false,
    },

  },

})
</script>
