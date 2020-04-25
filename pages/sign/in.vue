<template>
  <sign-in />
</template>

<script>
import SignIn from '@/components/account/SignIn'

export default {

  name: 'SignInPage',

  components: {
    SignIn,
  },

  middleware: 'anonymous',

  transition: 'fade',

}
</script>
