<template>
  <div class="fb-users-list-view__container">
    USERS MODULE
  </div>
</template>

<script>
export default {

  name: 'UsersListPage',

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
