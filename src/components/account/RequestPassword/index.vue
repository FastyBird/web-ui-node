<template web>
  <div class="fb-account-reset-password__container">
    <sign-header
      v-if="!isSubmitted"
      :heading="$t('headings.passwordReset')"
    />
    <sign-header
      v-if="isSubmitted"
      :heading="$t('headings.instructionEmailed')"
    />

    <div
      v-if="makingRequest"
      class="row"
    >
      <div class="col-6 offset-3 text-center">
        <div class="spinner spinner-primary spinner-lg pos-r sq-80" />
        <small>{{ $t('texts.processing') }}</small>
      </div>
    </div>

    <div v-if="!makingRequest">
      <ul
        v-if="isSubmitted"
        class="list-inline"
      >
        <li class="text-center m-t-md">
          <small>{{ $t('texts.resetPasswordInstructionsEmailed') }}</small>
        </li>
      </ul>

      <form
        v-if="!isSubmitted"
        @submit.prevent="submit"
      >
        <fb-md-form-input
          v-model="form.model.credentials.uid"
          v-validate="'required|checkUid'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.uid')"
          :has-error="errors.has(form.scope + '.uid')"
          :name="'uid'"
          :label="$t('field.identity.uid.title')"
          :required="true"
          data-vv-validate-on="blur"
          class="m-b-0"
        />

        <fb-button
          block
          uppercase
          variant="primary"
          type="submit"
        >
          {{ $t('buttons.resetPassword.title') }}
        </fb-button>

        <ul class="list-inline">
          <li class="text-center m-t-md">
            <small>{{ $t('texts.resetPasswordInfo') }}</small>
          </li>
        </ul>
      </form>
    </div>
  </div>
</template>

<script>
  import api from '@/api/server'
  import { USER_PROFILE_IDENTITY } from '@/api/server/types'

  const SignHeader = () => import('@/components/account/SignHeader')

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
              required: this.$t('field.identity.uid.validation.required'),
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
        return api.validateIdentityUid({
          data: {
            type: USER_PROFILE_IDENTITY,
            attributes: {
              credentials: {
                uid: value,
              },
            },
          },
        })
          .then(() => {
            return {
              valid: true,
            }
          })
          .catch(e => {
            if (this._.get(e, 'response', null) !== null && this._.get(e, 'response.data.errors', null) !== null) {
              this._.get(e, 'response.data.errors', [])
                .forEach(error => {
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
          .then(result => {
            if (result) {
              const errorMessage = this.$t('messages.passwordRequestFail')

              this.makingRequest = true

              api.requestPassword({
                data: {
                  type: USER_PROFILE_IDENTITY,
                  attributes: {
                    credentials: {
                      uid: this.form.model.credentials.uid,
                    },
                  },
                },
              })
                .then(() => {
                  this.makingRequest = false
                  this.isSubmitted = true
                })
                .catch(e => {
                  this.makingRequest = false

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

                  this.isSubmitted = false
                })
            } else {
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

<style rel="stylesheet/scss" lang="scss">
  @import './index.scss';
</style>

<i18n src="./locales.json" />
