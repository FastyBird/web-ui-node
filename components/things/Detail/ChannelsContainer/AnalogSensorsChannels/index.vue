<template>
  <channels-container :heading="$tc('heading', channels.length)">
    <channel-container
      v-for="channel in channels"
      :key="channel.id"
      :thing="thing"
      :channel="channel"
    >
      <template slot="channel">
        <template v-if="thing.state">
          <span class="fb-iot-things-detail-channel-analog__value">{{ propertyValue }}</span>
          <span class="fb-iot-things-detail-channel-analog__units">{{ _.get(channel.stateProperty, 'units', null) }}</span>
        </template>
        <template v-else>
          <span class="fb-iot-things-detail-channel-analog__value">{{ $t('states.notAvailable.title') }}</span>
        </template>
      </template>
    </channel-container>
  </channels-container>
</template>

<script>
  import ChannelContainer from '@/components/things/Detail/ChannelContainer'
  import ChannelsContainer from '@/components/things/Detail/ChannelsContainer'

  export default {

    name: 'ThingsDetailChannelsContainerAnalogSensorsChannels',

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

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
