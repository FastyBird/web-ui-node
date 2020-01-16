<template>
  <settings-list-item
    v-if="parameter.isBoolean"
    class="fb-iot-things-settings-thing__item"
  >
    <fb-switch-element
      :ref="parameter.name"
      :status="parameter.value"
      :disabled="!thing.state"
      variant="primary"
      @change="$emit('submit')"
    />
    <template
      v-if="$t(`things.vendors.${hardware.manufacturer}.${parameter.name}.button`).indexOf('things.vendors.') === -1"
    >
      {{ $t(`things.vendors.${hardware.manufacturer}.${parameter.name}.button`) }}
    </template>
    <template v-else>
      {{ parameter.name }}
    </template>
  </settings-list-item>

  <settings-list-item
    v-else
    type="button"
    class="fb-iot-things-settings-thing__item"
    @click="$emit('openForm')"
  >
    <span class="fb-iot-things-settings-thing__item-icon">
      <font-awesome-icon icon="angle-right" />
    </span>
    <fb-spinner
      v-if="loading"
      size="sm"
    />
    <template
      v-if="$t(`things.vendors.${hardware.manufacturer}.${parameter.name}.button`).indexOf('things.vendors.') === -1"
    >
      {{ $t(`things.vendors.${hardware.manufacturer}.${parameter.name}.button`) }}
    </template>
    <template v-else>
      {{ parameter.name }}
    </template>
    <small>
      {{ $t('application.states.actual') }}:
      <template v-if="parameter.isSelect">
        <strong>{{ selectValue }}</strong>
      </template>
      <template v-else>
        <strong>{{ value }}</strong>
      </template>
    </small>
  </settings-list-item>
</template>

<script>
export default {

  name: 'ThingsSettingsChannelParameter',

  props: {

    thing: {
      type: Object,
      required: true,
    },

    parameter: {
      type: Object,
      required: true,
    },

    hardware: {
      type: Object,
      required: true,
    },

    loading: {
      type: Boolean,
      default: false,
    },

  },

  computed: {

    value() {
      const stored = this.$store.getters['entities/channel_configuration_value/query']()
        .where('channel_id', this.thing.channel_id)
        .where('configuration_id', this.parameter.id)
        .first()

      return stored !== null ? stored.value : 'N/A'
    },

    /**
     * Parse parameter items for select box
     *
     * @returns {String}
     */
    selectValue() {
      for (const key in this.parameter.values) {
        // eslint-disable-next-line
        if (this.parameter.values.hasOwnProperty(key) && this.parameter.values[key].value == this.value) {
          if (!this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.values.${this.parameter.values[key].name}`).includes('things.vendors.')) {
            return this.$t(`things.vendors.${this.hardware.manufacturer}.${this.parameter.name}.values.${this.parameter.values[key].name}`)
          } else {
            return this.value
          }
        }
      }

      return this.value
    },

  },

}
</script>
