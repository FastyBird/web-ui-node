<template web>
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
  import Email from '@/store/modules/profile/Email'

  export default {

    name: 'TriggersDetailNotificationEmail',

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
        const email = Email
          .query()
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
