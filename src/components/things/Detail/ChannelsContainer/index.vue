<template
  functional
  web
>
  <div class="fb-iot-thing-detail-channels-container__container">
    <div class="fb-iot-thing-detail-channels-container__heading p-x-md p-y-0 m-a-0">
      <h3>
        {{ props.heading }}
      </h3>
    </div>

    <slot />
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
