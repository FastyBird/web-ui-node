<template>
  <div
    v-if="thing && channel && property"
    class="list-group-item"
  >
    <span
      v-if="removingEnabled"
      class="pull-right"
      role="button"
      @click.prevent="remove()"
    >
      <font-awesome-icon icon="trash" />
    </span>
    {{ thing.label }} | {{ $tChannel(thing, channel) }}
    <small class="d-b">
      {{ $tChannelProperty(thing, channel, property) }}: {{ action.value }}
    </small>
  </div>
  <div
    v-else
    class="p-y-lg"
  >
    <span class="spinner spinner-primary spinner-sm" />
  </div>
</template>

<script>
  export default {

    name: 'RoutinesDetailActionChannelProperty',

    props: {

      action: {
        type: Object,
        required: true,
      },

      removingEnabled: {
        type: Boolean,
        required: false,
        default: true,
      },

    },

    computed: {

      /**
       * Action thing
       *
       * @returns {(Thing|null)}
       */
      thing() {
        return this.channel !== null ? this.$store.getters['entities/thing/find'](this.channel.thing_id) : null
      },

      /**
       * Action channel
       *
       * @returns {(Channel|null)}
       */
      channel() {
        return this.$store.getters['entities/channel/query']()
          .with('properties')
          .where('id', this.action.channel_id)
          .first()
      },

      /**
       * Action channel property
       *
       * @returns {(ChannelProperty|null)}
       */
      property() {
        return this.$store.getters['entities/channel_property/find'](this.action.property_id)
      },

    },

    methods: {

      remove() {
        this.$emit('remove', this.action)
      },

    },

  }
</script>
