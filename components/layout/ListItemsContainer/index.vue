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

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({

  name: 'ListItemsContainer',

  props: {

    heading: {
      type: String,
      default: null,
    },

  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
