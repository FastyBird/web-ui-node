<template>
  <div
    ref="root"
    :class="['fb-off-canvas__container', {'show': show}]"
    @keyup.esc="close"
  >
    <div
      :class="['fb-off-canvas__overlay', {'hide': !show}]"
      @click.prevent="close"
    />

    <div class="fb-off-canvas__body">
      <slot name="body" />
    </div>
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

    watch(() => props.show, (val: Boolean) => {
      if (val && root.value) {
        // @ts-ignore: Object is possibly 'null'.
        root.value.tabIndex = 1;

        context.root.$nextTick(() => {
          // @ts-ignore: Object is possibly 'null'.
          root.value.focus();
        })
      }
    });

    return {
      root,
      close: () => {
        context.emit('close')
      },
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
