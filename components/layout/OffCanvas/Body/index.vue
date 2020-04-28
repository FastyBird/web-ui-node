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
import { defineComponent, ref } from '@vue/composition-api'

import OffCanvasHeading from './../Heading/index.vue'

export default defineComponent({

  name: 'OffCanvasBody',

  components: {
    OffCanvasHeading,
  },

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

  setup(props, context) {
    const root = ref(null);

    return {
      root,
      close: (): void => {
        context.emit('close')
      },
    }
  },

})
</script>
