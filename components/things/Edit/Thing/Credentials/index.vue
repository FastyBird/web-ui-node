<template>
  <fb-modal-form
    v-if="thing !== null"
    :transparent-bg="transparentBg"
    icon="key"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.credentials') }}
    </template>

    <template slot="form">
      <fb-form-input
        v-model="form.model.username"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.username')"
        :has-error="errors.has(form.scope + '.username')"
        :name="'username'"
        :label="$t('field.username.title')"
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
        :label="$t('field.password.title')"
        :required="true"
        :tab-index="3"
      />

      <fb-form-input
        v-model="form.model.thing_id"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.thing_id')"
        :has-error="errors.has(form.scope + '.thing_id')"
        :name="'thing_id'"
        :label="$t('field.clientId.title')"
        :readonly="true"
        :tab-index="4"
      />

      <div class="row m-t-lg">
        <div class="col-md-8">
          <fb-form-input
            v-model="form.model.server"
            :data-vv-scope="form.scope"
            :error="errors.first(form.scope + '.server')"
            :has-error="errors.has(form.scope + '.server')"
            :name="'server'"
            :label="$t('field.server.title')"
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
            :label="$t('field.port.title')"
            :readonly="true"
            :tab-index="6"
          />
        </div>
      </div>
    </template>
  </fb-modal-form>
</template>

<script>
  import {
    MQTT_SERVER_ADDRESS,
    MQTT_SERVER_PORT,
  } from '@/configuration'

  export default {

    name: 'ThingsEditThingCredentials',

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
            thing_id: this._.get(this.thing, 'id'),
            server: MQTT_SERVER_ADDRESS,
            port: MQTT_SERVER_PORT,
          },
        },
      }
    },

    created() {
      this.credentials = this.$store.getters['entities/credentials/query']()
        .where('thing_id', this.thing.id)
        .first()

      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            username: {
              required: this.$t('field.username.validation.required'),
            },
            password: {
              required: this.$t('field.password.validation.required'),
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
          .then(result => {
            if (result) {
              const errorMessage = this.$t('things.messages.notEdited', {
                thing: this.thing.label,
              })

              this.$store.dispatch('entities/thing/edit', {
                id: this.thing.id,
                data: {
                  credentials: this.form.model,
                },
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

              this.$toasted.success(this.$t('things.messages.edited', {
                thing: this.form.model.name,
              }), {
                action: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })

              this._initModel()

              this.$emit('close')
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

  }
</script>

<i18n src="./locales.json" />
