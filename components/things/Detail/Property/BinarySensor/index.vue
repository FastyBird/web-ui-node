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
      if (this.property.isBoolean) {
        return !!this.property.value
      } else if (this.property.isEnum) {
        return this.property.value === 'on'
      }

      return false
    },

  },

}
</script>
