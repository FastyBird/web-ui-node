<template web>
  <channels-container :heading="$tc('heading', channels.length)">
    <channel-container
      v-for="channel in channels"
      :key="channel.id"
      :thing="thing"
      :channel="channel"
    >
      <template slot="channel">
        <binary-actor
          :thing="thing"
          :channel="channel"
        />
      </template>
    </channel-container>
  </channels-container>
</template>

<script>
  import ChannelContainer from '@/components/things/Detail/ChannelContainer'
  import ChannelsContainer from '@/components/things/Detail/ChannelsContainer'

  import BinaryActor from '@/components/things/Detail/Channel/BinaryActor'

  export default {

    name: 'ThingsDetailChannelsContainerBinaryActorsChannels',

    components: {
      ChannelContainer,
      ChannelsContainer,

      BinaryActor,
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
