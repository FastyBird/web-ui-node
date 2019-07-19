<template
  functional
  web
>
  <div class="fb-iot-things-list-container__container">
    <div class="row">
      <slot name="items" />
    </div>
  </div>
</template>

<script>
  export default {

    name: 'ThingsListContainer',

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
