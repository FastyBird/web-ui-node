<template>
  <div :data-state="thing.state ? 'on' : 'off'">
    <template v-if="!thing.state">
      {{ $t('states.notAvailable.title') }}
    </template>
    <template v-else-if="propertyValue === true">
      {{ $t('states.on.title') }}
    </template>
    <template v-else>
      {{ $t('states.off.title') }}
    </template>
  </div>
</template>

<script>
  export default {

    name: 'ThingsDetailChannelBinarySensor',

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

    },

    computed: {

      /**
       * Get channel state property value
       *
       * @returns {Boolean}
       */
      propertyValue() {
        if (this.channel.stateProperty === undefined) {
          return false
        }

        const propertyValue = this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.channel.id)
          .where('property_id', this.channel.stateProperty.id)
          .first()

        if (propertyValue) {
          if (this.channel.stateProperty.isBoolean) {
            return !!propertyValue.value
          } else if (this.channel.stateProperty.isEnum) {
            return propertyValue.value === 'on'
          }
        }

        return false
      },

    },

  }
</script>

<i18n src="./locales.json" />
