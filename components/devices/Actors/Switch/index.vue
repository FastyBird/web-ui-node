<template>
  <div
    :data-state="state ? 'on' : 'off'"
    class="fb-devices-switch__container"
    role="button"
  >
    <fb-ui-switch-element
      v-if="command === null"
      :status="value"
      :disabled="!state"
      variant="primary"
      @change="toggleState"
    />

    <div
      v-show="command === true || command === false"
      class="fb-devices-switch__result"
    >
      <font-awesome-icon
        v-show="command === false"
        icon="ban"
        class="pos-r fb-devices-switch__result-err"
      />
      <font-awesome-icon
        v-show="command === true"
        icon="check"
        class="pos-r fb-devices-switch__result-ok"
      />
    </div>

    <div
      v-show="command !== null && command !== true && command !== false"
      class="fb-devices-switch__loading"
    >
      <fb-ui-spinner
        variant="primary"
        size="sm"
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
  DeviceInterface,
  DeviceStateType,
} from '~/models/devices-node/devices/types'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'
import { ChannelPropertyInterface } from '~/models/devices-node/channel-properties/types'

interface DevicesActorsSwitchPropsInterface {
  device: DeviceInterface,
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

    const state = computed<boolean>((): boolean => props.device.state === DeviceStateType.READY)

    // Get channel state property value
    const value = computed<boolean>((): boolean => {
      if (props.property.isBoolean) {
        return props.property.expected !== null ? !!props.property.expected : !!props.property.value
      } else if (props.property.isEnum) {
        return props.property.expected !== null ? props.property.expected === 'on' : props.property.value === 'on'
      }

      return false
    })

    // Processing timer
    let timer: number

    function resetCommand(): void {
      command.value = null

      window.clearInterval(timer)
    }

    // Toggle channel button state
    function toggleState(): void {
      // Check if some command on channel is in progress
      if (command.value !== null) {
        return
      }

      // Check if device is connected to server & ready
      if (props.device.state !== DeviceStateType.READY) {
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

          timer = window.setInterval(resetCommand, 500)
        })
        .catch((): void => {
          command.value = false

          context.root.$flashMessage(context.root.$t('devices.messages.commandNotAccepted', {
            device: props.device.title,
          }).toString(), 'error')

          timer = window.setInterval(resetCommand, 500)
        })
    }

    return {
      command,
      state,
      value,
      toggleState,
      resetCommand,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
