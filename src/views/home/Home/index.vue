<template>
  <layout name="LayoutDefault">
    <div class="fb-home-view__container">
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
        Wellcome back <strong>{{ profile.details.first_name }}</strong>
      </h4>
    </div>
  </layout>
</template>

<script>
  import { mapActions } from 'vuex'

  import Gravatar from 'vue-gravatar'

  import Profile from '@/store/modules/profile/Profile'

  import SignIn from './../../account/SignIn'

  export default {

    name: 'HomeView',

    components: {
      Gravatar,
    },

    data() {
      return {
        message: 'You have successfully authenticated. This is where you build your core application functionality.',
      }
    },

    computed: {

      profile() {
        return Profile
          .query()
          .first()
      },

    },

    created() {
      this.resetStore()
    },

    methods: {

      ...mapActions('header', [
        'resetStore',
      ]),

      logout() {
        this.$navigateTo(SignIn, {
          clearHistory: true,
        })
      },

    },

  }
</script>
