<template>
  <property-container
    :thing="thing"
    :property="property"
  >
    <template slot="property">
      <template v-if="!thing.state">
        {{ $t('application.states.notAvailable') }}
      </template>
      <template v-else-if="propertyValue === true">
        {{ $t('application.states.on') }}
      </template>
      <template v-else>
        {{ $t('application.states.off') }}
      </template>
    </template>
  </property-container>
</template>

<script>
  import PropertyContainer from '../../PropertyContainer'

  export default {

    name: 'ThingsDetailPropertyBinarySensor',

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
       * @returns {Boolean}
       */
      propertyValue() {
        const propertyValue = this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.thing.channel_id)
          .where('property_id', this.property.id)
          .first()

        if (propertyValue) {
          if (this.property.isBoolean) {
            return !!propertyValue.value
          } else if (this.property.isEnum) {
            return propertyValue.value === 'on'
          }
        }

        return false
      },

    },

  }
</script>
