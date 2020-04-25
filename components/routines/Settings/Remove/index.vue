<template>
  <fb-confirmation-window
    :transparent-bg="transparentBg"
    icon="trash"
    @confirmed="remove"
    @close="close"
  >
    <template slot="header">
      {{ $t('routines.headings.remove') }}
    </template>

    <template slot="question">
      <i18n
        path="routines.messages.confirmRemove"
        tag="p"
      >
        <strong slot="routine">{{ routine.name }}</strong>
      </i18n>
    </template>
  </fb-confirmation-window>
</template>

<script>
import Trigger from '~/models/triggers-node/Trigger'

export default {

  name: 'RoutinesRemove',

  props: {

    routine: {
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
     * Remove selected routine
     *
     * @param {Object} event
     */
    remove(event) {
      event && event.preventDefault()

      const errorMessage = this.$t('routines.messages.notRemoved', {
        routine: this.routine.name,
      })

      Trigger.dispatch('remove', {
        id: this.routine.id,
      })
        .catch((e) => {
          if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
            this.handleFormError(e.exception, errorMessage)
          } else {
            this.$flashMessage(errorMessage, 'error')
          }
        })

      this.$emit('removed')
    },

    /**
     * Close routine remove confirmation window
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
