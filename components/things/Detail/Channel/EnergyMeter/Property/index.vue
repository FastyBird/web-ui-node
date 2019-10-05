<template>
  <things-detail-channel-container
    :thing="thing"
    :channel="channel"
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-energy-property__container"
  >
    <template slot="icon">
      <device-icon
        :name="icon"
        class="fb-iot-things-detail-channel-energy-property__icon"
      />
    </template>

    <div
      slot="name"
      class="fb-iot-things-detail-channel-energy-property__heading m-t-sm"
    >
      <h5 class="fw-b m-y-0">
        {{ $tChannelProperty(thing, channel, property) }}
      </h5>
      <small>{{ $tChannel(thing, channel) }}</small>
    </div>

    <div
      slot="channel"
      class="fb-iot-things-detail-channel-energy-property__value-container"
    >
      <template v-if="thing.state">
        <span class="fb-iot-things-detail-channel-energy-property__value">{{ value }}</span>
        <span class="fb-iot-things-detail-channel-energy-property__units">{{ _.get(property, 'units', null) }}</span>
      </template>
      <template v-else>
        <span class="fb-iot-things-detail-channel-energy-property__value">{{ $t('states.notAvailable.title') }}</span>
      </template>

      <fb-button
        v-if="thing.state && _.get(property, 'is_settable', false)"
        variant="outline-primary"
        size="xs"
        class="cursor-pointer circle"
        @click.prevent="$emit('clear')"
      >
        <font-awesome-icon icon="sync-alt" />
      </fb-button>
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
       * Get value for current property
       *
       * @returns {String}
       */
      value() {
        const propertyValue = this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.channel.id)
          .where('property_id', this.property.id)
          .first()

        return propertyValue !== null ? number.format(parseFloat(propertyValue.value), 2, ',', ' ') : '-'
      },

      /**
       * Get icon for current property
       *
       * @returns {String}
       */
      icon() {
        switch (this.property.property) {
          case 'power':
            return 'plug'

          case 'current':
          case 'voltage':
            return 'bolt'

          case 'energy':
            return 'odometer'
        }

        return 'plug'
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
