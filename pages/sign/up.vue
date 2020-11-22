<template>
  <div class="fb-sign-up-page__container">
    <account-sign-header :heading="$t('account.headings.signUp')" />

    <p class="fb-sign-up-page__heading">
      <em>Get started with a free account. 30 day free trial, unlimited devices, no credit card required.</em>
    </p>

    <validation-observer
      ref="validator"
      v-slot="{ handleSubmit }"
    >
      <form @submit.prevent="handleSubmit(handleSubmit)">
        <div class="fb-sign-up-page__name">
          <div class="fb-sign-up-page__name-field">
            <validation-provider
              v-slot="{ errors }"
              name="firstName"
              rules="required"
            >
              <fb-form-input
                v-model="form.model.firstName"
                :error="errors[0]"
                :has-error="errors.length > 0"
                :label="$t('account.fields.firstName.title')"
                :required="true"
                name="firstName"
              >
                <template slot="help-line">
                  {{ $t('account.fields.firstName.help') }}
                </template>
              </fb-form-input>
            </validation-provider>
          </div>

          <div class="fb-sign-up-page__name-field">
            <validation-provider
              v-slot="{ errors }"
              name="lastName"
              rules="required"
            >
              <fb-form-input
                v-model="form.model.lastName"
                :error="errors[0]"
                :has-error="errors.length > 0"
                :label="$t('account.fields.lastName.title')"
                :required="true"
                name="lastName"
              >
                <template slot="help-line">
                  {{ $t('account.fields.lastName.help') }}
                </template>
              </fb-form-input>
            </validation-provider>
          </div>
        </div>

        <validation-provider
          v-slot="{ errors }"
          name="emailAddress"
          rules="required|email"
        >
          <fb-form-input
            v-model="form.model.emailAddress"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :label="$t('account.fields.emailAddress.title')"
            :required="true"
            name="emailAddress"
          >
            <template slot="help-line">
              {{ $t('account.fields.emailAddress.help') }}
            </template>
          </fb-form-input>
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          name="password"
          rules="required"
        >
          <fb-form-input
            v-model="form.model.password"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :label="$t('account.fields.password.title')"
            :required="true"
            :type="formInputTypes.PASSWORD"
            name="password"
          >
            <template slot="help-line">
              {{ $t('account.fields.password.help') }}
            </template>
          </fb-form-input>
        </validation-provider>

        <fb-ui-button
          :variant="buttonVariantTypes.PRIMARY"
          block
          uppercase
        >
          {{ $t('account.buttons.signUp.title') }}
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
// @ts-ignore
import { email } from 'vee-validate/dist/rules.umd'

import {
  FbFormInputTypeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import AccountSignHeader from '~/components/account/SignHeader/index.vue'

interface SignUpPageFormInterface {
  model: {
    emailAddress: string
    firstName: string
    lastName: string
    password: string
  }
}

export default defineComponent({

  name: 'SignUpPage',

  components: {
    ValidationProvider,
    ValidationObserver,

    AccountSignHeader,
  },

  middleware: 'anonymous',

  transition: 'fade',

  setup(props, context) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive<SignUpPageFormInterface>({
      model: {
        emailAddress: '',
        firstName: '',
        lastName: '',
        password: '',
      },
    })

    localize({
      en: {
        fields: {
          emailAddress: {
            required: context.root.$t('account.fields.emailAddress.validation.required').toString(),
          },
          firstName: {
            required: context.root.$t('account.fields.firstName.validation.required').toString(),
          },
          lastName: {
            required: context.root.$t('account.fields.lastName.validation.required').toString(),
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

    extend('email', email)

    // Submit form
    function handleSubmit(): void {
      context.root.$bus.$emit('wait-page_reloading', 10)

      const errorMessage = context.root.$t('application.messages.requestError').toString()

      context.root.$backendApi.register({
        emailAddress: form.model.emailAddress,
        firstName: form.model.firstName,
        lastName: form.model.lastName,
        password: form.model.password,
      })
        .then(() => {
          // TODO: implement registration
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
      handleSubmit,
      buttonVariantTypes: FbUiButtonVariantTypes,
      formInputTypes: FbFormInputTypeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'up';
</style>
