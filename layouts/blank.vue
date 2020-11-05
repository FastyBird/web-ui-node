<template>
  <nuxt />
</template>

<script lang="ts">
import {
  defineComponent,
} from '@vue/composition-api'

export default defineComponent({

  name: 'LayoutBlank',

  head() {
    return {
      htmlAttrs: {
        'data-layout': 'layout_blank',
      },
    }
  },

})
</script>
