<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-analog__container"
  >
    <template v-if="thing.state">
      <span class="fb-iot-things-detail-channel-analog__value">{{ propertyValue }}</span>
      <span class="fb-iot-things-detail-channel-analog__units">{{ _.get(property, 'units', null) }}</span>
    </template>
    <template v-else>
      <span class="fb-iot-things-detail-channel-analog__value">{{ $t('states.notAvailable.title') }}</span>
    </template>
  </div>
</template>

<script>
  import number from '@/helpers/number'

  import ChannelPropertyValue from '@/plugins/io-server/store/modules/io-server/ChannelPropertyValue'

  import {
    PROPERTY_TYPE_STATE,
  } from '@/constants'

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

    data() {
      return {
        property: this._.find(this.channel.properties, { 'property': PROPERTY_TYPE_STATE }),
      }
    },

    computed: {

      /**
       * Get channel state property value
       *
       * @returns {(String|null)}
       */
      propertyValue() {
        if (this.property === undefined) {
          return null
        }

        const propertyValue = ChannelPropertyValue
          .query()
          .where('channel_id', this.channel.id)
          .where('property_id', this.property.id)
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
