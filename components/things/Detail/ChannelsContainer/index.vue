<template functional>
  <div class="fb-iot-thing-detail-channels-container__container">
    <h3 class="fb-iot-thing-detail-channels-container__heading">
      {{ props.heading }}
    </h3>

    <div class="fb-iot-thing-detail-channels-container__items">
      <slot />
    </div>
  </div>
</template>

<script>
  export default {

    name: 'ThingsDetailChannelsContainer',

    props: {

      heading: {
        type: String,
        required: true,
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
