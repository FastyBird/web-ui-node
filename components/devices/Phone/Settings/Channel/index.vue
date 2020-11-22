<template>
  <fb-ui-modal-window
    :variant="modalVariantTypes.PHONE"
    :ok-btn-text="$t('application.buttons.done.title')"
    :close-btn-text="$t('application.buttons.cancel.title')"
    @submit="handleSubmitForm"
    @close="handleClose"
  >
    <template slot="modal-title">
      {{ $t('devices.headings.channelSettings') }}
    </template>

    <template slot="modal-body">
      <devices-settings-channel-rename
        :device="device"
        :channel="channel"
        :remote-form-submit.sync="remoteFormSubmit"
        :remote-form-result.sync="remoteFormResult"
        :remote-form-reset.sync="remoteFormReset"
      />
    </template>
  </fb-ui-modal-window>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  PropType,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import {
  FbFormResultTypes,
  FbUiModalVariantTypes,
} from '@fastybird/web-ui-theme'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import { ChannelInterface } from '~/models/devices-node/channels/types'

import DevicesSettingsChannelRename from '~/components/devices/Settings/Channel/Rename/index.vue'

interface DevicesPhoneSettingsChannelPropsInterface {
  device: DeviceInterface
  channel: ChannelInterface
}

export default defineComponent({

  name: 'DevicesPhoneSettingsChannel',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    channel: {
      type: Object as PropType<ChannelInterface>,
      required: true,
    },

  },

  components: {
    DevicesSettingsChannelRename,
  },

  setup(_props: DevicesPhoneSettingsChannelPropsInterface, context: SetupContext) {
    const remoteFormSubmit = ref<boolean>(false)

    const remoteFormResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const remoteFormReset = ref<boolean>(false)

    const isMounted = ref<boolean>(false)

    function handleClose(): void {
      context.emit('close')
    }

    function handleSubmitForm(): void {
      remoteFormSubmit.value = true
    }

    onMounted((): void => {
      isMounted.value = true
    })

    watch(
      (): FbFormResultTypes => remoteFormResult.value,
      (val): void => {
        if (val === FbFormResultTypes.WORKING && isMounted.value) {
          handleClose()
        }
      },
    )

    return {
      remoteFormSubmit,
      remoteFormResult,
      remoteFormReset,
      handleSubmitForm,
      handleClose,
      modalVariantTypes: FbUiModalVariantTypes,
    }
  },

})
</script>
