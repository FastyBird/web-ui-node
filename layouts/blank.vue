<template>
  <nuxt />
</template>

<script>
export default {

  name: 'LayoutBlank',

  head() {
    return {
      htmlAttrs: {
        'data-layout': 'layout_blank',
      },
    }
  },

}
</script>
