<template>
  <div
    :data-device-state="state ? 'on' : 'off'"
    class="fb-devices-switch__container"
    role="button"
  >
    <fb-ui-switch-element
      v-if="command === null"
      :status="value"
      :disabled="!state"
      :variant="switchVariantTypes.PRIMARY"
      @change="handleToggleState"
    />

    <div
      v-show="command === true || command === false"
      class="fb-devices-switch__result"
    >
      <font-awesome-icon
        v-show="command === false"
        icon="ban"
        class="fb-devices-switch__result-err"
      />
      <font-awesome-icon
        v-show="command === true"
        icon="check"
        class="fb-devices-switch__result-ok"
      />
    </div>

    <div
      v-show="command !== null && command !== true && command !== false"
      class="fb-devices-switch__loading"
    >
      <fb-ui-spinner
        :variant="spinnerVariantTypes.PRIMARY"
        :size="sizeTypes.SMALL"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  SetupContext,
} from '@vue/composition-api'

import {
  FbSizeTypes,
  FbUiSpinnerVariantTypes,
  FbUiSwitchElementVariantTypes,
} from '@fastybird/web-ui-theme'

import {
  DeviceInterface,
  DeviceStateTypes,
} from '~/models/devices-node/devices/types'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'
import { ChannelPropertyInterface } from '~/models/devices-node/channel-properties/types'

interface DevicesActorsSwitchPropsInterface {
  device: DeviceInterface
  property: ChannelPropertyInterface
}

export default defineComponent({

  name: 'DevicesActorsSwitch',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    property: {
      type: Object as PropType<ChannelPropertyInterface>,
      required: true,
    },

  },

  setup(props: DevicesActorsSwitchPropsInterface, context: SetupContext) {
    const command = ref<boolean | string | null>(null)

    const state = computed<boolean>((): boolean => props.device.state === DeviceStateTypes.READY)

    const value = computed<boolean>((): boolean => {
      if (props.property.isBoolean) {
        return props.property.expected !== null ? !!props.property.expected : !!props.property.value
      } else if (props.property.isEnum) {
        return props.property.expected !== null ? props.property.expected === 'on' : props.property.value === 'on'
      }

      return false
    })

    let timer: number

    function resetCommand(): void {
      command.value = null

      window.clearTimeout(timer)
    }

    function handleToggleState(): void {
      if (command.value !== null) {
        return
      }

      if (props.device.state !== DeviceStateTypes.READY) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
        }).toString(), 'error')

        return
      }

      let actualValue = false

      if (props.property.isBoolean) {
        actualValue = !!props.property.value
      } else if (props.property.isEnum) {
        actualValue = props.property.value === 'on'
      }

      let newValue: boolean | string | null = null

      if (props.property.isBoolean) {
        newValue = !actualValue
      } else if (props.property.isEnum) {
        newValue = actualValue ? 'off' : 'on'
      }

      command.value = 'working'

      ChannelProperty.dispatch('transmitData', {
        property: props.property,
        value: `${newValue}`,
      })
        .then((): void => {
          command.value = true

          timer = window.setTimeout(resetCommand, 500)
        })
        .catch((): void => {
          command.value = false

          context.root.$flashMessage(context.root.$t('devices.messages.commandNotAccepted', {
            device: props.device.title,
          }).toString(), 'error')

          timer = window.setTimeout(resetCommand, 500)
        })
    }

    return {
      command,
      state,
      value,
      handleToggleState,
      switchVariantTypes: FbUiSwitchElementVariantTypes,
      spinnerVariantTypes: FbUiSpinnerVariantTypes,
      sizeTypes: FbSizeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
