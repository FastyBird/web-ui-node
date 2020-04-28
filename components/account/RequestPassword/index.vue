<template>
  <div class="fb-account-reset-password__container">
    <sign-header
      v-if="!isSubmitted"
      :heading="$t('account.headings.passwordReset')"
    />
    <sign-header
      v-if="isSubmitted"
      :heading="$t('account.headings.instructionEmailed')"
    />

    <div
      v-if="makingRequest"
      class="fb-account-reset-password__processing"
    >
      <fb-spinner size="lg" />
      <strong>{{ $t('account.texts.processing') }}</strong>
    </div>

    <div v-if="!makingRequest">
      <p
        v-if="isSubmitted"
        class="fb-account-reset-password__info"
      >
        <small>{{ $t('account.texts.resetPasswordInstructionsEmailed') }}</small>
      </p>

      <form
        v-if="!isSubmitted"
        @submit.prevent="submit"
      >
        <fb-form-input
          v-model="form.model.credentials.uid"
          v-validate="'required|checkUid'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.uid')"
          :has-error="errors.has(form.scope + '.uid')"
          :name="'uid'"
          :label="$t('account.fields.identity.uid.title')"
          :required="true"
          data-vv-validate-on="blur"
        />

        <fb-button
          block
          uppercase
          variant="primary"
          type="submit"
        >
          {{ $t('account.buttons.resetPassword.title') }}
        </fb-button>

        <p class="fb-account-reset-password__info">
          <small>{{ $t('account.texts.resetPasswordInfo') }}</small>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
const SignHeader = () => import('~/components/account/SignHeader')

export default {

  name: 'RequestPassword',

  components: {
    SignHeader,
  },

  data() {
    return {
      isSubmitted: false,
      makingRequest: false,
      form: {
        scope: 'account_reset_password',
        model: {
          credentials: {
            uid: '',
          },
        },
      },
    }
  },

  created() {
    this.errors.clear(this.form.scope)

    this.$validator.localize({
      en: {
        custom: {
          uid: {
            required: this.$t('account.fields.identity.uid.validation.required'),
          },
        },
      },
    })

    this.$validator.extend('checkUid', {
      validate: this.checkUid,
      getMessage: (field, params, data) => {
        return data.message
      },
    })
  },

  methods: {

    /**
     * Check if provided current answer is correct
     *
     * @param {String} value
     *
     * @returns {Object}
     */
    checkUid(value) {
      return this.$backendApi.validateSession({
        uid: value,
      })
        .then(() => {
          return {
            valid: true,
          }
        })
        .catch((e) => {
          if (this._.get(e, 'response', null) !== null && this._.get(e, 'response.data.errors', null) !== null) {
            this._.get(e, 'response.data.errors', [])
              .forEach((error) => {
                if (parseInt(this._.get(error, 'code', 0), 10) === 422) {
                  return {
                    valid: false,
                    data: {
                      message: this._.get(error, 'detail'),
                    },
                  }
                }
              })
          }

          return {
            valid: false,
            data: {
              message: this.$t('application.messages.valueIsNotValid'),
            },
          }
        })
    },

    /**
     * Submit form values
     */
    submit() {
      this.$validator.validateAll(this.form.scope)
        .then((result) => {
          if (result) {
            const errorMessage = this.$t('account.messages.passwordRequestFail')

            this.makingRequest = true

            this.$backendApi.requestPassword({
              uid: this.form.model.credentials.uid,
            })
              .then(() => {
                this.makingRequest = false
                this.isSubmitted = true
              })
              .catch((e) => {
                this.makingRequest = false

                if (this._.get(e, 'exception', null) !== null) {
                  this.handleFormError(e.exception, errorMessage)
                } else if (this._.get(e, 'response', null) !== null) {
                  this.handleRequestError(e.response, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }

                this.isSubmitted = false
              })
          }
        })
        .catch((e) => {
          if (!this.isDev && Object.prototype.hasOwnProperty.call(this, '$sentry')) {
            this.$sentry.captureException(e)
          }
        })
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
