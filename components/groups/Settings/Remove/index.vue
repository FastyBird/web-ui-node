<template>
  <fb-confirmation-window
    :transparent-bg="transparentBg"
    icon="trash"
    @confirmed="remove"
    @close="close"
  >
    <template slot="header">
      {{ $t('groups.headings.remove') }}
    </template>

    <template slot="question">
      <i18n
        path="groups.messages.confirmRemove"
        tag="p"
      >
        <strong slot="group">{{ group.label }}</strong>
      </i18n>
    </template>
  </fb-confirmation-window>
</template>

<script>
export default {

  name: 'GroupsSettingsGroupRemove',

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

      const errorMessage = this.$t('groups.messages.notRemoved', {
        group: this.group.label,
      })

      this.$store.dispatch('entities/group/remove', {
        id: this.group.id,
      }, {
        root: true,
      })
        .catch((e) => {
          if (this._.get(e, 'exception', null) !== null) {
            this.handleFormError(e.exception, errorMessage)
          } else {
            this.$flashMessage(errorMessage, 'error')
          }
        })

      this.$emit('close')

      this.$router.push(this.localePath(this.$routes.groups.list))
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
