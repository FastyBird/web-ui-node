<template>
  <div class="fb-account-sign-in__container">
    <sign-header :heading="$t('account.headings.signIn')" />

    <form @submit.prevent="submit">
      <fb-form-input
        v-model="form.model.credentials.uid"
        v-validate="'required|checkUid'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.uid')"
        :has-error="errors.has(form.scope + '.uid')"
        :name="'uid'"
        :label="$t('account.fields.identity.uid.title')"
        :required="true"
        :tab-index="2"
        data-vv-validate-on="blur"
      />

      <fb-form-input
        v-model="form.model.credentials.password"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.password')"
        :has-error="errors.has(form.scope + '.password')"
        :name="'password'"
        :label="$t('account.fields.identity.password.title')"
        :required="true"
        :tab-index="3"
        type="password"
      />

      <fb-form-checkbox
        v-model="form.model.persistent"
        :data-vv-scope="form.scope"
        :name="'persistent'"
        :tab-index="4"
      >
        {{ $t('account.fields.persistent.title') }}
        <template slot="right-addon">
          <span aria-hidden="true"> · </span>
          <nuxt-link :to="localePath({ name: $routes.account.resetPassword })">
            {{ $t('account.buttons.forgotPassword.title') }}
          </nuxt-link>
        </template>
      </fb-form-checkbox>

      <fb-button
        block
        uppercase
        variant="primary"
        type="submit"
        tabindex="5"
      >
        {{ $t('account.buttons.signIn.title') }}
      </fb-button>
    </form>
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode'

import Session from '~/models/accounts-node/Session'

const SignHeader = () => import('~/components/account/SignHeader')

export default {

  name: 'SignIn',

  components: {
    SignHeader,
  },

  data() {
    return {
      form: {
        scope: 'account_sign_in',
        model: {
          credentials: {
            uid: '',
            password: '',
          },
          persistent: true,
        },
      },
    }
  },

  created() {
    this.$bus.$emit('wait-page_reloading', false)

    this.errors.clear(this.form.scope)

    this.$validator.localize({
      en: {
        custom: {
          uid: {
            required: this.$t('account.fields.identity.uid.validation.required'),
          },
          password: {
            required: this.$t('account.fields.identity.password.validation.required'),
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
     * Check if provided uid is correct
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
      this.$bus.$emit('wait-page_reloading', true)

      this.$validator.validateAll(this.form.scope)
        .then((result) => {
          if (result) {
            const errorMessage = this.$t('application.messages.requestError')

            Session.dispatch('create', {
              uid: this.form.model.credentials.uid,
              password: this.form.model.credentials.password,
            })
              .then((session) => {
                if (this.form.model.persistent) {
                  const decodedAccessToken = jwtDecode(session.token)

                  this.$cookies.set('token', session.token, {
                    path: '/',
                    maxAge: (((new Date(decodedAccessToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
                  })

                  const decodedRefreshToken = jwtDecode(session.refresh)

                  this.$cookies.set('refresh_token', session.refresh, {
                    path: '/',
                    maxAge: (((new Date(decodedRefreshToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
                  })
                } else {
                  this.$cookies.set('token', session.token)
                  this.$cookies.set('refresh_token', session.refresh)
                }

                this.$bus.$emit('signIn', false)
              })
              .catch((e) => {
                this.$bus.$emit('wait-page_reloading', false)

                if (this._.get(e, 'exception', null) !== null) {
                  this.handleFormError(e.exception, errorMessage)
                } else if (this._.get(e, 'response', null) !== null) {
                  this.handleRequestError(e.response, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })
          } else {
            this.$bus.$emit('wait-page_reloading', false)
          }
        })
        .catch((e) => {
          this.$bus.$emit('wait-page_reloading', false)

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
