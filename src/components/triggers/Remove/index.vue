<template web>
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
        <strong place="trigger">{{ trigger.name }}</strong>
      </i18n>
    </template>
  </fb-confirmation-window>
</template>

<script>
  export default {

    name: 'TriggersRemove',

    props: {

      trigger: {
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
       * Remove selected trigger
       *
       * @param {Object} event
       */
      remove(event) {
        event && event.preventDefault()

        const errorMessage = this.$t('messages.notRemoved', {
          trigger: this.trigger.name,
        })

        this.$store.dispatch('entities/trigger/remove', {
          id: this.trigger.id,
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
          trigger: this.trigger.name,
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
       * Close trigger remove confirmation window
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
