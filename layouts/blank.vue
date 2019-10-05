<template>
  <div id="app">
    <nuxt />
  </div>
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
