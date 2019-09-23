<template>
  <div
    :data-state="thing.exchange_data_ok && thing.state ? 'on' : 'off'"
    class="fb-iot-things-channels-switch__container text-center"
    role="button"
  >
    <switch-element
      v-if="propertyCommand === null"
      :status="propertyValue"
      :disabled="!thing.exchange_data_ok || !thing.state"
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

  import ChannelPropertyValue from '@/plugins/io-server/store/modules/io-server/ChannelPropertyValue'

  import {
    DATA_TYPE_BOOLEAN,
    DATA_TYPE_ENUM,

    PROPERTY_TYPE_STATE,
  } from '@/constants'

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

    data() {
      return {
        property: this._.find(this.channel.properties, { 'property': PROPERTY_TYPE_STATE }),
      }
    },

    computed: {

      /**
       * Get property socket data
       *
       * @returns {(ChannelPropertyValue|null)}
       */
      propertySocket() {
        if (this.property === undefined) {
          return null
        }

        return ChannelPropertyValue
          .query()
          .where('channel_id', this.channel.id)
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
          if (this.property.data_type === DATA_TYPE_BOOLEAN) {
            return !!this.propertySocket.value
          } else if (this.property.data_type === DATA_TYPE_ENUM) {
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

        if (this.property === undefined) {
          return
        }

        let payload = ''

        if (this.property.data_type === DATA_TYPE_BOOLEAN) {
          payload = !this.propertyValue
        } else if (this.property.data_type === DATA_TYPE_ENUM) {
          payload = this.propertyValue ? 'off' : 'on'
        }

        this.$ioServerChannelPropertySocket.createCommand(
          this.thing,
          this.channel,
          this.property,
          payload,
        )
          .then(result => {
            this.$wamp.call(result.topic, result.value)
              .then(cmdResult => {
                this.$ioServerChannelPropertySocket.clearCommand(
                  this.thing,
                  this.channel,
                  this.property,
                  this._.get(cmdResult, 'response') === 'accepted',
                )
              })
              .catch(() => {
                this._commandFailed()
              })
          })
          .catch(() => {
            this._commandFailed()
          })
      },

      /**
       * On command failed callback
       *
       * @private
       */
      _commandFailed() {
        this.$ioServerChannelPropertySocket.clearCommand(
          this.thing,
          this.channel,
          this.property,
          false,
        )

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
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
