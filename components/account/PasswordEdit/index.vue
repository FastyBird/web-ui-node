<template>
  <fb-modal-form
    :lock-submit-button="form.result !== null"
    :result-is-ok="form.result === true"
    icon="key"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('account.headings.passwordChange') }}
    </template>

    <template slot="form">
      <fb-form-input
        v-model="form.model.password.current"
        v-validate="'required|checkCurrentPassword'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.current_password')"
        :has-error="errors.has(form.scope + '.current_password')"
        :name="'current_password'"
        :label="$t('account.fields.password.current.title')"
        :required="true"
        type="password"
        data-vv-validate-on="blur"
        spellcheck="false"
      >
        <template
          v-if="!errors.has(form.scope + '.current_password')"
          slot="help-line"
        >
          {{ $t('account.fields.password.current.help') }}
        </template>
      </fb-form-input>

      <fb-form-input
        ref="new_password"
        v-model="form.model.password.new"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.new_password')"
        :has-error="errors.has(form.scope + '.new_password')"
        :name="'new_password'"
        :label="$t('account.fields.password.new.title')"
        :required="true"
        type="password"
        spellcheck="false"
      >
        <template
          v-if="!errors.has(form.scope + '.new_password')"
          slot="help-line"
        >
          {{ $t('account.fields.password.new.help') }}
        </template>
      </fb-form-input>

      <fb-form-input
        v-model="form.model.password.repeat"
        v-validate="'required|confirmed:new_password'"
        :data-vv-as="$t('account.fields.password.repeat.title')"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.repeat_password')"
        :has-error="errors.has(form.scope + '.repeat_password')"
        :name="'repeat_password'"
        :label="$t('account.fields.password.repeat.title')"
        :required="true"
        type="password"
        spellcheck="false"
      >
        <template
          v-if="!errors.has(form.scope + '.repeat_password')"
          slot="help-line"
        >
          {{ $t('account.fields.password.repeat.help') }}
        </template>
      </fb-form-input>
    </template>
  </fb-modal-form>
</template>

<script>
import Identity from '~/models/accounts-node/Identity'

export default {

  name: 'PasswordEdit',

  props: {

    account: {
      type: Object,
      required: true,
    },

    identity: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      form: {
        scope: 'account_password_edit',
        model: {
          password: {
            current: '',
            new: '',
            repeat: '',
          },
        },
        result: null,
      },
    }
  },

  created() {
    this._initModel()

    this.$validator.localize({
      en: {
        custom: {
          current_password: {
            required: this.$t('account.fields.password.current.validation.required'),
          },
          new_password: {
            required: this.$t('account.fields.password.new.validation.required'),
          },
          repeat_password: {
            required: this.$t('account.fields.password.repeat.validation.required'),
          },
        },
      },
    })

    this.$validator.extend('checkCurrentPassword', {
      validate: this.checkCurrentPassword,
      getMessage: (field, params, data) => {
        return this._.get(data, 'message', '')
      },
    })
  },

  methods: {

    /**
     * Check if provided current password is correct
     *
     * @param {String} value
     *
     * @returns {Object}
     */
    checkCurrentPassword(value) {
      return this.$backendApi.validateIdentity({
        id: this.identity.id,
        password: value,
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
     *
     * @param {Object} event
     */
    submit(event) {
      event && event.preventDefault()

      this.$validator.validateAll(this.form.scope)
        .then((result) => {
          if (result) {
            const errorMessage = this.$t('account.messages.passwordNotEdited')

            Identity.dispatch('edit', {
              id: this.identity.id,
              current_password: this.form.model.password.current,
              new_password: this.form.model.password.new,
            })
              .catch((e) => {
                if (this._.get(e, 'exception', null) !== null) {
                  this.handleFormError(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })

            this.form.result = true

            this.$timer.start('close')
          }
        })
        .catch((e) => {
          if (!this.isDev && Object.prototype.hasOwnProperty.call(this, '$sentry')) {
            this.$sentry.captureException(e)
          }
        })
    },

    /**
     * Close account edit window
     *
     * @param {Object} event
     */
    close(event) {
      event && event.preventDefault()

      this._initModel()

      this.$emit('close', false)
    },

    /**
     * Initialize form model object
     *
     * @private
     */
    _initModel() {
      this.form.model = {
        password: {
          current: '',
          new: '',
          repeat: '',
        },
      }

      this.errors.clear(this.form.scope)
    },

  },

  timers: {
    close: {
      time: 2000,
    },
  },

}
</script>
