<template>
  <div class="fb-devices-connect-select-protocol__container">
    <div class="fb-devices-connect-select-protocol__row">
      <div
        v-for="(item, index) in protocols"
        :key="index"
        class="fb-devices-connect-select-protocol__row-item"
      >
        <fb-ui-button
          block
          :variant="item.value === protocol ? 'primary' : 'outline-primary'"
          name="mqtt"
          size="lg"
          :disabled="!item.enabled"
          @click.prevent="selectProtocol(item.value)"
        >
          {{ item.name }}
        </fb-ui-button>
      </div>
    </div>

    <hr>

    <fb-ui-alert
      v-if="protocol === protocolsTypes.MQTT"
      variant="info"
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

export enum ProtocolType {
  MQTT = 'mqtt',
  UDP = 'udp',
  SIGFOX = 'sigfox',
  LORA = 'lora',
}

interface DevicesConnectSelectProtocolProtocolsInterface {
  name: string
  value: ProtocolType
  enabled: boolean
}

interface DevicesConnectSelectProtocolPropsInterface {
  protocol: ProtocolType
}

export default defineComponent({

  name: 'DevicesConnectSelectProtocol',

  props: {

    protocol: {
      type: String as PropType<ProtocolType>,
      required: true,
    },

  },

  setup(props: DevicesConnectSelectProtocolPropsInterface, context: SetupContext) {
    const protocols = reactive<Array<DevicesConnectSelectProtocolProtocolsInterface>>([
      {
        name: context.root.$t('devices.buttons.addTypeMqtt.title').toString(),
        value: ProtocolType.MQTT,
        enabled: true,
      },
      {
        name: context.root.$t('devices.buttons.addTypeUdp.title').toString(),
        value: ProtocolType.UDP,
        enabled: false,
      },
      {
        name: context.root.$t('devices.buttons.addTypeSigfox.title').toString(),
        value: ProtocolType.SIGFOX,
        enabled: false,
      },
      {
        name: context.root.$t('devices.buttons.addTypeLora.title').toString(),
        value: ProtocolType.LORA,
        enabled: false,
      },
    ])

    function selectProtocol(selected: ProtocolType): void {
      context.emit('update:protocol', selected)
    }

    return {
      protocols,
      selectProtocol,
      protocolsTypes: ProtocolType,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
