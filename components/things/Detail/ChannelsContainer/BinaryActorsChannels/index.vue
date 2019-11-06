<template>
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
          class="pull-right"
        />
      </template>
    </channel-container>
  </channels-container>
</template>

<script>
  import ChannelContainer from '@/components/things/Detail/ChannelContainer'
  import ChannelsContainer from '@/components/things/Detail/ChannelsContainer'

  import SwitchActor from '../../../Channels/SwitchActor'

  export default {

    name: 'ThingsDetailChannelsContainerBinaryActorsChannels',

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
