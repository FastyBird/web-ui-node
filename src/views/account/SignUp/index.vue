<template web>
  <layout name="LayoutSign">
    <sign-up />
  </layout>
</template>

<script>
  import SignUp from '@/components/account/SignUp'

  import {
    HOME_LINK,
  } from '@/router'

  export default {

    name: 'SingUpView',

    components: {
      SignUp,
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
