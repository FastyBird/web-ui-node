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
        return this.$store.getters['entities/thing/find'](this.action.thing)
      },

      channel() {
        return this.$store.getters['entities/channel/find'](this.action.channel)
      },

      property() {
        if (!this.triggerState) {
          return this.$store.getters['entities/channel_property/find'](this.action.property)
        }

        return null
      },

    },

  }
</script>
