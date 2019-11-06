<template>
  <fb-modal-form
    icon="user"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.profileSettings') }}
    </template>

    <template slot="form">
      <fb-form-input
        v-model="form.model.emailAddress"
        v-validate="'required|email|checkEmail'"
        :data-vv-scope="form.scope"
        :data-vv-as="$t('field.emailAddress.title')"
        :error="errors.first(form.scope + '.email_address')"
        :has-error="errors.has(form.scope + '.email_address')"
        :name="'email_address'"
        :label="$t('field.emailAddress.title')"
        :required="true"
        data-vv-validate-on="blur"
        type="email"
        spellcheck="false"
        class="m-b-md"
      >
        <template
          v-if="!errors.has(form.scope + '.email_address')"
          slot="help-line"
        >
          {{ $t('field.emailAddress.help') }}
        </template>
      </fb-form-input>

      <fb-form-input
        v-model="form.model.firstName"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :data-vv-as="$t('field.firstName.title')"
        :error="errors.first(form.scope + '.first_name')"
        :has-error="errors.has(form.scope + '.first_name')"
        :name="'first_name'"
        :label="$t('field.firstName.title')"
        :required="true"
        spellcheck="false"
        class="m-b-md"
      >
        <template
          v-if="!errors.has(form.scope + '.first_name')"
          slot="help-line"
        >
          {{ $t('field.firstName.help') }}
        </template>
      </fb-form-input>

      <fb-form-input
        v-model="form.model.lastName"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :data-vv-as="$t('field.lastName.title')"
        :error="errors.first(form.scope + '.last_name')"
        :has-error="errors.has(form.scope + '.last_name')"
        :name="'last_name'"
        :label="$t('field.lastName.title')"
        :required="true"
        spellcheck="false"
        class="m-b-md"
      >
        <template
          v-if="!errors.has(form.scope + '.last_name')"
          slot="help-line"
        >
          {{ $t('field.lastName.help') }}
        </template>
      </fb-form-input>

      <fb-form-input
        v-model="form.model.middleName"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.middle_name')"
        :has-error="errors.has(form.scope + '.middle_name')"
        :name="'middle_name'"
        :label="$t('field.middleName.title')"
        spellcheck="false"
        class="m-b-0"
      />
    </template>
  </fb-modal-form>
</template>

<script>
  export default {

    name: 'ProfileEdit',

    props: {

      account: {
        type: Object,
        required: true,
      },

      profile: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        form: {
          scope: 'account_profile_edit',
          model: {
            emailAddress: '',
            firstName: '',
            lastName: '',
            middleName: '',
          },
        },
      }
    },

    created() {
      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            email_address: {
              required: this.$t('field.emailAddress.validation.required'),
            },
            first_name: {
              required: this.$t('field.firstName.validation.required'),
            },
            last_name: {
              required: this.$t('field.lastName.validation.required'),
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
        const emails = this.account.emails

        for (const email of emails) {
          if (email.address === value) {
            return {
              valid: true,
            }
          }
        }

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
              const errorMessage = this.$t('messages.profileNotEdited')

              this.$store.dispatch('entities/profile/edit', {
                first_name: this.form.model.firstName,
                last_name: this.form.model.lastName,
                middle_name: this.form.model.middleName,
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

              // Email has been changed
              if (this.form.model.emailAddress !== this._.get(this.account, 'primaryEmail.address')) {
                const storedEmail = this.$store.getters['entities/email/query']()
                  .where('address', this.form.model.emailAddress)
                  .first()

                const emailErrorMessage = this.$t('messages.emailNotEdited')

                if (storedEmail !== null) {
                  this.$store.dispatch('entities/email/edit', {
                    id: storedEmail.id,
                    is_default: true,
                  }, {
                    root: true,
                  })
                    .catch(e => {
                      if (this._.get(e, 'exception', null) !== null) {
                        this.handleFormError(e.exception, emailErrorMessage)
                      } else {
                        this.$toasted.error(emailErrorMessage, {
                          action: {
                            text: this.$t('application.buttons.close.title'),
                            onClick: (evnt, toastObject) => {
                              toastObject.goAway(0)
                            },
                          },
                        })
                      }
                    })
                } else {
                  this.$store.dispatch('entities/email/add', {
                    address: this.form.model.emailAddress,
                    is_default: true,
                  }, {
                    root: true,
                  })
                    .catch(e => {
                      if (this._.get(e, 'exception', null) !== null) {
                        this.handleFormError(e.exception, emailErrorMessage)
                      } else {
                        this.$toasted.error(emailErrorMessage, {
                          action: {
                            text: this.$t('application.buttons.close.title'),
                            onClick: (evnt, toastObject) => {
                              toastObject.goAway(0)
                            },
                          },
                        })
                      }
                    })
                }
              }

              this.$toasted.success(this.$t('messages.profileEdited'), {
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
          emailAddress: this._.get(this.account, 'primaryEmail.address'),
          firstName: this.profile.firstName,
          lastName: this.profile.lastName,
          middleName: this.profile.middleName,
        }

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<i18n src="./locales.json" />
