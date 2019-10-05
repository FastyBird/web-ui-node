<template>
  <div>
    <request-password />
  </div>
</template>

<script>
  import RequestPassword from '@/components/account/RequestPassword'

  export default {

    name: 'RequestPasswordPage',

    components: {
      RequestPassword,
    },

    layout: 'sign',

    middleware: 'anonymous',

    transition: 'fade',

  }
</script>
