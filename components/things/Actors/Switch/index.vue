<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-things-switch__container"
    role="button"
  >
    <fb-switch-element
      v-if="property.command === null"
      :status="propertyValue"
      :disabled="!thing.state"
      variant="primary"
      @change="toggleChannelState"
    />

    <div
      v-show="property.command === 'ok' || property.command === 'err'"
      class="fb-things-switch__result"
    >
      <font-awesome-icon
        v-show="property.command === 'err'"
        icon="ban"
        class="pos-r fb-things-switch__result-err"
      />
      <font-awesome-icon
        v-show="property.command === 'ok'"
        icon="check"
        class="pos-r fb-things-switch__result-ok"
      />
    </div>

    <div
      v-show="property.command !== null && property.command !== 'ok' && property.command !== 'err'"
      class="fb-things-switch__loading"
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
      if (this.property.command !== null) {
        return
      }

      // Check if thing is connected to server
      if (this.thing.state === false) {
        this.$flashMessage(this.$t('things.messages.notOnline', {
          thing: this.$tThingChannel(this.thing),
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

      this.$controlChannel(this.property, `${newValue}`)
        .catch(() => {
          this.$flashMessage(this.$t('things.messages.commandNotAccepted', {
            thing: this.$tThingChannel(this.thing),
          }), 'error')
        })
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
