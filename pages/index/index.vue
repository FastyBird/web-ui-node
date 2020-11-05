<template>
  <div class="fb-home-view__container">
    <fb-layout-header-spacer left />

    <template v-if="account !== null">
      <gravatar
        v-if="account.email !== null"
        :email="account.email.address"
        :size="250"
        :default-img="'mm'"
        :alt="account.name"
      />

      <h4>
        Welcome back <strong>{{ account.firstName }}</strong>
      </h4>
    </template>
  </div>
</template>

<script>
import Gravatar from 'vue-gravatar'

export default {

  name: 'IndexPage',

  components: {
    Gravatar,
  },

  middleware: 'authenticated',

  transition: 'fade',

  computed: {

    account() {
      return this.$store.getters['entities/account/query']().first()
    },

  },

  created() {
    this.$store.dispatch('app/resetHeading', {}, {
      root: true,
    })
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
