<template>
  <div class="fb-home-view__container p-a-md">
    <div
      v-if="profile !== null"
      class="text-center m-y-lg"
    >
      <gravatar
        :email="profile.email"
        :size="250"
        :default-img="'mm'"
        :alt="profile.name"
        class="img-responsive img-thumbnail img-circle m-t-lg m-b-lg"
      />
    </div>

    <h4
      v-if="profile !== null"
      class="d-b text-center"
    >
      Welcome back <strong>{{ profile.firstName }}</strong>
    </h4>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

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
      this.resetStore()
    },

    methods: {

      ...mapActions('header', [
        'resetStore',
      ]),

    },

  }
</script>
