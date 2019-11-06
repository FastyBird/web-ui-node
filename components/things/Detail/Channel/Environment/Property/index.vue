<template>
  <things-detail-channel-container
    :thing="thing"
    :channel="channel"
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-environment-property__container"
  >
    <template slot="icon">
      <font-awesome-icon :icon="$channelPropertyIcon(thing, channel, property)" />
    </template>

    <template slot="heading">
      {{ $tChannelProperty(thing, channel, property) }}
    </template>

    <template slot="sub-heading">
      {{ $tChannel(thing, channel) }}
    </template>

    <div
      slot="channel"
      class="fb-iot-things-detail-channel-environment-property__value-container p-r-sm"
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
  import number from '@/helpers/number'

  const ThingsDetailChannelContainer = () => import('../../../ChannelContainer')

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
        return this.$store.getters['entities/hardware/query']()
          .where('thing_id', this.thing.id)
          .first()
      },

      /**
       * Get value for current property
       *
       * @returns {String}
       */
      value() {
        const propertyValue = this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.channel.id)
          .where('property_id', this.property.id)
          .first()

        return propertyValue !== null ? this._formatValue(propertyValue.value) : '-'
      },

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

<i18n src="./locales.json" />
