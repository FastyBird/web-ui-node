<template>
  <div class="fb-password-request-page__container">
    <account-sign-header
      v-if="isSubmitted"
      :heading="$t('account.headings.instructionEmailed')"
    />
    <account-sign-header
      v-else
      :heading="$t('account.headings.passwordReset')"
    />

    <div
      v-if="makingRequest"
      class="fb-password-request-page__processing"
    >
      <fb-ui-spinner :size="sizeTypes.LARGE" />

      <strong>{{ $t('account.texts.processing') }}</strong>
    </div>

    <div v-if="!makingRequest">
      <p
        v-if="isSubmitted"
        class="fb-password-request-page__info"
      >
        <small>{{ $t('account.texts.resetPasswordInstructionsEmailed') }}</small>
      </p>

      <validation-observer
        ref="validator"
        v-if="!isSubmitted"
        v-slot="{ handleSubmit }"
      >
        <form @submit.prevent="handleSubmit(handleSubmit)">
          <validation-provider
            v-slot="{ errors }"
            name="uid"
            rules="required"
          >
            <fb-form-input
              v-model="form.model.uid"
              :error="errors[0]"
              :has-error="errors.length > 0"
              :label="$t('account.fields.identity.uid.title')"
              :required="true"
              name="uid"
            />
          </validation-provider>

          <fb-ui-button
            :variant="buttonVariantTypes.PRIMARY"
            block
            uppercase
          >
            {{ $t('account.buttons.resetPassword.title') }}
          </fb-ui-button>

          <p class="fb-password-request-page__info">
            <small>{{ $t('account.texts.resetPasswordInfo') }}</small>
          </p>
        </form>
      </validation-observer>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  SetupContext,
} from '@vue/composition-api'

import get from 'lodash/get'
import {
  ValidationProvider,
  ValidationObserver,
  extend,
  localize,
} from 'vee-validate'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import AccountSignHeader from '~/components/account/SignHeader/index.vue'

interface RequestPasswordPageFormInterface {
  model: {
    uid: string
  }
}

export default defineComponent({

  name: 'RequestPasswordPage',

  components: {
    ValidationProvider,
    ValidationObserver,

    AccountSignHeader,
  },

  middleware: 'anonymous',

  transition: 'fade',

  layout: 'sign',

  setup(props: {}, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive<RequestPasswordPageFormInterface>({
      model: {
        uid: '',
      },
    })

    const makingRequest = ref<boolean>(false)

    const isSubmitted = ref<boolean>(false)

    localize({
      en: {
        fields: {
          uid: {
            required: context.root.$t('account.fields.identity.uid.validation.required').toString(),
          },
          password: {
            required: context.root.$t('account.fields.identity.password.validation.required').toString(),
          },
        },
      },
    })

    extend('required', {
      validate: (value) => {
        return {
          required: true,
          valid: !['', null, undefined].includes(value),
        }
      },
      computesRequired: true,
    })

    // Submit form
    function handleSubmit(): void {
      context.root.$bus.$emit('wait-page_reloading', 10)

      const errorMessage = context.root.$t('account.messages.passwordRequestFail').toString()

      makingRequest.value = true

      context.root.$backendApi.requestPassword({
        uid: form.model.uid,
      })
        .then(() => {
          makingRequest.value = false
          isSubmitted.value = true
        })
        .catch((e) => {
          makingRequest.value = false

          if (get(e, 'exception', null) !== null) {
            context.root.handleException(e.exception, errorMessage)
          } else if (get(e, 'response', null) !== null) {
            context.root.handleRequestError(e.response, errorMessage)
          } else {
            context.root.$flashMessage(errorMessage, 'error')
          }

          isSubmitted.value = false
        })
    }

    return {
      validator,
      form,
      makingRequest,
      isSubmitted,
      handleSubmit,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>
