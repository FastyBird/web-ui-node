<template>
  <layout name="LayoutSign">
    <request-password />
  </layout>
</template>

<script>
  import RequestPassword from '@/components/account/RequestPassword'

  import {
    HOME_LINK,
  } from '@/router'

  export default {

    name: 'RequestPasswordView',

    components: {
      RequestPassword,
    },

    created() {
      if (this.isSignedIn()) {
        this.$router.push(HOME_LINK)
      }
    },

  }
</script>
