<template>
  <div class="fb-account-sign-in__container">
    <sign-header :heading="$t('headings.signIn')" />

    <form
      class="p-t-md"
      @submit.prevent="submit"
    >
      <fb-form-input
        v-model="form.model.credentials.uid"
        v-validate="'required|checkUid'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.uid')"
        :has-error="errors.has(form.scope + '.uid')"
        :name="'uid'"
        :label="$t('field.identity.uid.title')"
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
        :label="$t('field.identity.password.title')"
        :required="true"
        :tab-index="3"
        type="password"
      />

      <fb-form-checkbox
        v-model="form.model.persistent"
        :data-vv-scope="form.scope"
        :name="'persistent'"
        :tab-index="4"
        class="p-y-0"
      >
        {{ $t('field.persistent.title') }}
        <template slot="right-addon">
          <span aria-hidden="true"> · </span>
          <router-link :to="links.resetPasswordLnk">
            {{ $t('buttons.forgotPassword.title') }}
          </router-link>
        </template>
      </fb-form-checkbox>

      <fb-button
        block
        uppercase
        variant="primary"
        type="submit"
        tabindex="5"
      >
        {{ $t('buttons.signIn.title') }}
      </fb-button>
    </form>
  </div>
</template>

<script>
import {
  HOME_LINK,
  ACCOUNT_SIGN_IN_LINK,
  ACCOUNT_RESET_PASSWORD_LINK,
} from '@/configuration/routes'

const SignHeader = () => import('@/components/account/SignHeader')

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
      links: {
        resetPasswordLnk: this.localePath({ name: ACCOUNT_RESET_PASSWORD_LINK }),
      },
    }
  },

  created() {
    this.$bus.$emit('wait-sign_in', false)

    this.errors.clear(this.form.scope)

    this.$validator.localize({
      en: {
        custom: {
          uid: {
            required: this.$t('field.identity.uid.validation.required'),
          },
          password: {
            required: this.$t('field.identity.password.validation.required'),
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
      return this.$store.dispatch('entities/session/validateUid', {
        uid: value,
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
      this.$bus.$emit('wait-sign_in', true)

      this.$validator.validateAll(this.form.scope)
        .then((result) => {
          if (result) {
            const errorMessage = this.$t('application.messages.requestError')

            this.$store.dispatch('entities/session/create', {
              id: process.env.NUXT_ENV_SESSION_KEY,
              uid: this.form.model.credentials.uid,
              password: this.form.model.credentials.password,
            }, {
              root: true,
            })
              .then((tokens) => {
                if (this.form.model.persistent) {
                  this.$cookies.set('token', tokens.token, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30,
                  })
                  this.$cookies.set('refresh_token', tokens.refresh, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30,
                  })
                } else {
                  this.$cookies.set('token', tokens.token)
                  this.$cookies.set('refresh_token', tokens.refresh)
                }

                this.$bus.$emit('signIn', true)

                this.$router.push(this.localePath({ name: HOME_LINK }))
              })
              .catch((e) => {
                this.$bus.$emit('wait-sign_in', false)

                if (this._.get(e, 'exception', null) !== null) {
                  this.handleFormError(e.exception, errorMessage)
                } else if (this._.get(e, 'response', null) !== null) {
                  this.handleRequestError(e.response, errorMessage)
                } else {
                  this.$toasted.error(errorMessage, {
                    action: {
                      text: this.$t('application.buttons.close.title'),
                      onClick: (evnt, toastObject) => {
                        toastObject.goAway(0)
                      },
                    },
                  })
                }

                this.$router.push(this.localePath({ name: ACCOUNT_SIGN_IN_LINK }))
              })
          } else {
            this.$bus.$emit('wait-sign_in', false)

            this.$toasted.info(this.$t('application.messages.fixAllFormErrors'), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })
          }
        })
        .catch(() => {
          this.$bus.$emit('wait-sign_in', false)

          this.$toasted.info(this.$t('application.messages.fixAllFormErrors'), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })
        })
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>

<i18n src="./locales.json" />
