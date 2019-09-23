<template>
  <things-detail-channel-container
    :thing="thing"
    :channel="channel"
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-environment-property__container"
  >
    <template slot="icon">
      <device-icon
        :name="icon"
        class="fb-iot-things-detail-channel-environment-property__icon"
      />
    </template>

    <div
      slot="name"
      class="fb-iot-things-detail-channel-environment-property__heading m-t-sm"
    >
      <h5 class="fw-b m-y-0">
        {{ $tChannelProperty(thing, channel, property) }}
      </h5>
      <small>{{ $tChannel(thing, channel) }}</small>
    </div>

    <div
      slot="channel"
      class="fb-iot-things-detail-channel-environment-property__value-container"
    >
      <template v-if="thing.state">
        <span class="fb-iot-things-detail-channel-environment-property__value">{{ value }}</span>
        <span class="fb-iot-things-detail-channel-environment-property__units">{{ _.get(property, 'units', null) }}</span>
      </template>
      <template v-else>
        <span class="fb-iot-things-detail-channel-environment-property__value">{{ $t('states.notAvailable.title') }}</span>
      </template>
    </div>
  </things-detail-channel-container>
</template>

<script>
  import {
    MANUFACTURER_GENERIC,
    MANUFACTURER_ITEAD,
  } from '@/constants'

  import number from '@/helpers/number'

  const ThingsDetailChannelContainer = () => import('../../../ChannelContainer')

  import ChannelPropertyValue from '@/plugins/io-server/store/modules/io-server/ChannelPropertyValue'
  import Hardware from '@/plugins/io-server/store/modules/io-server/Hardware'

  export default {

    name: 'ThingsDetailChannelEnergyProperty',

    components: {
      ThingsDetailChannelContainer,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
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
        return Hardware
          .query()
          .where('thing_id', this.thing.id)
          .first()
      },

      /**
       * Get value for current property
       *
       * @returns {String}
       */
      value() {
        const propertyValue = ChannelPropertyValue
          .query()
          .where('channel_id', this.channel.id)
          .where('property_id', this.property.id)
          .first()

        return propertyValue !== null ? this._formatValue(propertyValue.value) : '-'
      },

      /**
       * Get icon for current property
       *
       * @returns {String}
       */
      icon() {
        switch (this.property.property) {
          case 'temperature':
            return 'thermometer'

          case 'humidity':
            return 'humidity'

          case 'air_quality':
            return 'fan'

          case 'light_level':
            return 'luminosity'

          case 'noise_level':
            return 'mic'
        }

        return 'generic-analog'
      },

    },

    methods: {

      _formatValue(value) {
        if (this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC) === MANUFACTURER_ITEAD) {
          switch (this.property.property) {
            case 'air_quality':
              if (value > 7) {
                return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${this._.get(this.property, 'name', 'none')}.values.unhealthy`)
              } else if (value > 4) {
                return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${this._.get(this.property, 'name', 'none')}.values.moderate`)
              }

              return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${this._.get(this.property, 'name', 'none')}.values.good`)

            case 'light_level':
              if (value > 8) {
                return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${this._.get(this.property, 'name', 'none')}.values.dusky`)
              } else if (value > 4) {
                return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${this._.get(this.property, 'name', 'none')}.values.normal`)
              }

              return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${this._.get(this.property, 'name', 'none')}.values.bright`)

            case 'noise_level':
              if (value > 6) {
                return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${this._.get(this.property, 'name', 'none')}.values.noisy`)
              } else if (value > 3) {
                return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${this._.get(this.property, 'name', 'none')}.values.normal`)
              }

              return this.$t(`things.vendors.${this._.get(this.hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${this._.get(this.property, 'name', 'none')}.values.quiet`)
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

<i18n src="./locales.json" />
