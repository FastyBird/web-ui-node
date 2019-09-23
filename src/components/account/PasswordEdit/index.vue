<template>
  <fb-modal-form
    icon="key"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.passwordChange') }}
    </template>

    <template slot="form">
      <fb-md-form-input
        v-model="form.model.password.current"
        v-validate="'required|checkCurrentPassword'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.current_password')"
        :has-error="errors.has(form.scope + '.current_password')"
        :name="'current_password'"
        :label="$t('field.password.current.title')"
        :required="true"
        type="password"
        data-vv-validate-on="blur"
        spellcheck="false"
        class="m-b-md"
      >
        <template
          v-if="!errors.has(form.scope + '.current_password')"
          slot="help-line"
        >
          {{ $t('field.password.current.help') }}
        </template>
      </fb-md-form-input>

      <fb-md-form-input
        v-model="form.model.password.new"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.new_password')"
        :has-error="errors.has(form.scope + '.new_password')"
        :name="'new_password'"
        :label="$t('field.password.new.title')"
        :required="true"
        type="password"
        spellcheck="false"
        class="m-b-md"
      >
        <template
          v-if="!errors.has(form.scope + '.new_password')"
          slot="help-line"
        >
          {{ $t('field.password.new.help') }}
        </template>
      </fb-md-form-input>

      <fb-md-form-input
        v-model="form.model.password.repeat"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.repeat_password')"
        :has-error="errors.has(form.scope + '.repeat_password')"
        :name="'repeat_password'"
        :label="$t('field.password.repeat.title')"
        :required="true"
        type="password"
        spellcheck="false"
        class="m-b-0"
      >
        <template
          v-if="!errors.has(form.scope + '.repeat_password')"
          slot="help-line"
        >
          {{ $t('field.password.repeat.help') }}
        </template>
      </fb-md-form-input>
    </template>
  </fb-modal-form>
</template>

<script>
  export default {

    name: 'PasswordEdit',

    props: {

      account: {
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
        },
      }
    },

    mounted() {
      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            current_password: {
              required: this.$t('field.password.current.validation.required'),
            },
            new_password: {
              required: this.$t('field.password.new.validation.required'),
            },
            repeat_password: {
              required: this.$t('field.password.repeat.validation.required'),
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
        return this.$store.dispatch('entities/account/validatePassword', {
          password: value,
        }, {
          root: true,
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
       *
       * @param {Object} event
       */
      submit(event) {
        event && event.preventDefault()

        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              const errorMessage = this.$t('messages.passwordNotEdited')

              this.$store.dispatch('entities/account/changePassword', {
                current_password: this.form.model.password.current,
                new_password: this.form.model.password.new,
              }, {
                root: true,
              })
                .catch(e => {
                  if (this._.get(e, 'exception', null) !== null) {
                    this.handleFormError(e.exception, errorMessage)
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
                })

              this.$toasted.success(this.$t('messages.passwordEdited'), {
                action: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })

              this._initModel()

              this.$emit('close', false)
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

  }
</script>

<i18n src="./locales.json" />
