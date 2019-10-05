<template>
  <div
    :data-state="thing.socket && thing.state ? 'on' : 'off'"
    class="fb-iot-things-channels-switch__container text-center"
    role="button"
  >
    <switch-element
      v-if="propertyCommand === null"
      :status="propertyValue"
      :disabled="!thing.state || thing.socket === null"
      @change="toggleChannelState()"
    />

    <div
      v-show="propertyCommand !== null"
      class="fb-iot-things-channels-switch__loading d-ib text-center"
    >
      <font-awesome-icon
        v-show="propertyCommand === 'err'"
        icon="ban"
        class="pos-r text-warning sq-32"
      />
      <font-awesome-icon
        v-show="propertyCommand === 'ok'"
        icon="check"
        class="pos-r text-primary sq-32"
      />
      <div
        v-show="propertyCommand !== 'ok' && propertyCommand !== 'err'"
        class="spinner spinner-primary pos-r sq-32"
      />
    </div>
  </div>
</template>

<script>
  import SwitchElement from '@/components/layout/SwitchElement'

  export default {

    name: 'ThingsChannelsSwitchActor',

    components: {
      SwitchElement,
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

    computed: {

      /**
       * Get property socket data
       *
       * @returns {(ChannelPropertyValue|null)}
       */
      propertySocket() {
        if (this.channel.stateProperty === undefined) {
          return null
        }

        return this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.channel.id)
          .where('property_id', this.channel.stateProperty.id)
          .first()
      },

      /**
       * Get channel state property value
       *
       * @returns {Boolean}
       */
      propertyValue() {
        if (this.propertySocket) {
          if (this.channel.stateProperty.isBoolean) {
            return !!this.propertySocket.value
          } else if (this.channel.stateProperty.isEnum) {
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
          this.$toasted.error(this.$t('things.messages.notOnline', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        if (this.channel.stateProperty === undefined) {
          return
        }

        this.$store.dispatch('entities/channel_property_value/togglePayload', {
          thing_id: this.thing.id,
          channel_id: this.channel.id,
          property_id: this.channel.stateProperty.id,
        }, {
          root: true,
        })
          .catch(() => {
            this.$toasted.error(this.$t('things.messages.commandNotAccepted', {
              thing: this.thing.label,
            }), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })
          })
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
