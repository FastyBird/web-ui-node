<template web>
  <li class="media">
    <div class="media-middle media-left">
      <font-awesome-icon
        v-if="notification.type === 'sms'"
        icon="mobile"
        class="sq-48"
      />
      <font-awesome-icon
        v-if="notification.type === 'email'"
        icon="envelope"
        class="sq-48"
      />
    </div>
    <div class="media-middle media-body">
      <h5
        v-if="notification.type === 'sms'"
        class="m-y-0"
      >
        {{ $t('headings.sms') }}
      </h5>
      <h5
        v-if="notification.type === 'email'"
        class="m-y-0"
      >
        {{ $t('headings.email') }}
      </h5>

      <small
        v-if="notification.type === 'sms'"
        class="fw-b"
      >{{ notification.value }}
      </small>
      <small
        v-if="notification.type === 'email'"
        class="fw-b"
      >{{ email }}
      </small>
    </div>
    <div class="media-middle media-right">
      <fb-button
        variant="outline-primary"
        size="sm"
        @click.prevent="$emit('remove')"
      >
        {{ $t('application.buttons.remove.title') }}
      </fb-button>
    </div>
  </li>
</template>

<script>
  import Email from '@/store/modules/profile/Email'

  export default {

    name: 'TriggersCreateListNotification',

    props: {

      notification: {
        type: Object,
        required: true,
      },

    },

    computed: {

      email() {
        if (this.notification.type === 'email') {
          const email = Email.find(this.notification.value)

          return email !== null ? email.address : this.notification.value
        }

        return null
      },

    },

  }
</script>

<i18n src="./locales.json" />
