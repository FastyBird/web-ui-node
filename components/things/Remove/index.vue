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
        <strong place="thing">{{ thing.label }}</strong>
      </i18n>
    </template>
  </fb-confirmation-window>
</template>

<script>
  import { THINGS_LIST_LINK } from '@/configuration/routes'

  export default {

    name: 'ThingsRemove',

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

        const errorMessage = this.$t('messages.notRemoved', {
          thing: this.thing.label,
        })

        const successMessage = this.$t('messages.removed', {
          thing: this.thing.label,
        })

        this.$store.dispatch('entities/thing/remove', {
          id: this.thing.id,
        }, {
          root: true,
        })
          .catch(e => {
            if (this._.get(e, 'exception', null) !== null) {
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

        this.$toasted.success(successMessage, {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })

        this.$emit('close')

        this.$router.push(this.localePath({ name: THINGS_LIST_LINK }))
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

<i18n src="./locales.json" />
