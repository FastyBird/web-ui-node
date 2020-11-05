<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-things-switch__container"
    role="button"
  >
    <fb-ui-switch-element
      v-if="command === null"
      :status="propertyValue"
      :disabled="!thing.state"
      variant="primary"
      @change="toggleChannelState"
    />

    <div
      v-show="command === true || command === false"
      class="fb-things-switch__result"
    >
      <font-awesome-icon
        v-show="command === false"
        icon="ban"
        class="pos-r fb-things-switch__result-err"
      />
      <font-awesome-icon
        v-show="command === true"
        icon="check"
        class="pos-r fb-things-switch__result-ok"
      />
    </div>

    <div
      v-show="command !== null && command !== true && command !== false"
      class="fb-things-switch__loading"
    >
      <fb-ui-spinner
        variant="primary"
        size="sm"
      />
    </div>
  </div>
</template>

<script>
import ChannelProperty from '@/models/devices-node/channel-properties/ChannelProperty'

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

  data() {
    return {
      command: null,
    }
  },

  computed: {

    /**
     * Get channel state property value
     *
     * @returns {Boolean}
     */
    propertyValue() {
      if (this.property.isBoolean) {
        return !!this.property.value
      } else if (this.property.isEnum) {
        return this.property.value === 'on'
      }

      return false
    },

  },

  methods: {

    /**
     * Toggle channel button state
     */
    toggleChannelState() {
      // Check if some command on channel is in progress
      if (this.command !== null) {
        return
      }

      // Check if thing is connected to server
      if (this.thing.state === false) {
        this.$flashMessage(this.$t('things.messages.notOnline', {
          thing: this.thing.channel.title,
        }), 'error')

        return
      }

      let actualValue = false

      if (this.property.isBoolean) {
        actualValue = !!this.property.value
      } else if (this.property.isEnum) {
        actualValue = this.property.value === 'on'
      }

      let newValue = ''

      if (this.property.isBoolean) {
        newValue = !actualValue
      } else if (this.property.isEnum) {
        newValue = actualValue ? 'off' : 'on'
      }

      this.command = 'working'

      ChannelProperty.dispatch('transmitData', {
        property: this.property,
        value: `${newValue}`,
      })
        .then(() => {
          this.command = true

          this.$timer.start('resetCommand')
        })
        .catch(() => {
          this.command = false

          this.$flashMessage(this.$t('things.messages.commandNotAccepted', {
            thing: this.thing.channel.title,
          }), 'error')

          this.$timer.start('resetCommand')
        })
    },

    resetCommand() {
      this.command = null

      this.$timer.stop('resetCommand')
    },

  },

  timers: {
    resetCommand: {
      time: 500,
    },
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
