<template functional>
  <span :class="['fb-spinner__container', `fb-spinner__container-${props.variant}`, `fb-spinner__container-${props.size}`]" />
</template>

<script>
  export default {

    name: 'Spinner',

    props: {

      variant: {
        type: String,
        default: 'primary',
        validator: (value) => {
          // The value must match one of these strings
          return [
            'default', 'primary', 'success', 'danger', 'warning', 'info',
          ].indexOf(value) !== -1
        },
      },

      size: {
        type: String,
        default: 'md',
        validator: (value) => {
          // The value must match one of these strings
          return [
            'sm', 'md', 'lg',
          ].indexOf(value) !== -1
        },
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
