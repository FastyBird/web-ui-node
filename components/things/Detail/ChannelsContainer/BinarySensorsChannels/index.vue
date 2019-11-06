<template>
  <channels-container :heading="$tc('heading', channels.length)">
    <channel-container
      v-for="channel in channels"
      :key="channel.id"
      :thing="thing"
      :channel="channel"
    >
      <template slot="channel">
        <template v-if="!thing.state">
          {{ $t('states.notAvailable.title') }}
        </template>
        <template v-else-if="propertyValue === true">
          {{ $t('states.on.title') }}
        </template>
        <template v-else>
          {{ $t('states.off.title') }}
        </template>
      </template>
    </channel-container>
  </channels-container>
</template>

<script>
  import ChannelContainer from '@/components/things/Detail/ChannelContainer'
  import ChannelsContainer from '@/components/things/Detail/ChannelsContainer'

  export default {

    name: 'ThingsDetailChannelsContainerBinarySensorsChannels',

    components: {
      ChannelContainer,
      ChannelsContainer,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channels: {
        type: Array,
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
