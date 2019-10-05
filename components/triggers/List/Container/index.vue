<template functional>
  <div class="fb-triggers-list-container__container">
    <div class="row">
      <slot name="items" />
    </div>
  </div>
</template>

<script>
  export default {

    name: 'TriggersListContainer',

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
