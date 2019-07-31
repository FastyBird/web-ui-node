<template>
  <div id="app">
    <div
      v-show="isLoading"
      class="row"
    >
      <div class="col-6 offset-3 text-center">
        <div class="spinner spinner-primary spinner-lg pos-r sq-80" />
        <small class="d-b text-center">{{ $t('application.messages.loadingApp') }}</small>
      </div>
    </div>

    <template v-show="!isLoading">
      <component :is="layout">
        <router-view :layout.sync="layout" />
      </component>
    </template>

    <fb-modal-info
      v-show="connectionStatus === false"
      :enable-closing="false"
      icon="plug"
    >
      <template slot="info">
        <div class="text-center">
          <font-awesome-icon
            icon="power-off"
            class="icon-5x text-danger"
          />
          <h3 class="text-danger">
            {{ $t('application.headings.offlineState') }}
          </h3>
          <p>
            {{ $t('application.messages.offlineState') }}
          </p>
        </div>
      </template>
    </fb-modal-info>

    <account-edit
      v-if="view.accountEdit.show && account !== null"
      :account="account"
      @close="closeView('accountEdit')"
    />

    <profile-edit
      v-if="view.profileEdit.show && account !== null && profile !== null"
      :account="account"
      :profile="profile"
      @close="closeView('profileEdit')"
    />

    <password-edit
      v-if="view.passwordEdit.show && account !== null"
      :account="account"
      @close="closeView('passwordEdit')"
    />

    <security-edit
      v-if="view.securityEdit.show && account !== null"
      :account="account"
      @close="closeView('securityEdit')"
    />
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import { ACCOUNT_SIGN_IN_LINK } from '@/router'

  const AccountEdit = () => import('@/components/account/AccountEdit')
  const ProfileEdit = () => import('@/components/account/ProfileEdit')
  const PasswordEdit = () => import('@/components/account/PasswordEdit')
  const SecurityEdit = () => import('@/components/account/SecurityEdit')

  import Account from '@/store/modules/profile/Account'
  import Profile from '@/store/modules/profile/Profile'
  import Thing from '@/store/modules/io-server/Thing'

  export default {

    name: 'App',

    components: {
      AccountEdit,
      ProfileEdit,
      PasswordEdit,
      SecurityEdit,
    },

    data() {
      return {
        layout: 'div',
        account: null,
        profile: null,
        view: {
          accountEdit: {
            show: false,
          },
          profileEdit: {
            show: false,
          },
          passwordEdit: {
            show: false,
          },
          securityEdit: {
            show: false,
          },
        },
        subscriptions: [],
      }
    },

    computed: {

      ...mapState({
        connectionStatus: state => state.connectionStatus,
        route: state => state.route,
      }),

      /**
       * Check if app is loading
       *
       * @returns {Boolean}
       */
      isLoading() {
        if (this.route.hasOwnProperty('meta') && this.route.meta.hasOwnProperty('auth')) {
          if (this.route.meta.auth && this.$store.state.entities.account.semaphore.fetching) {
            return true
          }
        }

        return false
      },

      things() {
        return Thing.all()
      },

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

    created() {
      this.$wamp.on('connect', () => {
        console.log('WAMP connected')
      })

      this.$wamp.on('close', (reason) => {
        console.log(`WAMP closed: ${reason}`)
      })

      // Check if user token is saved in local storage
      if (this.isSignedIn()) {
        if (Account.query().count() === 0) {
          this.$store.dispatch('entities/account/fetch', null, {
            root: true,
          })
            .then(() => {
              this._loadUserDetails()
            })
            .catch(() => {
              // Fetching account failed
              this._logout()
            })
        } else {
          this._loadUserDetails()
        }
      }

      this.$bus.$on('openAccountSettings', () => {
        this.openView('accountEdit')
      })

      this.$bus.$on('openProfileSettings', () => {
        this.openView('profileEdit')
      })


      this.$bus.$on('openPasswordChange', () => {
        this.openView('passwordEdit')
      })


      this.$bus.$on('openSecuritySettings', () => {
        this.openView('securityEdit')
      })

      this.$bus.$on('signIn', () => {
        this._loadUserDetails()
      })

      this.$bus.$on('signOut', () => {
        this._logout()
      })
    },

    mounted() {
      window.addEventListener('online', this._setNetworkConnected)
      window.addEventListener('offline', this._setNetworkDisconnected)
    },

    beforeDestroy() {
      window.removeEventListener('online', this._setNetworkConnected)
      window.removeEventListener('offline', this._setNetworkDisconnected)

      this.$bus.$off('openAccountSettings')
      this.$bus.$off('openProfileSettings')
      this.$bus.$off('openPasswordChange')
      this.$bus.$off('openSecuritySettings')
      this.$bus.$off('signIn')
      this.$bus.$off('signOut')
    },

    methods: {

      ...mapActions('theme', {
        setThemeUsername: 'setUsername',
        setThemeEmail: 'setEmail',
      }),

      ...mapActions([
        'setConnectionStatus',
      ]),

      /**
       * Open view
       *
       * @param {String} view
       */
      openView(view) {
        if (this.view.hasOwnProperty(view)) {
          this.view[view].show = true
        }
      },

      /**
       * Close opened view
       *
       * @param {String} view
       */
      closeView(view) {
        if (this.view.hasOwnProperty(view)) {
          this.view[view].show = false
        }
      },

      /**
       * Load user data
       *
       * @private
       */
      _loadUserDetails() {
        this.account = Account
          .query()
          .first()

        this.profile = Profile
          .query()
          .first()

        if (this.profile !== null) {
          this.setThemeUsername({ username: this.profile.name })
          this.setThemeEmail({ email: this.profile.email })

          this.$sentry.configureScope(scope => {
            scope.setUser({
              'email': this.profile.email,
            })
          })
        }

        this.$wamp.open()

        this.$store.dispatch('entities/thing/fetch', null, {
          root: true,
        })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })

        // Load user triggers list
        this.$store.dispatch('entities/trigger/fetch', null, {
          root: true,
        })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      },

      _setNetworkConnected() {
        this.setConnectionStatus({ status: true })
      },

      _setNetworkDisconnected() {
        this.setConnectionStatus({ status: false })
      },

      _logout() {
        this.$bus.$emit('wait-page_reloading', true)

        this.$cookie.delete('token')
        this.$cookie.delete('refresh_token')

        // Process cleanup
        this.$store.dispatch('entities/deleteAll')

        this.$wamp.close()

        this.$router.push(ACCOUNT_SIGN_IN_LINK)
      },

    },

    metaInfo: {
      title: 'IOT control app',
      titleTemplate: '%s | FastyBird IO server',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width,initial-scale=1.0' },
        { name: 'description', content: 'FastyBird IOT server user interface' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import '~@fastybird-com/theme/assets/theme/theme';
</style>
