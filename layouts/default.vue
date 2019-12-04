<template>
  <fb-default-layout
    :loading-overlay="loadingOverlay"
    :has-profile="profile !== null"
    :user-name="_.get(profile, 'name')"
    :user-email="_.get(profile, 'email')"
    :menu-items="menuItems"
    :user-menu-items="userMenuItems"
    :bottom-menu-items="bottomMenuItems"
    :home-link="localePath({ name: $routes.home })"
    :app-version="version"
    :author-website="author.website"
    :author-name="author.name"
  >
    <nuxt slot="content" />

    <template slot="other">
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
    </template>
  </fb-default-layout>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  const AccountEdit = () => import('@/components/account/AccountEdit')
  const ProfileEdit = () => import('@/components/account/ProfileEdit')
  const PasswordEdit = () => import('@/components/account/PasswordEdit')
  const SecurityEdit = () => import('@/components/account/SecurityEdit')

  const FbDefaultLayout = () => import('@/node_modules/@fastybird-com/theme/layouts/default')

  import * as config from '@/configuration'

  import { version } from './../package.json'

  export default {

    name: 'LayoutDefault',

    components: {
      AccountEdit,
      ProfileEdit,
      PasswordEdit,
      SecurityEdit,

      FbDefaultLayout,
    },

    data() {
      return {
        loadingOverlay: false,
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
        menuItems: [],
        userMenuItems: [],
        bottomMenuItems: [],
        author: {
          name: config.AUTHOR_NAME,
          website: config.AUTHOR_WEBSITE,
        },
        version,
      }
    },

    computed: {

      ...mapState({
        connectionStatus: state => state.connectionStatus,
      }),

      session() {
        return this.$store.getters['entities/session/query']().first()
      },

      account() {
        return this.$store.getters['entities/account/query']()
          .with('emails')
          .with('security_question')
          .first()
      },

      profile() {
        return this.$store.getters['entities/profile/query']().first()
      },

    },

    watch: {

      /**
       * Session was updated or destroyed
       *
       * @param {(Session|null)} val
       */
      session(val) {
        if (val) {
          this.$cookies.set('token', val.token)
          this.$cookies.set('refresh_token', val.refresh)
        }
      },

    },

    created() {
      this.menuItems = this._.cloneDeep(config.MENU_ITEMS)
      this.menuItems.forEach(item => {
        if (item.hasOwnProperty('meta') && item.meta.hasOwnProperty('label')) {
          // eslint-disable-next-line
          item.meta.label = this.$t(item.meta.label)
        }

        if (item.hasOwnProperty('items')) {
          item.items.forEach(subItem => {
            if (subItem.hasOwnProperty('link')) {
              // eslint-disable-next-line
              subItem.link = this.localePath({ name: subItem.link, hash: this._.get(item, 'hash') })
            }

            if (subItem.hasOwnProperty('meta') && subItem.meta.hasOwnProperty('label')) {
              // eslint-disable-next-line
              subItem.meta.label = this.$t(subItem.meta.label)
            }
          })
        }
      })

      this.userMenuItems = this._.cloneDeep(config.USER_MENU_ITEMS)
      this.userMenuItems.forEach(item => {
        if (item.hasOwnProperty('link')) {
          // eslint-disable-next-line
          item.link = this.localePath({ name: item.link, hash: this._.get(item, 'hash') })
        }

        if (item.hasOwnProperty('meta') && item.meta.hasOwnProperty('label')) {
          // eslint-disable-next-line
          item.meta.label = this.$t(item.meta.label)
        }
      })

      this.bottomMenuItems = this._.cloneDeep(config.MOBILE_BOTTOM_TABS)
      this.bottomMenuItems.forEach(item => {
        // eslint-disable-next-line
        item.link = this.localePath({ name: item.link, hash: this._.get(item, 'hash') })
        // eslint-disable-next-line
        item.name = this.$t(item.name)
      })
    },

    mounted() {
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

      this.$bus.$on('wait-page_reloading', (status) => {
        this.loadingOverlay = status
      })

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

      this.$bus.$off('wait-page_reloading')
    },

    methods: {

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

      _setNetworkConnected() {
        this.setConnectionStatus({ status: true })
      },

      _setNetworkDisconnected() {
        this.setConnectionStatus({ status: false })
      },

    },

  }
</script>
