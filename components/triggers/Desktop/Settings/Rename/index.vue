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
      {{ $t('triggers.headings.renameTrigger') }}
    </template>

    <triggers-settings-rename
      slot="form"
      :trigger="trigger"
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

import { TriggerInterface } from '~/models/triggers-node/triggers/types'

import TriggersSettingsRename from '~/components/triggers/Settings/Rename/index.vue'

interface TriggersSettingsTriggerRenamePropsInterface {
  trigger: TriggerInterface
}

export default defineComponent({

  name: 'TriggersDesktopSettingsRename',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

  },

  components: {
    TriggersSettingsRename,
  },

  setup(props: TriggersSettingsTriggerRenamePropsInterface, context: SetupContext) {
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
