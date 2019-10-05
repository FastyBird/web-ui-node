<template>
  <div>
    <sign-in />
  </div>
</template>

<script>
  import SignIn from '@/components/account/SignIn'

  export default {

    name: 'SignInPage',

    components: {
      SignIn,
    },

    layout: 'sign',

    middleware: 'anonymous',

    transition: 'fade',

  }
</script>
