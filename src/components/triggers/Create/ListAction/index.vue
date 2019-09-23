<template>
  <li class="media">
    <div class="media-middle media-left">
      <font-awesome-icon
        icon="plug"
        class="sq-48"
      />
    </div>
    <div class="media-middle media-body">
      <h5 class="m-y-0">
        {{ thing.label }}
      </h5>

      <small>{{ $tChannel(thing, channel) }} - {{ $tChannelProperty(thing, channel, property) }}: {{ action.parameter }}</small>
    </div>
    <div class="media-middle media-right">
      <fb-button
        variant="outline-primary"
        size="sm"
        @click.prevent="$emit('remove')"
      >
        {{ $t('application.buttons.remove.title') }}
      </fb-button>
    </div>
  </li>
</template>

<script>
  import Thing from '@/plugins/io-server/store/modules/io-server/Thing'
  import Channel from '@/plugins/io-server/store/modules/io-server/Channel'
  import ChannelProperty from '@/plugins/io-server/store/modules/io-server/ChannelProperty'

  export default {

    name: 'TriggersCreateListAction',

    props: {

      action: {
        type: Object,
        required: true,
      },

    },

    computed: {

      thing() {
        return Thing.find(this.action.thing)
      },

      channel() {
        return Channel.find(this.action.channel)
      },

      property() {
        if (!this.triggerState) {
          return ChannelProperty.find(this.action.property)
        }

        return null
      },

    },

  }
</script>
