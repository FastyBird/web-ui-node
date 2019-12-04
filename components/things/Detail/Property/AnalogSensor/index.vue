<template>
  <property-container
    :thing="thing"
    :property="property"
  >
    <template slot="property">
      <template v-if="thing.state">
        <span class="fb-iot-things-detail-analog-sensor__value">{{ propertyValue }}</span>
        <span class="fb-iot-things-detail-analog-sensor__units">{{ _.get(property, 'units', null) }}</span>
      </template>
      <template v-else>
        <span class="fb-iot-things-detail-analog-sensor__value">{{ $t('application.states.notAvailable') }}</span>
      </template>
    </template>
  </property-container>
</template>

<script>
  import PropertyContainer from '../../PropertyContainer'

  export default {

    name: 'ThingsDetailPropertyAnalogSensor',

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
       * Get property value
       *
       * @returns {Number}
       */
      propertyValue() {
        const propertyValue = this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.thing.channel_id)
          .where('property_id', this.property.id)
          .first()

        if (
          propertyValue &&
          (
            this.property.isInteger || this.property.isFloat || this.property.isNumber
          )
        ) {
          return parseFloat(propertyValue.value)
        }

        return 0.0
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
