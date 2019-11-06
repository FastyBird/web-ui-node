<template>
  <fb-confirmation-window
    :transparent-bg="transparentBg"
    icon="trash"
    @confirmed="remove"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.remove') }}
    </template>

    <template slot="question">
      <i18n
        path="messages.confirmRemove"
        tag="p"
      >
        <strong place="routine">{{ routine.name }}</strong>
      </i18n>
    </template>
  </fb-confirmation-window>
</template>

<script>
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

        const errorMessage = this.$t('messages.notRemoved', {
          routine: this.routine.name,
        })

        this.$store.dispatch('entities/trigger/remove', {
          id: this.routine.id,
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

        this.$toasted.success(this.$t('messages.removed', {
          routine: this.routine.name,
        }), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
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

<i18n src="./locales.json" />
