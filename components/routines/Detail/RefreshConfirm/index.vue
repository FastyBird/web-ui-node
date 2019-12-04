<template>
  <fb-confirmation-window
    :show-no="false"
    icon="sync-alt"
    primary-button="yes"
    text="info"
    @confirmed="update"
    @close="close"
  >
    <template slot="header">
      {{ $t('routines.headings.refresh') }}
    </template>

    <template slot="question">
      <i18n
        path="routines.messages.confirmRefresh"
        tag="p"
      >
        <strong slot="routine">{{ routine.name }}</strong>
      </i18n>
    </template>
  </fb-confirmation-window>
</template>

<script>
  export default {

    name: 'RoutinesDetailRefreshConfirm',

    props: {

      routine: {
        type: Object,
        required: true,
      },

    },

    methods: {

      /**
       * Update selected routine
       *
       * @param {Object} event
       */
      update(event) {
        event && event.preventDefault()

        const errorMessage = this.$t('routines.messages.notRefreshed', {
          routine: this.routine.name,
        })

        this.$store.dispatch('entities/trigger/refreshFromQueue', {
          id: this.routine.id,
          queue: 'update',
        }, {
          root: true,
        })
          .catch(e => {
            if (e.hasOwnProperty('exception')) {
              this.handleFormError(e.exception, errorMessage)
            } else {
              this.$flashMessage(errorMessage, 'error')
            }
          })

        this.$emit('refreshed')
      },

      /**
       * Close routine update confirmation window
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
