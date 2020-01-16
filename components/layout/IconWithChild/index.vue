<template functional>
  <span class="fb-icon-with-child__container">
    <font-awesome-icon :icon="props.primaryIcon" />
    <span class="fb-icon-with-child__container-child">
      <font-awesome-icon
        v-if="props.childIcon"
        :icon="props.childIcon"
      />
    </span>
  </span>
</template>

<script lang="ts">
import { createComponent } from '@vue/composition-api'

export default createComponent({

  name: 'IconWithChild',

  props: {

    primaryIcon: {
      type: String,
      required: true,
    },

    childIcon: {
      type: String,
      default: null,
    },

  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
