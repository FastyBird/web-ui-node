<template>
  <fb-modal-form
    :lock-submit-button="form.result !== null"
    :result-is-ok="form.result === true"
    icon="user"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('account.headings.accountSettings') }}
    </template>

    <template slot="form">
      <div class="fb-account-edit__container">
        <div class="fb-account-edit__columns">
          <div class="fb-account-edit__column">
            <fb-form-input
              v-model="form.model.emailAddress"
              v-validate="'required|email|checkEmail'"
              :data-vv-scope="form.scope"
              :data-vv-as="$t('account.fields.emailAddress.title')"
              :error="errors.first(form.scope + '.email_address')"
              :has-error="errors.has(form.scope + '.email_address')"
              :name="'email_address'"
              :label="$t('account.fields.emailAddress.title')"
              :required="true"
              data-vv-validate-on="blur"
              type="email"
              spellcheck="false"
            >
              <template
                v-if="!errors.has(form.scope + '.email_address')"
                slot="help-line"
              >
                {{ $t('account.fields.emailAddress.help') }}
              </template>
            </fb-form-input>
          </div>

          <div class="fb-account-edit__column">
            <fb-form-select
              v-model="form.model.language"
              :data-vv-scope="form.scope"
              :label="$t('account.fields.language.title')"
              :items="form.options.languages"
              name="language"
            />
          </div>
        </div>

        <div class="fb-account-edit__columns">
          <div class="fb-account-edit__name-column">
            <fb-form-input
              v-model="form.model.firstName"
              v-validate="'required'"
              :data-vv-scope="form.scope"
              :data-vv-as="$t('account.fields.firstName.title')"
              :error="errors.first(form.scope + '.first_name')"
              :has-error="errors.has(form.scope + '.first_name')"
              :name="'first_name'"
              :label="$t('account.fields.firstName.title')"
              :required="true"
              spellcheck="false"
            >
              <template
                v-if="!errors.has(form.scope + '.first_name')"
                slot="help-line"
              >
                {{ $t('account.fields.firstName.help') }}
              </template>
            </fb-form-input>
          </div>

          <div class="fb-account-edit__name-column">
            <fb-form-input
              v-model="form.model.lastName"
              v-validate="'required'"
              :data-vv-scope="form.scope"
              :data-vv-as="$t('account.fields.lastName.title')"
              :error="errors.first(form.scope + '.last_name')"
              :has-error="errors.has(form.scope + '.last_name')"
              :name="'last_name'"
              :label="$t('account.fields.lastName.title')"
              :required="true"
              spellcheck="false"
            >
              <template
                v-if="!errors.has(form.scope + '.last_name')"
                slot="help-line"
              >
                {{ $t('account.fields.lastName.help') }}
              </template>
            </fb-form-input>
          </div>

          <div class="fb-account-edit__name-column">
            <fb-form-input
              v-model="form.model.middleName"
              :data-vv-scope="form.scope"
              :error="errors.first(form.scope + '.middle_name')"
              :has-error="errors.has(form.scope + '.middle_name')"
              :name="'middle_name'"
              :label="$t('account.fields.middleName.title')"
              spellcheck="false"
            />
          </div>
        </div>

        <div class="fb-account-edit__columns">
          <div class="fb-account-edit__column">
            <fb-form-select
              v-model="form.model.timeZone"
              :data-vv-scope="form.scope"
              :label="$t('account.fields.datetime.timeZone.title')"
              :items="zonesOptions"
              name="zone"
            />
          </div>

          <div class="fb-account-edit__column">
            <fb-form-select
              v-model="form.model.weekStart"
              :data-vv-scope="form.scope"
              :label="$t('account.fields.datetime.weekStartOn.title')"
              :items="form.options.weekStart"
              name="weekStart"
            />
          </div>
        </div>

        <div class="fb-account-edit__columns">
          <div class="fb-account-edit__column">
            <fb-form-select
              v-model="form.model.dateFormat"
              :data-vv-scope="form.scope"
              :label="$t('account.fields.datetime.dateFormat.title')"
              :items="form.options.dateFormat"
              name="dateFormat"
            />
          </div>

          <div class="fb-account-edit__column">
            <fb-form-select
              v-model="form.model.timeFormat"
              :data-vv-scope="form.scope"
              :label="$t('account.fields.datetime.timeFormat.title')"
              :items="form.options.timeFormat"
              name="timeFormat"
            />
          </div>
        </div>
      </div>
    </template>
  </fb-modal-form>
</template>

<script>
import timezones from '@/helpers/timezones'
import Account from '~/models/accounts-node/Account'
import Email from '~/models/accounts-node/Email'

export default {

  name: 'AccountEdit',

  props: {

    account: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      countries: ['Africa', 'America', 'Antarctica', 'Arctic', 'Asia', 'Atlantic', 'Australia', 'Europe', 'Indian', 'Pacific'],
      form: {
        scope: 'account_edit',
        model: {
          emailAddress: '',
          firstName: '',
          lastName: '',
          middleName: '',
          language: 'en',
          weekStart: 1,
          timeZone: 'Europe/London',
          dateFormat: 'DD.MM.YYYY',
          timeFormat: 'HH:mm',
        },
        options: {
          languages: [
            {
              value: 'en',
              name: 'English',
            }, {
              value: 'cs',
              name: 'Czech',
            },
          ],
          weekStart: [
            {
              value: 1,
              name: this.$t('account.fields.datetime.weekStartOn.values.monday'),
            }, {
              value: 6,
              name: this.$t('account.fields.datetime.weekStartOn.values.saturday'),
            }, {
              value: 7,
              name: this.$t('account.fields.datetime.weekStartOn.values.sunday'),
            },
          ],
          dateFormat: [
            {
              value: 'MM/DD/YYYY',
              name: 'mm/dd/yyyy',
            }, {
              value: 'DD/MM/YYYY',
              name: 'dd/mm/yyyy',
            }, {
              value: 'DD.MM.YYYY',
              name: 'dd.mm.yyyy',
            }, {
              value: 'YYYY-MM-DD',
              name: 'yyyy-mm-dd',
            },
          ],
          timeFormat: [
            {
              value: 'HH:mm',
              name: 'hh:mm',
            }, {
              value: 'hh:mm a',
              name: 'hh:mm am/pm',
            },
          ],
        },
        result: null,
      },
    }
  },

  computed: {

    /**
     * Get list of time zones for select box
     *
     * @returns {Array}
     */
    zonesOptions() {
      const zones = []

      this.countries
        .forEach((country) => {
          zones.push({
            value: this._getCountryTimezones(country),
            name: country,
          })
        })

      return zones
    },

  },

  created() {
    this._initModel()

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

      return this.$backendApi.validateEmail({
        address: value,
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
            // Email has been changed
            if (this.form.model.emailAddress !== this._.get(this.account, 'primaryEmail.address')) {
              const storedEmail = Email
                .query()
                .where('address', this.form.model.emailAddress)
                .first()

              const emailErrorMessage = this.$t('account.messages.emailNotEdited')

              if (storedEmail !== null) {
                Email.dispatch('edit', {
                  id: storedEmail.id,
                  is_default: true,
                  is_private: storedEmail.is_private,
                })
                  .then(() => {
                    this._updateAccount()
                  })
                  .catch((e) => {
                    if (this._.get(e, 'exception', null) !== null) {
                      this.handleFormError(e.exception, emailErrorMessage)
                    } else {
                      this.$flashMessage(emailErrorMessage, 'error')
                    }
                  })
              } else {
                Email.dispatch('add', {
                  account: this.account,
                  address: this.form.model.emailAddress,
                  is_default: true,
                  is_private: false,
                })
                  .then(() => {
                    this._updateAccount()
                  })
                  .catch((e) => {
                    if (this._.get(e, 'exception', null) !== null) {
                      this.handleFormError(e.exception, emailErrorMessage)
                    } else {
                      this.$flashMessage(emailErrorMessage, 'error')
                    }
                  })
              }
            } else {
              this._updateAccount()
            }

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
     * Finish updating of user account
     */
    _updateAccount() {
      const errorMessage = this.$t('account.messages.accountNotEdited')

      Account.dispatch('edit', {
        id: this.account.id,
        first_name: this.form.model.firstName,
        last_name: this.form.model.lastName,
        middle_name: this.form.model.middleName,
        language: this.form.model.language,
        week_start: this.form.model.weekStart,
        time_zone: this.form.model.timeZone,
        date_format: this.form.model.dateFormat,
        time_format: this.form.model.timeFormat,
      })
        .catch((e) => {
          if (this._.get(e, 'exception', null) !== null) {
            this.handleFormError(e.exception, errorMessage)
          } else {
            this.$flashMessage(errorMessage, 'error')
          }
        })
    },

    /**
     * Get list of timezones for given country
     *
     * @param {String} country
     *
     * @returns {Array}
     *
     * @private
     */
    _getCountryTimezones(country) {
      const zones = []

      timezones
        .filter(zone => zone.substring(0, zone.search('/')) === country)
        .forEach((timezone) => {
          zones.push({
            value: timezone,
            name: this._getTimezoneName(timezone),
          })
        })

      return zones
    },

    /**
     * Extract zone name from timezone string
     *
     * @param {String} timezone
     *
     * @returns {String}
     *
     * @private
     */
    _getTimezoneName(timezone) {
      return timezone.substring(timezone.search('/') + 1)
    },

    /**
     * Initialize form model object
     *
     * @private
     */
    _initModel() {
      this.form.model = {
        emailAddress: this._.get(this.account, 'primaryEmail.address'),
        firstName: this.account.firstName,
        lastName: this.account.lastName,
        middleName: this.account.middleName,
        language: this.account.language,
        weekStart: this.account.weekStart,
        timeZone: this.account.timeZone,
        dateFormat: this.account.dateFormat,
        timeFormat: this.account.timeFormat,
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

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
