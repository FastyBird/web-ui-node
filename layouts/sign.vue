<template>
  <fb-sign-layout
    :loading-overlay="loadingOverlay"
    :sign-in-link="localePath({ name: $routes.account.signIn })"
    :sign-up-link="localePath({ name: $routes.account.signUp })"
    :author-website="author.website"
    :author-name="author.name"
  >
    <nuxt slot="content" />
  </fb-sign-layout>
</template>

<script>
import * as config from '@/configuration'

const FbSignLayout = () => import('@/node_modules/@fastybird-com/theme/layouts/sign')

export default {

  name: 'LayoutSign',

  components: {
    FbSignLayout,
  },

  data() {
    return {
      loadingOverlay: false,
      author: {
        name: config.AUTHOR_NAME,
        website: config.AUTHOR_WEBSITE,
      },
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

}
</script>
