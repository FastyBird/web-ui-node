<template web>
  <channels-container :heading="$tc('heading', channels.length)">
    <channel-container
      v-for="channel in channels"
      :key="channel.id"
      :thing="thing"
      :channel="channel"
    >
      <template slot="channel">
        <switch-actor
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

  import SwitchActor from '@/components/things/Detail/Channel/SwitchActor'

  export default {

    name: 'ThingsDetailChannelsContainerSwitchActorsChannels',

    components: {
      ChannelContainer,
      ChannelsContainer,

      SwitchActor,
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
