<template>
  <switch-actor
    :thing="thing"
    :channel="channel"
    class="pull-right"
  />
</template>

<script>
  import SwitchActor from '../../../Channels/SwitchActor'

  export default {

    name: 'ThingsDetailChannelSwitch',

    components: {
      SwitchActor,
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

    },

  }
</script>
