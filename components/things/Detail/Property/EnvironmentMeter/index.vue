<template>
  <property-container
    :thing="thing"
    :property="property"
    :data-state="thing.state ? 'on' : 'off'"
  >
    <div
      slot="property"
      class="fb-iot-things-detail-environment-property__value-container"
    >
      <template v-if="thing.state">
        <span class="fb-iot-things-detail-environment-property__value">{{ propertyValue }}</span>
        <span class="fb-iot-things-detail-environment-property__units">{{ _.get(property, 'units', null) }}</span>
      </template>
      <template v-else>
        <span class="fb-iot-things-detail-environment-property__value">{{ $t('application.states.notAvailable') }}</span>
      </template>

      <fb-button
        v-if="thing.state && _.get(property, 'is_settable', false)"
        variant="outline-primary"
        size="xs"
        @click.prevent="$emit('clear')"
      >
        <font-awesome-icon icon="sync-alt" />
      </fb-button>
    </div>
  </property-container>
</template>

<script>
  import number from '@/helpers/number'

  import PropertyContainer from '../../PropertyContainer'

  export default {

    name: 'ThingsDetailPropertyEnergyMeter',

    components: {
      PropertyContainer,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      property: {
        type: Object,
        required: true,
      },

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
       * Get property value
       *
       * @returns {(Number|String)}
       */
      propertyValue() {
        const propertyValue = this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.thing.channel_id)
          .where('property_id', this.property.id)
          .first()

        return propertyValue !== null ? this._formatValue(propertyValue.value) : '-'
      },

    },

    created() {
      this.transparentModal = this.$parent.$options.name !== 'Layout'
    },

    methods: {

      _formatValue(value) {
        if (this._.get(this.hardware, 'isManufacturerItead')) {
          switch (this.property.property) {
            case 'air_quality':
              if (value > 7) {
                return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this._.get(this.property, 'name', 'none')}.values.unhealthy`)
              } else if (value > 4) {
                return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this._.get(this.property, 'name', 'none')}.values.moderate`)
              }

              return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this._.get(this.property, 'name', 'none')}.values.good`)

            case 'light_level':
              if (value > 8) {
                return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this._.get(this.property, 'name', 'none')}.values.dusky`)
              } else if (value > 4) {
                return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this._.get(this.property, 'name', 'none')}.values.normal`)
              }

              return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this._.get(this.property, 'name', 'none')}.values.bright`)

            case 'noise_level':
              if (value > 6) {
                return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this._.get(this.property, 'name', 'none')}.values.noisy`)
              } else if (value > 3) {
                return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this._.get(this.property, 'name', 'none')}.values.normal`)
              }

              return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this._.get(this.property, 'name', 'none')}.values.quiet`)
          }
        }

        return number.format(parseFloat(value), 2, ',', ' ')
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
