<template>
  <div class="fb-account-sign-in__container">
    <sign-header :heading="$t('account.headings.signIn')" />

    <ValidationObserver
      ref="validator"
      v-slot="{ handleSubmit }"
    >
      <form @submit.prevent="handleSubmit(submit)">
        <ValidationProvider
          v-slot="{ errors }"
          :name="$t('account.fields.identity.uid.title')"
          rules="required"
        >
          <fb-form-input
            v-model="form.model.uid"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :label="$t('account.fields.identity.uid.title')"
            :required="true"
            :tab-index="2"
            name="uid"
            mb="md"
          />
        </ValidationProvider>

        <ValidationProvider
          v-slot="{ errors }"
          :name="$t('account.fields.identity.password.title')"
          rules="required"
        >
          <fb-form-input
            v-model="form.model.password"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :label="$t('account.fields.identity.password.title')"
            :required="true"
            :tab-index="3"
            name="password"
            type="password"
            mb="md"
          />
        </ValidationProvider>

        <fb-form-checkbox
          v-model="form.model.persistent"
          :tab-index="4"
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
          block
          uppercase
          variant="primary"
          type="submit"
          tabindex="5"
        >
          {{ $t('account.buttons.signIn.title') }}
        </fb-ui-button>
      </form>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
} from '@vue/composition-api'

import get from 'lodash/get'
import {
  ValidationProvider,
  ValidationObserver,
  extend,
} from 'vee-validate'

import jwtDecode from 'jwt-decode'

const SignHeader = () => import('~/components/account/SignHeader/index.vue')

interface AccountSignInFormModelInterface {
  uid: string
  password: string
  persistent: boolean
}

interface AccountSignInFormInterface {
  model: AccountSignInFormModelInterface
}

export default defineComponent({

  name: 'AccountSignIn',

  components: {
    ValidationProvider,
    ValidationObserver,

    SignHeader,
  },

  setup(props, context) {
    const form = reactive<AccountSignInFormInterface>({
      model: {
        uid: '',
        password: '',
        persistent: true,
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
      message: context.root.$t('devices.fields.deviceName.validation.required').toString(),
    })

    // Submit form
    function submit(event?: MouseEvent): void {
      event && event.preventDefault()

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
      form,
      submit,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
