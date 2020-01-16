<template>
  <div class="fb-off-canvas-body__container">
    <off-canvas-heading
      :heading="heading"
      :sub-heading="subHeading"
    >
      <template slot="left-button">
        <slot name="left-button" />
      </template>

      <template slot="right-button">
        <slot name="right-button" />
      </template>
    </off-canvas-heading>

    <slot name="body" />
  </div>
</template>

<script lang="ts">
import { createComponent, ref, watch } from '@vue/composition-api'

import OffCanvasHeading from './../Heading/index.vue'

export default createComponent({

  name: 'OffCanvasBody',

  components: {
    OffCanvasHeading,
  },

  props: {

    show: {
      type: Boolean,
      default: false,
    },

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
