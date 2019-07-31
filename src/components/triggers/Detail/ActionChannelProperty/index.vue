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
    {{ thing.label }} | {{ channel.label }}
    <small class="d-b">
      {{ property.name }}:
      {{ action.value }}
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
  import Thing from '@/store/modules/io-server/Thing'
  import Channel from '@/store/modules/io-server/Channel'
  import ChannelProperty from '@/store/modules/io-server/ChannelProperty'

  export default {

    name: 'TriggersDetailActionChannelProperty',

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
        return this.channel !== null ? Thing.find(this.channel.thing_id) : null
      },

      /**
       * Action channel
       *
       * @returns {(Channel|null)}
       */
      channel() {
        return Channel
          .query()
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
        return ChannelProperty.find(this.action.property_id)
      },

    },

    methods: {

      remove() {
        this.$emit('remove', this.action)
      },

    },

  }
</script>
