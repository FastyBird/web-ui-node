<template>
  <fb-modal-form
    v-if="thing !== null"
    :transparent-bg="transparentBg"
    :lock-submit-button="form.result !== null"
    icon="key"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('things.headings.credentials') }}
    </template>

    <template slot="form">
      <template v-if="form.result === null">
        <fb-form-input
          v-model="form.model.username"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.username')"
          :has-error="errors.has(form.scope + '.username')"
          :name="'username'"
          :label="$t('things.vendor.global.username.title')"
          :required="true"
          :tab-index="2"
        />

        <fb-form-input
          v-model="form.model.password"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.password')"
          :has-error="errors.has(form.scope + '.password')"
          :name="'password'"
          :label="$t('things.vendor.global.password.title')"
          :required="true"
          :tab-index="3"
        />

        <div class="row m-t-lg">
          <div class="col-md-8">
            <fb-form-input
              v-model="form.model.server"
              :data-vv-scope="form.scope"
              :error="errors.first(form.scope + '.server')"
              :has-error="errors.has(form.scope + '.server')"
              :name="'server'"
              :label="$t('things.vendor.global.server.title')"
              :readonly="true"
              :tab-index="5"
            />
          </div>

          <div class="col-md-4">
            <fb-form-input
              v-model="form.model.port"
              :data-vv-scope="form.scope"
              :error="errors.first(form.scope + '.port')"
              :has-error="errors.has(form.scope + '.port')"
              :name="'port'"
              :label="$t('things.vendor.global.port.title')"
              :readonly="true"
              :tab-index="6"
            />
          </div>
        </div>
      </template>

      <result-ok v-if="form.result === true" />
    </template>
  </fb-modal-form>
</template>

<script>
import {
  MQTT_SERVER_ADDRESS,
  MQTT_SERVER_PORT,
} from '@/configuration'

export default {

  name: 'ThingsSettingsThingCredentials',

  props: {

    thing: {
      type: Object,
      required: true,
    },

    transparentBg: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      credentials: null,
      form: {
        scope: 'io_server_thing_edit_credentials',
        model: {
          username: null,
          password: null,
          server: MQTT_SERVER_ADDRESS,
          port: MQTT_SERVER_PORT,
        },
        result: null,
      },
    }
  },

  created() {
    this.credentials = this.$store.getters['entities/credentials/query']()
      .where('device_id', this.thing.device_id)
      .first()

    this._initModel()

    this.$validator.localize({
      en: {
        custom: {
          username: {
            required: this.$t('things.vendor.global.username.validation.required'),
          },
          password: {
            required: this.$t('things.vendor.global.password.validation.required'),
          },
        },
      },
    })
  },

  mounted() {
    this.$emit('loaded')
  },

  methods: {

    /**
     * Submit thing form
     *
     * @param {Object} event
     */
    submit(event) {
      event && event.preventDefault()

      this.$validator.validateAll(this.form.scope)
        .then((result) => {
          if (result) {
            const errorMessage = this.$t('things.messages.notEdited', {
              thing: this.$tThing(this.thing),
            })

            this.$store.dispatch('entities/device/edit', {
              id: this.thing.device_id,
              data: {
                credentials: this.form.model,
              },
            }, {
              root: true,
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
          if (Object.prototype.hasOwnProperty.call(this, '$sentry')) {
            this.$sentry.captureException(e)
          }
        })
    },

    /**
     * Close thing credentials window
     *
     * @param {Object} event
     */
    close(event) {
      event && event.preventDefault()

      this._initModel()

      this.$emit('close')
    },

    /**
     * Initialize form model object
     *
     * @private
     */
    _initModel() {
      this.form.model.username = this.credentials.username
      this.form.model.password = this.credentials.password

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
