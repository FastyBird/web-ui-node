<template>
  <fb-modal-form
    v-if="thing !== null"
    :transparent-bg="transparentBg"
    icon="cogs"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ title }}
    </template>

    <template slot="form">
      <template v-for="(parameter, index) in parameters">
        <fb-md-form-input
          v-if="parameter.type === form.types.number"
          :key="index"
          v-model="form.model[parameter.name]"
          v-validate="`required|numeric|between:${parameter.min},${parameter.max}`"
          :data-vv-scope="form.scope"
          :data-vv-as="translateLabel(parameter)"
          :data-vv-min="parameter.min"
          :data-vv-max="parameter.max"
          :error="errors.first(`${form.scope}.${parameter.name}`)"
          :has-error="errors.has(`${form.scope}.${parameter.name}`)"
          :name="parameter.name"
          :label="translateLabel(parameter)"
          :required="true"
          :tab-index="index + 2"
          type="number"
          class="m-b-sm"
        >
          <template
            v-if="translateDescription(parameter) !== null && !errors.has(`${form.scope}.${parameter.name}`)"
            slot="help-line"
          >
            {{ translateDescription(parameter) }}
          </template>
        </fb-md-form-input>

        <fb-md-form-input
          v-if="parameter.type === form.types.text"
          :key="index"
          v-model="form.model[parameter.name]"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :data-vv-as="translateLabel(parameter)"
          :error="errors.first(`${form.scope}.${parameter.name}`)"
          :has-error="errors.has(`${form.scope}.${parameter.name}`)"
          :name="parameter.name"
          :label="translateLabel(parameter)"
          :required="true"
          :tab-index="index + 2"
          type="text"
          class="m-b-sm"
        >
          <template
            v-if="translateDescription(parameter) !== null && !errors.has(`${form.scope}.${parameter.name}`)"
            slot="help-line"
          >
            {{ translateDescription(parameter) }}
          </template>
        </fb-md-form-input>

        <fb-md-form-select
          v-if="parameter.type === form.types.select"
          :key="index"
          v-model="form.model[parameter.name]"
          :items="getParameterItems(parameter)"
          :data-vv-scope="form.scope"
          :data-vv-as="translateLabel(parameter)"
          :error="errors.first(`${form.scope}.${parameter.name}`)"
          :has-error="errors.has(`${form.scope}.${parameter.name}`)"
          :name="parameter.name"
          :label="translateLabel(parameter)"
          :tab-index="index + 2"
          :required="true"
          class="m-b-sm"
        >
          <template
            v-if="translateDescription(parameter) !== null && !errors.has(`${form.scope}.${parameter.name}`)"
            slot="help-line"
          >
            {{ translateDescription(parameter) }}
          </template>
        </fb-md-form-select>

        <fb-md-form-checkbox
          v-if="parameter.type === form.types.checkbox"
          :key="index"
          v-model="form.model[parameter.name]"
          :data-vv-scope="form.scope"
          :error="errors.first(`${form.scope}.${parameter.name}`)"
          :has-error="errors.has(`${form.scope}.${parameter.name}`)"
          :name="parameter.name"
          class="m-b-sm"
        >
          {{ translateLabel(parameter) }}
        </fb-md-form-checkbox>
      </template>
    </template>
  </fb-modal-form>
</template>

<script>
  import {
    IO_SERVER_THING_CONFIGURATION_NUMBER,
    IO_SERVER_THING_CONFIGURATION_SELECT,
    IO_SERVER_THING_CONFIGURATION_TEXT,
    IO_SERVER_THING_CONFIGURATION_BOOLEAN,
  } from '@/api/server/types'

  import {
    MANUFACTURER_GENERIC,
  } from '@/constants'

  import ThingConfiguration from '@/store/modules/io-server/ThingConfiguration'
  import Hardware from '@/store/modules/io-server/Hardware'

  import { WAMP_TOPIC_THING } from '@/config'

  export default {

    name: 'ThingsEditThingModuleConfiguration',

    props: {

      thing: {
        type: Object,
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      keyPrefix: {
        type: String,
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
          scope: 'io_server_thing_edit_module_configuration',
          model: [],
          types: {
            number: IO_SERVER_THING_CONFIGURATION_NUMBER,
            select: IO_SERVER_THING_CONFIGURATION_SELECT,
            text: IO_SERVER_THING_CONFIGURATION_TEXT,
            checkbox: IO_SERVER_THING_CONFIGURATION_BOOLEAN,
          },
        },
      }
    },

    computed: {

      /**
       * Get thing hardware info
       *
       * @returns {Hardware}
       */
      hardware() {
        return Hardware
          .query()
          .where('thing_id', this.thing.id)
          .first()
      },

      /**
       * Get all thing configuration parameters
       *
       * @returns {Array}
       */
      parameters() {
        const parameters = ThingConfiguration
          .query()
          .where('thing_id', this.thing.id)
          .orderBy('name')
          .all()

        const filtered = []

        parameters
          .forEach(item => {
            if (this._.get(item, 'name').indexOf(this.keyPrefix) === 0) {
              filtered.push(item)
            }
          })

        return filtered
      },
    },

    watch: {

      'thing.state'(val) {
        if (val) {
          this._initModel()
        }
      },

      parameters() {
        this._initModel()
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
       * Translate parameter form label
       *
       * @returns {String}
       */
      translateLabel(parameter) {
        if (this._.get(this.hardware, 'model', null) === MANUFACTURER_GENERIC) {
          if (parameter.title !== null) {
            return parameter.title
          }

          return parameter.name
        }

        if (this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.${parameter.name}.button`).indexOf('things.vendors.') === -1) {
          return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.${parameter.name}.button`)
        }

        return parameter.name
      },

      /**
       * Translate parameter field description
       *
       * @returns {(String|null)}
       */
      translateDescription(parameter) {
        if (this._.get(this.hardware, 'model', null) === MANUFACTURER_GENERIC) {
          if (parameter.description !== null) {
            return parameter.description
          }

          return null
        }

        if (this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.${parameter.name}.description`).indexOf('things.vendors.') === -1) {
          return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.${parameter.name}.description`)
        }

        return null
      },

      /**
       * Parse parameter items for select box
       *
       * @returns {Array}
       */
      getParameterItems(parameter) {
        const items = []

        for (const key in parameter.values) {
          if (parameter.values.hasOwnProperty(key)) {
            items.push({
              'value': parameter.values[key].value,
              'name': this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.${parameter.name}.values.${parameter.values[key].name}`),
            })
          }
        }

        return items
      },

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
              let topic = WAMP_TOPIC_THING
              topic = topic.replace('{thing_id}', this.thing.id)

              const data = {}

              for (const key in this.form.model) {
                if (this.form.model.hasOwnProperty(key)) {
                  data[key] = this.form.model[key]
                }
              }

              this.$wamp.call(topic, {
                action: 'thing.configure',
                payload: data,
              })
                .then(cmdResult => {
                  if (this._.get(cmdResult, 'response') === 'accepted') {
                    ThingConfiguration.update({
                      where: this.parameter.id,
                      data: {
                        value: this.form.model,
                      },
                    })
                      .catch(() => {
                        // Something went wrong
                      })
                  } else {
                    // Something went wrong
                  }
                })
                .catch(() => {
                  // Something went wrong
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
        this.parameters
          .forEach(item => {
            this.form.model[item.name] = item.value === null ? item.default : item.value
          })

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>
