<template>
  <nuxt-child />
</template>

<script>
export default {

  name: 'DefaultPage',

  middleware: 'authenticated',

  transition: 'fade',

}
</script>
