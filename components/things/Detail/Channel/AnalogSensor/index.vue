<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-analog__container"
  >
    <template v-if="thing.state">
      <span class="fb-iot-things-detail-channel-analog__value">{{ propertyValue }}</span>
      <span class="fb-iot-things-detail-channel-analog__units">{{ _.get(channel.stateProperty, 'units', null) }}</span>
    </template>
    <template v-else>
      <span class="fb-iot-things-detail-channel-analog__value">{{ $t('states.notAvailable.title') }}</span>
    </template>
  </div>
</template>

<script>
  import number from '@/helpers/number'

  export default {

    name: 'ThingsDetailChannelAnalogSensor',

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
       * @returns {(String|null)}
       */
      propertyValue() {
        if (this.channel.stateProperty === undefined) {
          return null
        }

        const propertyValue = this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.channel.id)
          .where('property_id', this.channel.stateProperty.id)
          .first()

        return propertyValue !== null ? number.format(parseFloat(propertyValue.value), 2, ',', ' ') : 'N/A'
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
