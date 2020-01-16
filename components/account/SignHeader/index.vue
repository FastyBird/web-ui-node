<template>
  <h3 class="fb-account-sign-header__heading">
    {{ heading }}
  </h3>
</template>

<script>
export default {

  name: 'SignHeader',

  props: {

    heading: {
      type: String,
      required: true,
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>
