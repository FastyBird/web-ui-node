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
    <small class="d-b">{{ notification.phone }}</small>
  </div>
</template>

<script>
  export default {

    name: 'TriggersDetailNotificationSms',

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

    methods: {

      remove() {
        this.$emit('remove', this.notification)
      },

    },

  }
</script>

<i18n src="./locales.json" />
