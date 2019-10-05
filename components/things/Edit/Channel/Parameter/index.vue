<template>
  <fb-modal-form
    :transparent-bg="transparentBg"
    icon="plug"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ translatedHeading }}
    </template>

    <template slot="form">
      <p
        v-if="!thing.state"
        class="alert alert-warning"
        role="alert"
      >
        This thing is offline. Therefore you can't edit its setting
      </p>

      <fb-md-form-input
        v-if="parameter.isNumber"
        v-model="form.model"
        v-validate="`required|numeric|between:${parameter.min},${parameter.max}`"
        :data-vv-scope="form.scope"
        :data-vv-as="translatedLabel"
        :data-vv-min="parameter.min"
        :data-vv-max="parameter.max"
        :error="errors.first(`${form.scope}.${parameter.name}`)"
        :has-error="errors.has(`${form.scope}.${parameter.name}`)"
        :name="parameter.name"
        :label="translatedLabel"
        :required="true"
        :tab-index="2"
        type="number"
        class="m-b-0"
      >
        <template
          v-if="translatedDescription !== null && !errors.has(`${form.scope}.${parameter.name}`)"
          slot="help-line"
        >
          {{ translatedDescription }}
        </template>
      </fb-md-form-input>

      <fb-md-form-input
        v-if="parameter.isText"
        v-model="form.model"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :data-vv-as="translatedLabel"
        :error="errors.first(`${form.scope}.${parameter.name}`)"
        :has-error="errors.has(`${form.scope}.${parameter.name}`)"
        :name="parameter.name"
        :label="translatedLabel"
        :required="true"
        :tab-index="2"
        type="text"
        class="m-b-0"
      >
        <template
          v-if="translatedDescription !== null && !errors.has(`${form.scope}.${parameter.name}`)"
          slot="help-line"
        >
          {{ translatedDescription }}
        </template>
      </fb-md-form-input>

      <fb-md-form-select
        v-if="parameter.isSelect"
        v-model="form.model"
        :items="parameterItems"
        :data-vv-scope="form.scope"
        :data-vv-as="translatedLabel"
        :error="errors.first(`${form.scope}.${parameter.name}`)"
        :has-error="errors.has(`${form.scope}.${parameter.name}`)"
        :name="parameter.name"
        :label="translatedLabel"
        :required="true"
        :tab-index="2"
      >
        <template
          v-if="translatedDescription !== null && !errors.has(`${form.scope}.${parameter.name}`)"
          slot="help-line"
        >
          {{ translatedDescription }}
        </template>
      </fb-md-form-select>
    </template>
  </fb-modal-form>
</template>

<script>
  export default {

    name: 'ThingsEditChannelParameter',

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

      parameter: {
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
        form: {
          scope: 'io_server_channel_edit_property',
          model: null,
        },
      }
    },

    computed: {

      value() {
        const stored = this.$store.getters['entities/channel_configuration_value/query']()
          .where('channel_id', this.channel.id)
          .where('configuration_id', this.parameter.id)
          .first()

        return stored ? stored.value : null
      },

      /**
       * Get thing hardware info
       *
       * @returns {(Hardware|null)}
       */
      hardware() {
        return this.$store.getters['entities/hardware/query']()
          .where('thing_id', this.thing.id)
          .first()
      },

      /**
       * Translate parameter heading
       *
       * @returns {String}
       */
      translatedHeading() {
        if (this._.get(this.hardware, 'isCustom', true)) {
          if (this.parameter.title !== null) {
            return this.parameter.title
          }

          return this.parameter.name
        }

        if (this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.heading`).indexOf('things.vendors.') === -1) {
          return this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.heading`)
        }

        return this.parameter.name
      },

      /**
       * Translate parameter form label
       *
       * @returns {String}
       */
      translatedLabel() {
        if (this._.get(this.hardware, 'isCustom', true)) {
          if (this.parameter.title !== null) {
            return this.parameter.title
          }

          return this.parameter.name
        }

        if (this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.button`).indexOf('things.vendors.') === -1) {
          return this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.button`)
        }

        return this.parameter.name
      },

      /**
       * Translate parameter field description
       *
       * @returns {(String|null)}
       */
      translatedDescription() {
        if (this._.get(this.hardware, 'isCustom', true)) {
          if (this.parameter.description !== null) {
            return this.parameter.description
          }

          return null
        }

        if (this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.description`).indexOf('things.vendors.') === -1) {
          return this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.description`)
        }

        return null
      },

      /**
       * Parse parameter items for select box
       *
       * @returns {Array}
       */
      parameterItems() {
        const items = []

        if (this.parameter.isSelect) {
          for (const key in this.parameter.values) {
            if (this.parameter.values.hasOwnProperty(key)) {
              items.push({
                'value': this.parameter.values[key].value,
                'name': this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.values.${this.parameter.values[key].name}`),
              })
            }
          }
        }

        return items
      },

    },

    watch: {

      'thing.state'(val) {
        if (val) {
          this._initModel()
        }
      },

    },

    created() {
      this._initModel()
    },

    mounted() {
      this.$emit('loaded')
    },

    methods: {

      /**
       * Submit thing parameter edit form
       *
       * @param {Object} event
       */
      submit(event) {
        event && event.preventDefault()

        // Check if thing is connected to cloud
        if (!this.thing.state) {
          this.$toasted.error(this.$t('things.messages.notOnline', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              this.$store.dispatch('entities/channel_configuration_value/edit', {
                thing_id: this.thing.id,
                channel_id: this.channel.id,
                parameter_id: this.parameter.id,
                data: this.form.model,
              }, {
                root: true,
              })

              this.$toasted.success(this.$t('things.messages.edited', {
                thing: this.thing.label,
              }), {
                action: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })

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
       * Close thing parameter edit window
       *
       * @param {Object} event
       */
      close(event) {
        event && event.preventDefault()

        this.$emit('close')
      },

      /**
       * Initialize form model data
       *
       * @private
       */
      _initModel() {
        this.form.model = this.value === null ? this.parameter.default : this.value

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<i18n src="./locales.json" />
