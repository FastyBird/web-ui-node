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

      <small v-if="triggerState">State: {{ condition.parameters }}</small>
      <small v-else>{{ triggerChannel.label }} - {{ triggerProperty.name }}: {{ condition.parameters }} {{ condition.value }}</small>
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
  import Thing from '@/store/modules/io-server/Thing'
  import Channel from '@/store/modules/io-server/Channel'
  import ChannelProperty from '@/store/modules/io-server/ChannelProperty'

  export default {

    name: 'TriggersCreateListCondition',

    props: {

      condition: {
        type: Object,
        required: true,
      },

    },

    computed: {

      thing() {
        return Thing.find(this.condition.thing)
      },

      triggerState() {
        return this.condition.trigger === 'state'
      },

      triggerChannel() {
        if (!this.triggerState) {
          return Channel
            .query()
            .with('properties')
            .where('id', this.condition.trigger)
            .first()
        }

        return null
      },

      triggerProperty() {
        if (!this.triggerState) {
          return ChannelProperty.find(this.condition.property)
        }

        return null
      },

    },

  }
</script>
