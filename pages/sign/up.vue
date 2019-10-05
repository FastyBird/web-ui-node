<template>
  <div>
    <sign-up />
  </div>
</template>

<script>
  import SignUp from '@/components/account/SignUp'

  export default {

    name: 'SignUpPage',

    components: {
      SignUp,
    },

    layout: 'sign',

    middleware: 'anonymous',

    transition: 'fade',

  }
</script>
