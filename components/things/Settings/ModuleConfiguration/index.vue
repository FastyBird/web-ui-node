<template>
  <fb-modal-form
    v-if="thing !== null"
    :transparent-bg="transparentBg"
    :lock-submit-button="form.result !== null"
    icon="cogs"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ title }}
    </template>

    <template slot="form">
      <template v-if="form.result === null">
        <template v-for="(parameter, index) in parameters">
          <fb-form-input
            v-if="parameter.isNumber"
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
          >
            <template
              v-if="translateDescription(parameter) !== null && !errors.has(`${form.scope}.${parameter.name}`)"
              slot="help-line"
            >
              {{ translateDescription(parameter) }}
            </template>
          </fb-form-input>

          <fb-form-input
            v-if="parameter.isText"
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
          >
            <template
              v-if="translateDescription(parameter) !== null && !errors.has(`${form.scope}.${parameter.name}`)"
              slot="help-line"
            >
              {{ translateDescription(parameter) }}
            </template>
          </fb-form-input>

          <fb-form-select
            v-if="parameter.isSelect"
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
          >
            <template
              v-if="translateDescription(parameter) !== null && !errors.has(`${form.scope}.${parameter.name}`)"
              slot="help-line"
            >
              {{ translateDescription(parameter) }}
            </template>
          </fb-form-select>

          <fb-form-checkbox
            v-if="parameter.isBoolean"
            :key="index"
            v-model="form.model[parameter.name]"
            :data-vv-scope="form.scope"
            :error="errors.first(`${form.scope}.${parameter.name}`)"
            :has-error="errors.has(`${form.scope}.${parameter.name}`)"
            :name="parameter.name"
          >
            {{ translateLabel(parameter) }}
          </fb-form-checkbox>
        </template>
      </template>

      <result-ok v-if="form.result === true" />
    </template>
  </fb-modal-form>
</template>

<script>
export default {

  name: 'ThingsSettingsThingModuleConfiguration',

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
        result: null,
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
      return this.$store.getters['entities/hardware/query']()
        .where('device_id', this.thing.device_id)
        .first()
    },

    /**
     * Get all thing configuration parameters
     *
     * @returns {Array}
     */
    parameters() {
      return this.$store.getters['entities/device_configuration/query']()
        .where('device_id', this.thing.device_id)
        .where((item) => {
          return this._.get(item, 'name').indexOf(this.keyPrefix) === 0 &&
            this._.get(item, 'name').indexOf('sensor_expected_') !== 0
        })
        .orderBy('name')
        .all()
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
      if (this._.get(this.hardware, 'isCustom', true)) {
        if (parameter.title !== null) {
          return parameter.title
        }

        return parameter.name
      }

      if (!this.$t(`things.vendors.${this.hardware.manufacturer}.${parameter.name}.button`).includes('things.vendors.')) {
        return this.$t(`things.vendors.${this.hardware.manufacturer}.${parameter.name}.button`)
      }

      return parameter.name
    },

    /**
     * Translate parameter field description
     *
     * @returns {(String|null)}
     */
    translateDescription(parameter) {
      if (this._.get(this.hardware, 'isCustom', true)) {
        if (parameter.description !== null) {
          return parameter.description
        }

        return null
      }

      if (!this.$t(`things.vendors.${this.hardware.manufacturer}.${parameter.name}.description`).includes('things.vendors.')) {
        return this.$t(`things.vendors.${this.hardware.manufacturer}.${parameter.name}.description`)
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
        if (Object.prototype.hasOwnProperty.call(parameter.values, key)) {
          items.push({
            value: parameter.values[key].value,
            name: this.$t(`things.vendors.${this.hardware.manufacturer}.${parameter.name}.values.${parameter.values[key].name}`),
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
        .then((result) => {
          if (result) {
            this.parameters
              .forEach((parameter) => {
                if (Object.prototype.hasOwnProperty.call(this.form.model, parameter.name)) {
                  this.$store.dispatch('entities/device_configuration/edit', {
                    device_id: this.thing.device_id,
                    parameter_id: parameter.id,
                    data: this._.get(this.form.model, parameter.name),
                  }, {
                    root: true,
                  })
                }
              })

            this.form.result = true

            this.$timer.start('close')
          } else {
            this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')
          }
        })
        .catch(() => {
          this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')
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
        .forEach((item) => {
          this.form.model[item.name] = item.value === null ? item.default : item.value
        })

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
