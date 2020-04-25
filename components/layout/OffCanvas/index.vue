<template>
  <div
    ref="root"
    class="fb-off-canvas__container"
    @keyup.esc="close"
  >
    <transition name="off-canvas-overlay">
      <div
        v-if="show"
        class="fb-off-canvas__overlay"
        @click.prevent="close"
      />
    </transition>

    <transition name="off-canvas-body">
      <div
        v-if="show"
        class="fb-off-canvas__body"
      >
        <slot name="body" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, watch } from '@vue/composition-api'

export default createComponent({

  name: 'OffCanvas',

  props: {

    show: {
      type: Boolean,
      default: false,
    },

  },

  setup(props, context) {
    const root = ref(null);

    watch(() => props.show, (val: Boolean): void => {
      if (val && root.value) {
        // @ts-ignore: Object is possibly 'null'.
        root.value.tabIndex = 1;
      }
    });

    return {
      root,
      close: (): void => {
        context.emit('close')
      },
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
