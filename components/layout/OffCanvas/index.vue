<template>
  <div
    ref="root"
    @keyup.esc="close"
    class="fb-off-canvas__container"
  >
    <transition name="off-canvas-overlay">
      <div
        v-if="show"
        @click.prevent="close"
        class="fb-off-canvas__overlay"
      />
    </transition>

    <transition name="off-canvas-body">
      <div
        v-if="show"
        class="fb-off-canvas__body"
      >
        <slot />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
} from '@vue/composition-api'

export default defineComponent({

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
