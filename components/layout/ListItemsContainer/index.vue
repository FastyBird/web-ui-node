<template functional>
  <div :class="[data.class, data.staticClass, 'fb-list-items-container__container']">
    <h3
      v-if="props.heading"
      class="fb-list-items-container__heading"
    >
      {{ props.heading }}
    </h3>

    <div class="fb-list-items-container__items">
      <slot />
    </div>
  </div>
</template>

<script>
  export default {

    name: 'ListItemsContainer',

    props: {

      heading: {
        type: String,
        default: null,
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
