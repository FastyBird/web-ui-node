<template>
  <property-container
    :thing="thing"
    :property="property"
  >
    <switch-actor
      slot="property"
      :thing="thing"
      :property="property"
    />
  </property-container>
</template>

<script>
import PropertyContainer from '../../PropertyContainer'

import SwitchActor from '@/components/things/Actors/Switch'

export default {

  name: 'ThingsDetailPropertyBinaryActor',

  components: {
    PropertyContainer,

    SwitchActor,
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

}
</script>
