<template>
  <div class="fb-devices-connect-select-protocol__container">
    <div class="fb-devices-connect-select-protocol__row">
      <div
        v-for="(item, index) in protocols"
        :key="index"
        class="fb-devices-connect-select-protocol__row-item"
      >
        <fb-ui-button
          :variant="item.value === protocol ? buttonVariantTypes.PRIMARY : buttonVariantTypes.OUTLINE_DEFAULT"
          :disabled="!item.enabled"
          :size="sizeTypes.LARGE"
          @click.prevent="handleSelectProtocol(item.value)"
          block
          name="mqtt"
        >
          {{ item.name }}
        </fb-ui-button>
      </div>
    </div>

    <hr>

    <fb-ui-alert
      v-if="protocol === protocolsTypes.MQTT"
      :variant="alertVariantTypes.INFO"
    >
      <h4>MQTT protocol</h4>

      <p>
        Is an open OASIS and ISO standard lightweight, publish-subscribe network protocol that transports
        messages between devices.
      </p>

      <hr>

      <p>
        Your new device must use our MQTT API to be able to communicate with the server. Check details in our
        documentation.
      </p>
    </fb-ui-alert>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  SetupContext,
} from '@vue/composition-api'

import {
  FbSizeTypes,
  FbUiAlertVariantTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import { ProtocolTypes } from '~/components/devices/Connect/connect'

interface DevicesConnectSelectProtocolProtocolsInterface {
  name: string
  value: ProtocolTypes
  enabled: boolean
}

interface DevicesConnectSelectProtocolPropsInterface {
  protocol: ProtocolTypes
}

export default defineComponent({

  name: 'DevicesConnectCommunicationProtocol',

  props: {

    protocol: {
      type: String as PropType<ProtocolTypes>,
      required: true,
    },

  },

  setup(props: DevicesConnectSelectProtocolPropsInterface, context: SetupContext) {
    const protocols = reactive<Array<DevicesConnectSelectProtocolProtocolsInterface>>([
      {
        name: context.root.$t('devices.buttons.addTypeMqtt.title').toString(),
        value: ProtocolTypes.MQTT,
        enabled: true,
      },
      {
        name: context.root.$t('devices.buttons.addTypeUdp.title').toString(),
        value: ProtocolTypes.UDP,
        enabled: false,
      },
      {
        name: context.root.$t('devices.buttons.addTypeSigfox.title').toString(),
        value: ProtocolTypes.SIGFOX,
        enabled: false,
      },
      {
        name: context.root.$t('devices.buttons.addTypeLora.title').toString(),
        value: ProtocolTypes.LORA,
        enabled: false,
      },
    ])

    function handleSelectProtocol(selected: ProtocolTypes): void {
      context.emit('update:protocol', selected)
    }

    return {
      protocols,
      handleSelectProtocol,
      protocolsTypes: ProtocolTypes,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
      alertVariantTypes: FbUiAlertVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
