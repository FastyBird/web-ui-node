<template>
  <fb-ui-confirmation-window
    :transparent-bg="transparentBg"
    @confirmed="handleRemove"
    @close="handleClose"
  >
    <font-awesome-icon
      slot="icon"
      icon="trash"
      class="fb-devices-settings-device-remove__icon"
    />

    <template slot="header">
      {{ $t('devices.headings.removeDevice') }}
    </template>

    <template slot="question">
      <i18n
        path="devices.messages.confirmRemoveDevice"
        tag="p"
      >
        <strong slot="device">{{ device.title }}</strong>
      </i18n>
    </template>
  </fb-ui-confirmation-window>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import get from 'lodash/get'

import Device from '~/models/devices-module/devices/Device'
import { DeviceInterface } from '~/models/devices-module/devices/types'

interface DevicesSettingsDeviceRemovePropsInterface {
  device: DeviceInterface
  transparentBg: boolean
}

export default defineComponent({

  name: 'DevicesSettingsDeviceRemove',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    transparentBg: {
      type: Boolean,
      default: false,
    },

  },

  setup(props: DevicesSettingsDeviceRemovePropsInterface, context: SetupContext) {
    function handleRemove(event?: MouseEvent): void {
      event && event.preventDefault()

      const errorMessage = context.root.$t('devices.messages.deviceNotRemoved', {
        device: props.device.title,
      }).toString()

      Device.dispatch('remove', {
        device: props.device,
      })
        .catch((e): void => {
          if (get(e, 'exception', null) !== null) {
            context.root.handleException(e.exception, errorMessage)
          } else {
            context.root.$flashMessage(errorMessage, 'error')
          }
        })

      context.emit('removed')
    }

    function handleClose(): void {
      context.emit('close')
    }

    return {
      handleRemove,
      handleClose,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
