<template>
  <channels-container :heading="$tc('heading', channels.length)">
    <energy-meter
      v-for="channel in channels"
      :key="channel.id"
      :thing="thing"
      :channel="channel"
    />
  </channels-container>
</template>

<script>
  import ChannelsContainer from '@/components/things/Detail/ChannelsContainer'

  import EnergyMeter from '@/components/things/Detail/Channel/EnergyMeter'

  export default {

    name: 'ThingsDetailChannelsContainerEnergyMetersChannels',

    components: {
      ChannelsContainer,

      EnergyMeter,
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

<i18n src="./locales.json" />
