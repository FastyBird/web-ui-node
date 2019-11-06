<template>
  <div class="list-group-item">
    <span
      v-if="removingEnabled"
      class="pull-right"
      role="button"
      @click.prevent="remove()"
    >
      <font-awesome-icon icon="trash" />
    </span>
    {{ $t('texts.send') }}
    <small class="d-b">{{ address }}</small>
  </div>
</template>

<script>
  export default {

    name: 'RoutinesDetailNotificationEmail',

    props: {

      notification: {
        type: Object,
        required: true,
      },

      removingEnabled: {
        type: Boolean,
        required: false,
        default: true,
      },

    },

    computed: {

      /**
       * Notification e-mail address
       *
       * @returns {String}
       */
      address() {
        const email = this.$store.getters['entities/email/query']()
          .where('address', this.notification.address)
          .first()

        if (email !== null) {
          return email.address
        }

        return this.notification.address
      },

    },

    methods: {

      remove() {
        this.$emit('remove', this.notification)
      },

    },

  }
</script>

<i18n src="./locales.json" />
