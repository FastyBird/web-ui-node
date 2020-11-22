<template functional>
  <button
    @click.prevent="listeners['click']"
    class="fb-off-canvas-button__container"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import {
  defineComponent,
} from '@vue/composition-api'

export default defineComponent({

  name: 'OffCanvasButton',

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
