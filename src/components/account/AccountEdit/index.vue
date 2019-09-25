<template>
  <fb-modal-form
    icon="user"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.accountSettings') }}
    </template>

    <template slot="form">
      <fb-md-form-select
        v-model="form.model.language"
        :data-vv-scope="form.scope"
        :label="$t('field.language.title')"
        :items="form.options.languages"
        name="language"
        class="m-b-md"
      />

      <fb-md-form-select
        v-model="form.model.timeZone"
        :data-vv-scope="form.scope"
        :label="$t('field.datetime.timeZone.title')"
        :items="zonesOptions"
        name="zone"
        class="m-b-md"
      />

      <fb-md-form-select
        v-model="form.model.weekStart"
        :data-vv-scope="form.scope"
        :label="$t('field.datetime.weekStartOn.title')"
        :items="form.options.weekStart"
        name="weekStart"
        class="m-b-md"
      />

      <fb-md-form-select
        v-model="form.model.dateFormat"
        :data-vv-scope="form.scope"
        :label="$t('field.datetime.dateFormat.title')"
        :items="form.options.dateFormat"
        name="dateFormat"
        class="m-b-md"
      />

      <fb-md-form-select
        v-model="form.model.timeFormat"
        :data-vv-scope="form.scope"
        :label="$t('field.datetime.timeFormat.title')"
        :items="form.options.timeFormat"
        name="timeFormat"
        class="m-b-0"
      />
    </template>
  </fb-modal-form>
</template>

<script>
  import timezones from '@/helpers/timezones'

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
                name: this.$t('field.datetime.weekStartOn.values.monday'),
              }, {
                value: 6,
                name: this.$t('field.datetime.weekStartOn.values.saturday'),
              }, {
                value: 0,
                name: this.$t('field.datetime.weekStartOn.values.sunday'),
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
          .forEach(country => {
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
          .then(result => {
            if (result) {
              const errorMessage = this.$t('messages.accountNotEdited')

              this.$store.dispatch('entities/account/edit', {
                language: this.form.model.language,
                week_start: this.form.model.weekStart,
                time_zone: this.form.model.timeZone,
                date_format: this.form.model.dateFormat,
                time_format: this.form.model.timeFormat,
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

              this.$toasted.success(this.$t('messages.accountEdited'), {
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
          .forEach(timezone => {
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
          language: this.account.language,
          weekStart: this.account.weekStart,
          timeZone: this.account.timeZone,
          dateFormat: this.account.dateFormat,
          timeFormat: this.account.timeFormat,
        }

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<i18n src="./locales.json" />
