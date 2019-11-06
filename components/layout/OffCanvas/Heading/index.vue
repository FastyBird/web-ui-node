<template functional>
  <div class="fb-off-canvas-heading__container">
    <div class="fb-off-canvas-heading__body">
      <h4 v-if="props.subHeading === null">
        {{ props.heading }}
      </h4>
      <h4 v-else>
        <span>{{ props.heading }}</span>
        <small>{{ props.subHeading }}</small>
      </h4>

      <slot name="left-button" />

      <slot name="right-button" />
    </div>
  </div>
</template>

<script>
  export default {

    name: 'OffCanvasHeading',

    props: {

      heading: {
        type: String,
        required: true,
      },

      subHeading: {
        type: String,
        required: false,
        default: null,
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>
