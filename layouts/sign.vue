<template>
  <div id="app">
    <div class="fb-sign-layout__container">
      <div class="fb-sign-layout__box">
        <fb-sign-header />

        <nuxt />
      </div>

      <fb-sign-footer />
    </div>

    <fb-page-loading v-if="loadingOverlay" />
  </div>
</template>

<script>
  const FbSignHeader = () => import('@/node_modules/@fastybird-com/theme/components/Layout/FbSignHeader')
  const FbSignFooter = () => import('@/node_modules/@fastybird-com/theme/components/Layout/FbSignFooter')

  export default {

    name: 'LayoutSign',

    components: {
      FbSignHeader,
      FbSignFooter,
    },

    data() {
      return {
        loadingOverlay: false,
      }
    },

    beforeMount() {
      this.$bus.$on('wait-sign_in', (status) => {
        this.loadingOverlay = status
      })

      this.$bus.$emit('wait-page_reloading', false)
    },

    beforeDestroy() {
      this.$bus.$off('wait-sign_in')
    },

    head() {
      return {
        htmlAttrs: {
          'data-layout': 'layout_sign',
        },
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import '~@fastybird-com/theme/assets/layout/sign';
</style>
