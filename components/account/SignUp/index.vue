<template>
  <div class="fb-account-sign-up__container">
    <sign-header :heading="$t('account.headings.signUp')" />

    <p class="fb-account-sign-up__heading">
      <em>Get started with a free account. 30 day free trial, unlimited devices, no credit card required.</em>
    </p>

    <form @submit.prevent="submit">
      <div class="fb-account-sign-up__name">
        <div class="fb-account-sign-up__name-field">
          <fb-form-input
            v-model="form.model.profile.details.first_name"
            v-validate="'required'"
            :data-vv-scope="form.scope"
            :error="errors.first(form.scope + '.first_name')"
            :has-error="errors.has(form.scope + '.first_name')"
            :name="'first_name'"
            :label="$t('account.fields.firstName.title')"
            :required="true"
            :tab-index="2"
            data-vv-validate-on="blur"
          >
            <template slot="help-line">
              {{ $t('account.fields.firstName.help') }}
            </template>
          </fb-form-input>
        </div>

        <div class="fb-account-sign-up__name-field">
          <fb-form-input
            v-model="form.model.profile.details.last_name"
            v-validate="'required'"
            :data-vv-scope="form.scope"
            :error="errors.first(form.scope + '.last_name')"
            :has-error="errors.has(form.scope + '.last_name')"
            :name="'last_name'"
            :label="$t('account.fields.lastName.title')"
            :required="true"
            :tab-index="3"
            data-vv-validate-on="blur"
          >
            <template slot="help-line">
              {{ $t('account.fields.lastName.help') }}
            </template>
          </fb-form-input>
        </div>
      </div>

      <fb-form-input
        v-model="form.model.email_address"
        v-validate="'required|email|checkEmail'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.email_address')"
        :has-error="errors.has(form.scope + '.email_address')"
        :name="'email_address'"
        :label="$t('account.fields.emailAddress.title')"
        :required="true"
        :tab-index="4"
        data-vv-validate-on="blur"
      >
        <template slot="help-line">
          {{ $t('account.fields.emailAddress.help') }}
        </template>
      </fb-form-input>

      <fb-form-input
        v-model="form.model.credentials.password"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.password')"
        :has-error="errors.has(form.scope + '.password')"
        :name="'password'"
        :label="$t('account.fields.identity.password.title')"
        :required="true"
        :tab-index="5"
        data-vv-validate-on="blur"
      />

      <fb-button
        block
        uppercase
        variant="primary"
        type="submit"
        tabindex="6"
      >
        {{ $t('account.buttons.signUp.title') }}
      </fb-button>
    </form>
  </div>
</template>

<script>
const SignHeader = () => import('../SignHeader')

export default {

  name: 'SignUp',

  components: {
    SignHeader,
  },

  data() {
    return {
      form: {
        scope: 'account_sign_up',
        model: {
          email_address: '',
          credentials: {
            password: '',
          },
          profile: {
            details: {
              first_name: '',
              last_name: '',
            },
          },
        },
      },
    }
  },

  created() {
    this.$bus.$emit('wait-sign_up', false)

    this.errors.clear(this.form.scope)

    this.$validator.localize({
      en: {
        custom: {
          email_address: {
            required: this.$t('account.fields.emailAddress.validation.required'),
          },
          first_name: {
            required: this.$t('account.fields.firstName.validation.required'),
          },
          last_name: {
            required: this.$t('account.fields.lastName.validation.required'),
          },
          password: {
            required: this.$t('account.fields.identity.password.validation.required'),
          },
        },
      },
    })

    this.$validator.extend('checkEmail', {
      validate: this.checkEmail,
      getMessage: (field, params, data) => {
        return data.message
      },
    })
  },

  methods: {

    /**
     * Check if provided email address is not used
     *
     * @param {String} value
     *
     * @returns {Object}
     */
    checkEmail(value) {
      return this.$store.dispatch('entities/email/validate', {
        address: value,
      }, {
        root: true,
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
            const errorMessage = this.$t('account.messages.signUpFail')

            this.$bus.$emit('wait-sign_up', true)

            // TODO: implement sign up...

            this.$bus.$emit('wait-sign_up', false)

            this.$flashMessage(errorMessage, 'error')
          }
        })
        .catch((e) => {
          if (Object.prototype.hasOwnProperty.call(this, '$sentry')) {
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
