<template>
  <channels-container :heading="$tc('heading', channels.length)">
    <environment
      v-for="channel in channels"
      :key="channel.id"
      :thing="thing"
      :channel="channel"
    />
  </channels-container>
</template>

<script>
  import ChannelsContainer from '@/components/things/Detail/ChannelsContainer'

  import Environment from '@/components/things/Detail/Channel/Environment'

  export default {

    name: 'ThingsDetailChannelsContainerEnvironmentsChannels',

    components: {
      ChannelsContainer,

      Environment,
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
