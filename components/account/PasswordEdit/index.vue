<template>
  <fb-ui-modal-form
    :lock-submit-button="form.result !== null"
    :result-is-ok="form.result === true"
    icon="key"
    @submit="submit"
    @cancel="close"
    @close="close"
  >
    <template slot="header">
      {{ $t('account.headings.passwordChange') }}
    </template>

    <template slot="form">
      <fb-form-input
        v-model="form.model.password.current"
        v-validate="'required'"
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
        <template slot="help-line">
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
        <template slot="help-line">
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
        <template slot="help-line">
          {{ $t('account.fields.password.repeat.help') }}
        </template>
      </fb-form-input>
    </template>
  </fb-ui-modal-form>
</template>

<script>
import Identity from '~/models/auth-node/identities/Identity'

export default {

  name: 'PasswordEdit',

  props: {

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
  },

  methods: {

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
              password: {
                current: this.form.model.password.current,
                new: this.form.model.password.new,
              },
            })
              .catch((e) => {
                if (this._.get(e, 'exception', null) !== null) {
                  this.handleException(e.exception, errorMessage)
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
