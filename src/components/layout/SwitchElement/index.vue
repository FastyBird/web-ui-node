<template functional>
  <label class="fb-switch-element__container switch switch-primary cursor-pointer">
    <input
      :checked="props.status"
      :disabled="props.disabled"
      class="switch-input"
      type="checkbox"
      @change.prevent="listeners['change']()"
    >
    <span class="switch-track" />
    <span class="switch-thumb" />
  </label>
</template>

<script>
  export default {

    name: 'SwitchElement',

    props: {

      status: {
        type: Boolean,
        default: false,
      },

      disabled: {
        type: Boolean,
        default: false,
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
