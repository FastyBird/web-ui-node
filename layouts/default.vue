<template>
  <div id="app">
    <div class="fb-default-layout__container">
      <fb-phone-header
        :profile="profile !== null"
        :avatar="_.get(this, '$avatar', null)"
        :user-name="_.get(profile, 'name')"
        :user-email="_.get(profile, 'email')"
        :user-menu-items="_.get(this, '$userMenuItems', [])"
        class="hidden visible-xs"
      />

      <fb-desktop-header class="hidden-xs" />

      <div class="fb-default-layout__body">
        <div class="fb-default-layout__sidebar-container">
          <div class="fb-default-layout__sidebar-backdrop" />

          <div class="fb-default-layout__sidebar-header">
            <fb-logo :link="_.get(this, '$coreLinks.home', [])" />
          </div>

          <fb-navigation :items="_.get(this, '$menuItems', [])" />

          <div
            v-if="profile !== null"
            class="fb-default-layout__sidebar-footer"
          >
            <fb-user-side-navigation
              :avatar="_.get(this, '$avatar', null)"
              :name="_.get(profile, 'name')"
              :email="_.get(profile, 'email')"
              :version="_.get(this, '$appVersion', '0.0.0')"
              :items="_.get(this, '$userMenuItems', [])"
            />
          </div>
        </div>

        <div
          :style="document.minimalContentHeight !== null ? `height: ${document.minimalContentHeight}px` : ''"
          class="fb-default-layout__content-container"
        >
          <div
            :style="document.minimalContentHeight !== null ? `height: ${document.minimalContentHeight}px` : ''"
            class="fb-default-layout__content-body"
          >
            <nuxt />
          </div>
        </div>

        <div class="fb-default-layout__footer-container">
          <div class="fb-default-layout__footer-body">
            <small>&copy; 2017 <a
              v-if="_.get(this, '$authorWebsite', null) !== null"
              :href="_.get(this, '$authorWebsite', null)"
              target="_blank"
              rel="noreferrer"
            >{{ _.get(this, '$authorName', null) }}</a></small>
          </div>
        </div>
      </div>

      <fb-bottom-navigation
        :items="_.get(this, '$bottomMenu', [])"
        class="hidden visible-xs"
      />
    </div>

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

    <fb-page-loading v-if="loadingOverlay" />
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  const AccountEdit = () => import('@/components/account/AccountEdit')
  const ProfileEdit = () => import('@/components/account/ProfileEdit')
  const PasswordEdit = () => import('@/components/account/PasswordEdit')
  const SecurityEdit = () => import('@/components/account/SecurityEdit')

  const FbLogo = () => import('@/node_modules/@fastybird-com/theme/components/Layout/FbLogo')
  const FbDesktopHeader = () => import('@/node_modules/@fastybird-com/theme/components/Layout/FbDesktopHeader')
  const FbPhoneHeader = () => import('@/node_modules/@fastybird-com/theme/components/Layout/FbPhoneHeader')
  const FbNavigation = () => import('@/node_modules/@fastybird-com/theme/components/Layout/FbNavigation')
  const FbUserSideNavigation = () => import('@/node_modules/@fastybird-com/theme/components/Layout/FbUserSideNavigation')
  const FbBottomNavigation = () => import('@/node_modules/@fastybird-com/theme/components/Layout/FbBottomNavigation')

  export default {

    name: 'LayoutDefault',

    components: {
      AccountEdit,
      ProfileEdit,
      PasswordEdit,
      SecurityEdit,

      FbLogo,
      FbDesktopHeader,
      FbPhoneHeader,
      FbNavigation,
      FbUserSideNavigation,
      FbBottomNavigation,
    },

    data() {
      return {
        document: {
          viewportHeight: null,
          minimalContentHeight: null,
        },
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
      }
    },

    computed: {

      ...mapState({
        connectionStatus: state => state.connectionStatus,
        windowSize: state => state.theme.windowSize,
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

    beforeMount() {
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

      this._calculateWindowHeight()

      this.windowsResizeHandler()

      window.addEventListener('visibilitychange', this.windowsResizeHandler)
      window.addEventListener('DOMContentLoaded', this.windowsResizeHandler)
      window.addEventListener('resize', this.windowsResizeHandler)

      window.addEventListener('online', this._setNetworkConnected)
      window.addEventListener('offline', this._setNetworkDisconnected)
    },

    beforeDestroy() {
      window.removeEventListener('visibilitychange', this.windowsResizeHandler)
      window.removeEventListener('DOMContentLoaded', this.windowsResizeHandler)
      window.removeEventListener('resize', this.windowsResizeHandler)

      window.removeEventListener('online', this._setNetworkConnected)
      window.removeEventListener('offline', this._setNetworkDisconnected)

      this.$bus.$off('openAccountSettings')
      this.$bus.$off('openProfileSettings')
      this.$bus.$off('openPasswordChange')
      this.$bus.$off('openSecuritySettings')

      this.$bus.$off('wait-page_reloading')
    },

    methods: {

      ...mapActions('theme', {
        setThemeWindowSize: 'setWindowSize',
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
       * Window resize handler
       */
      windowsResizeHandler() {
        if (!document.hidden) {
          if (matchMedia('(max-width: 575px)').matches) {
            this.setThemeWindowSize({ size: 'xs' })
          } else if (matchMedia('(max-width: 767px)').matches) {
            this.setThemeWindowSize({ size: 'sm' })
          } else if (matchMedia('(max-width: 991px)').matches) {
            this.setThemeWindowSize({ size: 'md' })
          } else if (matchMedia('(max-width: 1199px)').matches) {
            this.setThemeWindowSize({ size: 'lg' })
          } else {
            this.setThemeWindowSize({ size: 'xl' })
          }
        }

        this._calculateWindowHeight()
      },

      _setNetworkConnected() {
        this.setConnectionStatus({ status: true })
      },

      _setNetworkDisconnected() {
        this.setConnectionStatus({ status: false })
      },

      /**
       * Calculate viewport size after window resizing
       *
       * @private
       */
      _calculateWindowHeight() {
        this.document.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

        document.body.style.height = `${this.document.viewportHeight - 50}px`
        this.document.minimalContentHeight = this.document.viewportHeight - 50
      },

    },

    head() {
      return {
        htmlAttrs: {
          'data-layout': 'layout_default',
        },
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import '~@fastybird-com/theme/assets/layout/default';
</style>
