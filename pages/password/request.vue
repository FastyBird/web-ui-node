<template>
  <request-password />
</template>

<script>
import RequestPassword from '@/components/account/RequestPassword'

export default {

  name: 'RequestPasswordPage',

  components: {
    RequestPassword,
  },

  middleware: 'anonymous',

  transition: 'fade',

}
</script>
