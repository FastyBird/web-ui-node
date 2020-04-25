<template>
  <fb-confirmation-window
    :transparent-bg="transparentBg"
    icon="trash"
    @confirmed="remove"
    @close="close"
  >
    <template slot="header">
      {{ $t('things.headings.remove') }}
    </template>

    <template slot="question">
      <i18n
        path="things.messages.confirmRemove"
        tag="p"
      >
        <strong slot="thing">{{ $tThingChannel(thing) }}</strong>
      </i18n>
    </template>
  </fb-confirmation-window>
</template>

<script>
import Device from '~/models/devices-node/Device'

export default {

  name: 'ThingsSettingsRemove',

  props: {

    thing: {
      type: Object,
      required: true,
    },

    transparentBg: {
      type: Boolean,
      default: false,
    },

  },

  mounted() {
    this.$emit('loaded')
  },

  methods: {

    /**
     * Remove selected thing
     *
     * @param {Object} event
     */
    remove(event) {
      event && event.preventDefault()

      const errorMessage = this.$t('things.messages.notRemoved', {
        thing: this.$tThingChannel(this.thing),
      })

      Device.dispatch('remove', {
        id: this.thing.id,
      })
        .catch((e) => {
          if (this._.get(e, 'exception', null) !== null) {
            this.handleFormError(e.exception, errorMessage)
          } else {
            this.$flashMessage(errorMessage, 'error')
          }
        })

      this.$emit('removed')
    },

    /**
     * Close thing remove confirmation window
     *
     * @param {Object} event
     */
    close(event) {
      event && event.preventDefault()

      this.$emit('close')
    },

  },

}
</script>
