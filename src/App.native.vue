<template native>
  <sign-in />
</template>
<script>
  import SignIn from './views/account/SignIn'

  const { VUE_APP_MODE, VUE_APP_PLATFORM } = process.env

  export default {

    components: {
      SignIn,
    },

    data() {
      return {
        navbarTitle: 'App.vue',
        msg: `Mode=${VUE_APP_MODE} and plat=${VUE_APP_PLATFORM}`,
      }
    },

  }
</script>

<style native>
  .message {
    color: red;
  }

  .icon {
    height: 20%;
    width: 20%;
    margin-top: 20px;
  }
</style>
