<template>
  <list-item
    :variant="listItemTypes.DEFAULT"
    :data-style="parameter.isBoolean ? 'single-row' : 'multi-row'"
    @click="handleClick"
  >
    <fb-ui-switch-element
      slot="detail"
      ref="switchReference"
      v-if="parameter.isBoolean"
      :status="parameter.value"
      :disabled="!device.isReady"
      :variant="switchVariantTypes.PRIMARY"
      @change="handleToggle"
    />

    <template slot="heading">
      {{ parameter.title }}
    </template>

    <template
      slot="sub-heading"
      v-if="!parameter.isBoolean"
    >
      {{ $t('application.states.actual') }}:
      <strong>{{ parameter.formattedValue }}</strong>
    </template>
  </list-item>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import {
  FbUiSwitchElement,
  FbUiSwitchElementVariantTypes,
} from '@fastybird/web-ui-theme'

import { DeviceInterface } from '~/models/devices-module/devices/types'
import { ChannelInterface } from '~/models/devices-module/channels/types'
import ChannelConfiguration from '~/models/devices-module/channel-configuration/ChannelConfiguration'
import { ChannelConfigurationInterface } from '~/models/devices-module/channel-configuration/types'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

interface DevicesSettingsChannelParameterPropsInterface {
  device: DeviceInterface
  channel: ChannelInterface
  parameter: ChannelConfigurationInterface
  switchReference: InstanceType<typeof FbUiSwitchElement>
}

export default defineComponent({

  name: 'DevicesSettingsChannelParameter',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    channel: {
      type: Object as PropType<ChannelInterface>,
      required: true,
    },

    parameter: {
      type: Object as PropType<ChannelConfigurationInterface>,
      required: true,
    },

    switchReference: {
      type: Object as PropType<InstanceType<typeof FbUiSwitchElement>>,
      default: null,
    },

  },

  setup(props: DevicesSettingsChannelParameterPropsInterface, context: SetupContext) {
    async function handleToggle(): Promise<void> {
      if (props.device.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
        }).toString(), 'error')

        return
      }

      await ChannelConfiguration.dispatch('edit', {
        channel: props.channel,
        parameter: props.parameter,
        value: !props.parameter.value,
      })
    }

    function handleClick(): void {
      if (props.parameter.isBoolean) {
        context.emit('edit')
      }
    }

    return {
      handleToggle,
      handleClick,
      listItemTypes: ListItemSizeTypes,
      switchVariantTypes: FbUiSwitchElementVariantTypes,
    }
  },

})
</script>
