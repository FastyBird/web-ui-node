<template>
  <fb-ui-modal-form
    :transparent-bg="false"
    :lock-submit-button="remoteFormResult !== formResultTypes.NONE"
    :state="remoteFormResult"
    :variant="modalVariant"
    @submit="handleSubmitForm"
    @cancel="handleClose"
    @close="handleClose"
  >
    <fb-ui-modal-header-icon slot="icon">
      <font-awesome-icon icon="pencil-alt" />
    </fb-ui-modal-header-icon>

    <template slot="header">
      {{ $t('devices.headings.renameChannel') }}
    </template>

    <devices-settings-channel-rename
      slot="form"
      :device="device"
      :channel="channel"
      :remote-form-submit.sync="remoteFormSubmit"
      :remote-form-result.sync="remoteFormResult"
    />
  </fb-ui-modal-form>
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
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

interface DevicesSettingsDeviceRenamePropsInterface {
  device: DeviceInterface
}

export default defineComponent({

  name: 'DevicesDesktopSettingsChannelRename',

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

  setup(props: DevicesSettingsDeviceRenamePropsInterface, context: SetupContext) {
    const remoteFormSubmit = ref<boolean>(false)
    const remoteFormResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const isMounted = ref<boolean>(false)

    let timer: number

    function handleClose(): void {
      context.emit('close')
    }

    function handleSubmitForm(): void {
      remoteFormSubmit.value = true
    }

    onMounted((): void => {
      isMounted.value = true
    })

    onBeforeUnmount((): void => {
      window.clearTimeout(timer)
    })

    watch(
      (): FbFormResultTypes => remoteFormResult.value,
      (val): void => {
        if (val === FbFormResultTypes.OK && isMounted.value) {
          timer = window.setTimeout(handleClose, 1000)
        }
      },
    )

    return {
      remoteFormSubmit,
      remoteFormResult,
      handleClose,
      handleSubmitForm,
      formResultTypes: FbFormResultTypes,
      modalVariant: !context.root.$windowSize.isExtraLarge() ? FbUiModalVariantTypes.TABLET : FbUiModalVariantTypes.DEFAULT,
    }
  },

})
</script>
