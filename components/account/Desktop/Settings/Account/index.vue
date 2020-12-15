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
      <font-awesome-icon icon="user" />
    </fb-ui-modal-header-icon>

    <template slot="header">
      {{ $t('account.headings.accountSettings') }}
    </template>

    <account-settings-account
      slot="form"
      :account="account"
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

import { AccountInterface } from '~/models/auth-module/accounts/types'

import AccountSettingsAccount from '~/components/account/Settings/Account/index.vue'

interface AccountDesktopSettingsAccountPropsInterface {
  account: AccountInterface
}

export default defineComponent({

  name: 'AccountDesktopSettingsAccount',

  props: {

    account: {
      type: Object as PropType<AccountInterface>,
      required: true,
    },

  },

  components: {
    AccountSettingsAccount,
  },

  setup(props: AccountDesktopSettingsAccountPropsInterface, context: SetupContext) {
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
