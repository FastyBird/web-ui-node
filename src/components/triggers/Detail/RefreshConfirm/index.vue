<template web>
  <fb-confirmation-window
    :show-no="false"
    icon="sync-alt"
    primary-button="yes"
    text="info"
    @confirmed="update"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.refresh') }}
    </template>

    <template slot="question">
      <i18n
        path="messages.confirmRefresh"
        tag="p"
      >
        <strong place="trigger">{{ trigger.name }}</strong>
      </i18n>
    </template>
  </fb-confirmation-window>
</template>

<script>
  export default {

    name: 'TriggersDetailRefreshConfirm',

    props: {

      trigger: {
        type: Object,
        required: true,
      },

    },

    methods: {

      /**
       * Update selected trigger
       *
       * @param {Object} event
       */
      update(event) {
        event && event.preventDefault()

        const errorMessage = this.$t('messages.notRefreshed', {
          trigger: this.trigger.name,
        })

        this.$store.dispatch('entities/trigger/refreshFromQueue', {
          id: this.trigger.id,
          queue: 'update',
        }, {
          root: true,
        })
          .catch(e => {
            if (e.hasOwnProperty('exception')) {
              this.handleFormError(e.exception, errorMessage)
            } else {
              this.$toasted.error(errorMessage, {
                action: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })
            }
          })

        this.$toasted.success(this.$t('messages.refreshed', {
          trigger: this.trigger.name,
        }), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })

        this.$emit('refreshed')
      },

      /**
       * Close trigger update confirmation window
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

<i18n src="./locales.json" />
