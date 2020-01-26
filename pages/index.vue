<template>
  <nuxt-child />
</template>

<script>
import { mapState } from 'vuex'

export default {

  name: 'DefaultPage',

  middleware: 'authenticated',

  transition: 'fade',

  computed: {

    ...mapState({
      connectionStatus: state => state.connectionStatus,
    }),

  },

  watch: {

    connectionStatus(val) {
      if (val && this.isSignedIn()) {
        this.$wamp.open()
      } else {
        this.$wamp.close()
      }
    },

  },

  mounted() {
    this.$bus.$on('signOut', () => {
      this.$bus.$emit('wait-page_reloading', true)

      this.$cookies.remove('token')
      this.$cookies.remove('refresh_token')

      // Process cleanup
      this.$store.dispatch('entities/deleteAll')
      this.$store.dispatch('entities/session/reset')
      this.$store.dispatch('entities/device/reset')
      this.$store.dispatch('entities/trigger/reset')

      this.$wamp.close()

      this.$router.push(this.localePath({ name: this.$routes.account.signIn }))
    })

    // Check if user token is saved in local storage
    if (this.isSignedIn()) {
      this.$wamp.open()
    }

    this.$wamp.on('connect', this._wampOnConnect)
    this.$wamp.on('close', this._wampOnDisconnect)
  },

  beforeDestroy() {
    this.$wamp.off('connect', this._wampOnConnect)
    this.$wamp.off('close', this._wampOnDisconnect)
  },

  methods: {

    _wampOnConnect() {
      // eslint-disable-next-line
      console.log('[WAMP] connected')
    },

    _wampOnDisconnect(reason) {
      // eslint-disable-next-line
      console.log(`[WAMP] closed: ${reason}`)
    },

  },

}
</script>
