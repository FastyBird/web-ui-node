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
    this.$store.dispatch('app/bottomMenuCollapse', null, {
      root: true,
    })
  },

}
</script>
