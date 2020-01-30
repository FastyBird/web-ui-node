<template>
  <div class="fb-home-view__container">
    <template v-if="profile !== null">
      <gravatar
        :email="profile.email"
        :size="250"
        :default-img="'mm'"
        :alt="profile.name"
      />

      <h4>
        Welcome back <strong>{{ profile.firstName }}</strong>
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

    profile() {
      return this.$store.getters['entities/profile/query']().first()
    },

  },

  created() {
    this.$store.dispatch('header/resetStore', null, {
      root: true,
    })

    this.$store.dispatch('bottomNavigation/resetStore', null, {
      root: true,
    })
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
