<template>
  <div class="fb-sign-in-page__container">
    <account-sign-header :heading="$t('account.headings.signIn')" />

    <validation-observer
      ref="validator"
      v-slot="{ handleSubmit }"
    >
      <form @submit.prevent="handleSubmit(handleSubmitForm)">
        <fb-ui-content :mb="sizeTypes.MEDIUM">
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
        </fb-ui-content>

        <validation-provider
          v-slot="{ errors }"
          name="password"
          rules="required"
        >
          <fb-form-input
            v-model="form.model.password"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :label="$t('account.fields.identity.password.title')"
            :required="true"
            :type="formInputTypes.PASSWORD"
            name="password"
          />
        </validation-provider>

        <fb-form-checkbox
          v-model="form.model.persistent"
          name="persistent"
        >
          {{ $t('account.fields.persistent.title') }}
          <template slot="right-addon">
            <span aria-hidden="true"> · </span>
            <nuxt-link :to="localePath({ name: $routes.account.resetPassword })">
              {{ $t('account.buttons.forgotPassword.title') }}
            </nuxt-link>
          </template>
        </fb-form-checkbox>

        <fb-ui-button
          :variant="buttonVariantTypes.PRIMARY"
          block
          uppercase
          type="submit"
        >
          {{ $t('account.buttons.signIn.title') }}
        </fb-ui-button>
      </form>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
} from '@vue/composition-api'

import get from 'lodash/get'
import {
  ValidationProvider,
  ValidationObserver,
  extend,
  localize,
} from 'vee-validate'

import {
  FbFormInputTypeTypes,
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

// @ts-ignore
import jwtDecode from 'jwt-decode'

import AccountSignHeader from '~/components/account/SignHeader/index.vue'

interface SignInPageFormInterface {
  model: {
    uid: string
    password: string
    persistent: boolean
  }
}

export default defineComponent({

  name: 'SignInPage',

  components: {
    ValidationProvider,
    ValidationObserver,

    AccountSignHeader,
  },

  middleware: 'anonymous',

  transition: 'fade',

  setup(props, context) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive<SignInPageFormInterface>({
      model: {
        uid: '',
        password: '',
        persistent: true,
      },
    })

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
    function handleSubmitForm(): void {
      context.root.$bus.$emit('wait-page_reloading', 10)

      const errorMessage = context.root.$t('application.messages.requestError').toString()

      context.root.$backendApi.createSession({
        uid: form.model.uid,
        password: form.model.password,
      })
        .then(() => {
          const accessToken = context.root.$store.getters['session/getAccessToken']()
          const refreshToken = context.root.$store.getters['session/getRefreshToken']()

          if (accessToken === null || refreshToken === null) {
            throw new Error('Session could not be created')
          }

          const decodedAccessToken = jwtDecode(accessToken)

          context.root.$cookies.set('token', accessToken, {
            path: '/',
            maxAge: (((new Date(decodedAccessToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
          })

          const decodedRefreshToken = jwtDecode(refreshToken)

          context.root.$cookies.set('refresh_token', refreshToken, {
            path: '/',
            maxAge: (((new Date(decodedRefreshToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
          })

          context.root.$bus.$emit('user_signed-in')
        })
        .catch((e) => {
          context.root.$bus.$emit('wait-page_reloading', false)

          if (get(e, 'exception', null) !== null) {
            context.root.handleException(e.exception, errorMessage)
          } else if (get(e, 'response', null) !== null) {
            context.root.handleRequestError(e.response, errorMessage)
          } else {
            context.root.$flashMessage(errorMessage, 'error')
          }
        })
    }

    return {
      validator,
      form,
      handleSubmitForm,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
      formInputTypes: FbFormInputTypeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'in';
</style>
