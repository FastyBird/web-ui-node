<template>
  <list-item class="fb-routines-notification__container">
    <template slot="icon">
      <font-awesome-icon
        v-if="notification.type === 'sms'"
        icon="mobile"
      />
      <font-awesome-icon
        v-else-if="notification.type === 'email'"
        icon="envelope"
      />
    </template>

    <template
      v-if="notification.type === 'sms'"
      slot="heading"
    >
      {{ $t('routines.headings.smsNotification') }}
    </template>
    <template
      v-if="notification.type === 'email'"
      slot="heading"
    >
      {{ $t('routines.headings.emailNotification') }}
    </template>

    <template
      v-if="notification.type === 'sms'"
      slot="sub-heading"
    >
      {{ notification.value }}
    </template>
    <template
      v-if="notification.type === 'email'"
      slot="sub-heading"
    >
      {{ email }}
    </template>

    <template slot="detail-large">
      <switch-element
        :status="enabled"
        @change="toggleThing"
      />

      <fb-button
        size="sm"
        variant="link"
        @click="removeNotification"
      >
        {{ $t('application.buttons.remove.title') }}
      </fb-button>
    </template>
  </list-item>
</template>

<script>
  export default {

    name: 'RoutinesEditListNotification',

    props: {

      notification: {
        type: Object,
        required: true,
        validator: (value) => {
          return !(
            !value.hasOwnProperty('type') ||
            !value.hasOwnProperty('value') ||
            !value.hasOwnProperty('enabled')
          )
        },
      },

    },

    data() {
      return {
        enabled: true,
      }
    },

    computed: {

      email() {
        if (this.notification.type === 'email') {
          const email = this.$store.getters['entities/email/find'](this.notification.value)

          return email !== null ? email.address : this.notification.value
        }

        return null
      },

    },

    methods: {

      toggleNotification() {
        this.$emit('toggle')
      },

      removeNotification() {
        this.$emit('remove')
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
