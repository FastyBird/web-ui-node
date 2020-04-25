<template>
  <sign-up />
</template>

<script>
import SignUp from '@/components/account/SignUp'

export default {

  name: 'SignUpPage',

  components: {
    SignUp,
  },

  middleware: 'anonymous',

  transition: 'fade',

}
</script>
