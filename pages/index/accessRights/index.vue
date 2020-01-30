<template>
  <div class="fb-acl-list-view__container">
    ACL MODULE
  </div>
</template>

<script>
export default {

  name: 'AccessRightsListPage',

  middleware: 'authenticated',

  transition: 'fade',

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
