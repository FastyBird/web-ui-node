<template>
  <div class="fb-routines-edit-condition-thing__channels_container p-t-sm">
    <template v-for="channel in channels">
      <template v-for="property in channel.properties">
        <channel-property
          :key="channel.id + '-' + property.id"
          v-model="model"
          :thing="thing"
          :channel="channel"
          :property="property"
          :condition="condition"
        />
      </template>
    </template>
  </div>
</template>

<script>
  import ChannelProperty from './../Property'

  export default {

    name: 'RoutinesEditEditConditionChannelsProperties',

    components: {
      ChannelProperty,
    },

    props: {

      value: {
        type: Array,
        required: true,
      },

      thing: {
        type: Object,
        required: true,
      },

      channels: {
        type: Array,
        required: true,
      },

      condition: {
        type: Object,
        default: null,
      },

    },

    computed: {

      model: {
        get() {
          return this.value
        },
      },

    },

  }
</script>
