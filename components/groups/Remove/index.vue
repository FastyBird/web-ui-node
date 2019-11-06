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
        <strong place="group">{{ group.label }}</strong>
      </i18n>
    </template>
  </fb-confirmation-window>
</template>

<script>
  import { GROUPS_LIST_LINK } from '@/configuration/routes'

  export default {

    name: 'GroupsRemove',

    props: {

      group: {
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
       * Remove selected group
       *
       * @param {Object} event
       */
      remove(event) {
        event && event.preventDefault()

        const errorMessage = this.$t('messages.notRemoved', {
          group: this.group.label,
        })

        const successMessage = this.$t('messages.removed', {
          group: this.group.label,
        })

        this.$store.dispatch('entities/group/remove', {
          id: this.group.id,
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

        this.$router.push(this.localePath({ name: GROUPS_LIST_LINK }))
      },

      /**
       * Close group remove confirmation window
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
