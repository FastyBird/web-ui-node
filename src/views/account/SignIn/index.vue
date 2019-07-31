<template>
  <layout name="LayoutSign">
    <sign-in />
  </layout>
</template>

<script>
  import SignIn from '@/components/account/SignIn'

  import {
    HOME_LINK,
  } from '@/router'

  export default {

    name: 'SignInView',

    components: {
      SignIn,
    },

    data() {
      return {
        layout: 'LayoutSign',
      }
    },

    created() {
      if (this.isSignedIn()) {
        this.$router.push(HOME_LINK)
      }
    },

  }
</script>
