<template>
  <div
    :data-state="_.get(thing, 'device.socket') !== null && thing.state ? 'on' : 'off'"
    class="fb-iot-things-switch__container"
    role="button"
  >
    <fb-switch-element
      v-if="propertyCommand === null"
      :status="propertyValue"
      :disabled="!thing.state || _.get(thing, 'device.socket') === null"
      variant="primary"
      @change="toggleChannelState"
    />

    <div
      v-show="propertyCommand === 'ok' || propertyCommand === 'err'"
      class="fb-iot-things-switch__result"
    >
      <font-awesome-icon
        v-show="propertyCommand === 'err'"
        icon="ban"
        class="pos-r fb-iot-things-switch__result-err"
      />
      <font-awesome-icon
        v-show="propertyCommand === 'ok'"
        icon="check"
        class="pos-r fb-iot-things-switch__result-ok"
      />
    </div>

    <div
      v-show="propertyCommand !== null && propertyCommand !== 'ok' && propertyCommand !== 'err'"
      class="fb-iot-things-switch__loading"
    >
      <fb-spinner
        variant="primary"
        size="sm"
      />
    </div>
  </div>
</template>

<script>
  export default {

    name: 'ThingsActorsSwitch',

    props: {

      thing: {
        type: Object,
        required: true,
      },

      property: {
        type: Object,
        required: true,
      },

    },

    computed: {

      /**
       * Get property socket data
       *
       * @returns {(ChannelPropertyValue|null)}
       */
      propertySocket() {
        if (!this.property) {
          return null
        }

        return this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.thing.channel_id)
          .where('property_id', this.property.id)
          .first()
      },

      /**
       * Get channel state property value
       *
       * @returns {Boolean}
       */
      propertyValue() {
        if (this.propertySocket) {
          if (this.property.isBoolean) {
            return !!this.propertySocket.value
          } else if (this.property.isEnum) {
            return this.propertySocket.value === 'on'
          }
        }

        return false
      },

      /**
       * Channel command status
       *
       * @returns {(String|null)}
       */
      propertyCommand() {
        return this.propertySocket ? this.propertySocket.command : null
      },

    },

    methods: {

      /**
       * Toggle channel button state
       */
      toggleChannelState() {
        // Check if some command on channel is in progress
        if (this.propertyCommand !== null) {
          return
        }

        // Check if thing is connected to cloud
        if (this.thing.state !== true) {
          this.$flashMessage(this.$t('things.messages.notOnline', {
            thing: this.$tThing(this.thing),
          }), 'error')

          return
        }

        if (!this.property) {
          return
        }

        this.$store.dispatch('entities/channel_property_value/togglePayload', {
          device_id: this.thing.device_id,
          channel_id: this.thing.channel_id,
          property_id: this.property.id,
        }, {
          root: true,
        })
          .catch(() => {
            this.$flashMessage(this.$t('things.messages.commandNotAccepted', {
              thing: this.$tThing(this.thing),
            }), 'error')
          })
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
