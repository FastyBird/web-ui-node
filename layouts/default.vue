<template>
  <div class="fb-application__container">
    <fb-sign-layout
      v-if="signLayout"
      :sign-in-link="localePath({ name: $routes.account.signIn })"
      :sign-up-link="localePath({ name: $routes.account.signUp })"
      :author-website="application.website"
      :author-name="application.name"
    >
      <nuxt slot="content" />
    </fb-sign-layout>

    <fb-default-layout
      v-else
      ref="default-layout"
      :heading="heading"
      :sub-heading="subHeading"
      :heading-info-text="headingInfoText"
      :heading-style="headingStyle"
      :heading-icon="headingIcon"
      :has-profile="account !== null"
      :user-name="_.get(account, 'name')"
      :user-email="_.get(account, 'email')"
      :menu-items="navigationItems"
      :phone-menu-items="phoneNavigationItems"
      :user-menu-items="userMenuItems"
      :bottom-menu-items="bottomMenuItems"
      :heading-tabs="headingTabs"
      :heading-left-button="headingLeftButton"
      :heading-right-button="headingRightButton"
      :heading-action-button="headingActionButton"
      :main-menu-collapsed="mainMenuCollapsed"
      :bottom-menu-collapsed="bottomMenuCollapsed"
      :home-link="localePath({ name: $routes.home })"
      :app-version="application.version"
      :author-website="application.website"
      :author-name="application.name"
      :content-height-adjust="contentHeightAdjust"
      :padding-top="paddingTop"
      :padding-bottom="paddingBottom"
      :viewport-height="viewportHeight"
      @collapseMenu="collapseMenu"
      @toggleMenu="toggleMenu"
      @headingIconClicked="headingIconClicked"
      @headingLeftButtonClicked="headingLeftButtonClicked"
      @headingRightButtonClicked="headingRightButtonClicked"
      @headingActionButtonClicked="headingActionButtonClicked"
      @mounted="componentsMounted"
    >
      <nuxt slot="content" />

      <template slot="other">
        <fb-modal-info
          v-show="networkState === false"
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

        <password-edit
          v-if="view.passwordEdit.show && account !== null"
          :account="account"
          :identity="systemIdentity"
          @close="closeView('passwordEdit')"
        />

        <security-edit
          v-if="view.securityEdit.show && account !== null"
          :account="account"
          @close="closeView('securityEdit')"
        />
      </template>
    </fb-default-layout>

    <fb-page-loading v-if="loadingOverlay" />
  </div>
</template>

<script>
import Ajv from 'ajv'
import Jsona from 'jsona'
import * as devicePropertySchema from '@/node_modules/@fastybird-com/json-schemas/resources/storage-node/entity.device.property.json'
import * as channelPropertySchema from '@/node_modules/@fastybird-com/json-schemas/resources/storage-node/entity.channel.property.json'

import { version } from './../package.json'

import * as config from '~/configuration'

import Identity from '~/models/accounts-node/Identity'
import Account from '~/models/accounts-node/Account'
import Session from '~/models/accounts-node/Session'
import Device from '~/models/devices-node/Device'
import DeviceProperty from '~/models/devices-node/DeviceProperty'
import Channel from '~/models/devices-node/Channel'
import ChannelProperty from '~/models/devices-node/ChannelProperty'
import Trigger from '~/models/triggers-node/Trigger'
import Thing from '~/models/things/Thing'

const FbDefaultLayout = () => import('@/node_modules/@fastybird-com/ui-theme/layouts/default')
const FbSignLayout = () => import('@/node_modules/@fastybird-com/ui-theme/layouts/sign')

const AccountEdit = () => import('~/components/account/AccountEdit')
const PasswordEdit = () => import('~/components/account/PasswordEdit')
const SecurityEdit = () => import('~/components/account/SecurityEdit')

export default {

  name: 'LayoutDefault',

  components: {
    FbDefaultLayout,
    FbSignLayout,

    AccountEdit,
    PasswordEdit,
    SecurityEdit,
  },

  data() {
    return {
      loadingOverlay: false,
      view: {
        accountEdit: {
          show: false,
        },
        passwordEdit: {
          show: false,
        },
        securityEdit: {
          show: false,
        },
      },
      navigationItems: [],
      userMenuItems: [],
      bottomMenuItems: [],
      application: {
        author: config.AUTHOR_NAME,
        website: config.AUTHOR_WEBSITE,
        version,
      },
      viewportHeight: 0,
      signLayout: true,
    }
  },

  computed: {

    networkState() {
      return this.$store.state.app.networkState
    },

    exchangeState() {
      return this.$store.state.wamp.isConnected
    },

    windowSize() {
      return this.$store.state.template.windowSize
    },

    session() {
      return Session.query().first()
    },

    heading() {
      return this.$store.state.template.heading.heading
    },

    subHeading() {
      return this.$store.state.template.heading.subHeading
    },

    headingInfoText() {
      return this.$store.state.template.heading.infoText
    },

    headingStyle() {
      return this.$store.state.template.heading.style
    },

    headingIcon() {
      return this.$store.state.template.heading.icon
    },

    headingTabs() {
      return this.$store.state.template.heading.tabs
    },

    headingLeftButton() {
      return this.$store.state.template.leftButton
    },

    headingRightButton() {
      return this.$store.state.template.rightButton
    },

    headingActionButton() {
      return this.$store.state.template.actionButton
    },

    account() {
      if (this.session === null) {
        return null
      }

      return Account
        .query()
        .with('emails')
        .with('identities')
        .with('security_question')
        .where('session_id', this.session.id)
        .first()
    },

    systemIdentity() {
      if (this.account === null || this.account.primaryEmail === null) {
        return null
      }

      return Identity
        .query()
        .where('email', this.account.primaryEmail.address)
        .first()
    },

    phoneNavigationItems() {
      const items = []

      Object.assign(items, this.navigationItems)

      items.push({
        name: 'User',
        meta: {
          label: this.$t('application.menu.user'),
        },
        items: this.userMenuItems,
      })

      return items
    },

    contentHeightAdjust() {
      return this.$store.getters['template/bodyTopBottomMargin']()
    },

    paddingTop() {
      return this.$store.getters['template/bodyTopMargin']()
    },

    paddingBottom() {
      return this.$store.getters['template/bodyBottomMargin']()
    },

    mainMenuCollapsed() {
      return this.$store.state.app.menu.main
    },

    bottomMenuCollapsed() {
      return this.$store.state.app.menu.bottom
    },

  },

  watch: {

    networkState(val) {
      if (val && this.isSignedIn) {
        this.$wamp.open()
      } else {
        this.$wamp.close()
      }
    },

    isSignedIn(val) {
      if (val && this.networkState) {
        if (this.loadingOverlay) {
          this.$nextTick(() => {
            this.loadingOverlay = false
          })
        }
      } else {
        this.$wamp.close()
      }
    },

    exchangeState(val) {
      if (val) {
        return this.$wamp
          .subscribe(config.IO_SOCKET_TOPIC_EXCHANGE, (data) => {
            const body = JSON.parse(data)

            if (
              Object.prototype.hasOwnProperty.call(body, 'routing_key') &&
              Object.prototype.hasOwnProperty.call(body, 'origin') &&
              Object.prototype.hasOwnProperty.call(body, 'data')
            ) {
              switch (this._.get(body, 'routing_key')) {
                case 'fb.bus.node.entity.created.device.property':
                case 'fb.bus.node.entity.updated.device.property':
                  this._processDevicePropertyMessage(this._.get(body, 'data'), this._.get(body, 'origin'))
                  break

                case 'fb.bus.node.entity.created.channel.property':
                case 'fb.bus.node.entity.updated.channel.property':
                  this._processChannelPropertyMessage(this._.get(body, 'data'), this._.get(body, 'origin'))
                  break
              }
            }
          })
          .then(() => {
            // eslint-disable-next-line
            console.log('[WAMP] subscribed to exchange')
          })
      }
    },

  },

  created() {
    this.navigationItems = this._.cloneDeep(config.MENU_ITEMS)
    this.navigationItems.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(item, 'meta') && Object.prototype.hasOwnProperty.call(item.meta, 'label')) {
        // eslint-disable-next-line no-param-reassign
        item.meta.label = this.$t(item.meta.label)
      }

      if (Object.prototype.hasOwnProperty.call(item, 'items')) {
        item.items.forEach((subItem) => {
          if (Object.prototype.hasOwnProperty.call(subItem, 'link')) {
            // eslint-disable-next-line no-param-reassign
            subItem.link = this.localePath({ name: subItem.link, hash: this._.get(item, 'hash') })
          }

          if (Object.prototype.hasOwnProperty.call(subItem, 'meta') && Object.prototype.hasOwnProperty.call(subItem.meta, 'label')) {
            // eslint-disable-next-line no-param-reassign
            subItem.meta.label = this.$t(subItem.meta.label)
          }
        })
      }
    })

    this.userMenuItems = this._.cloneDeep(config.USER_MENU_ITEMS)
    this.userMenuItems.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(item, 'link')) {
        // eslint-disable-next-line no-param-reassign
        item.link = this.localePath({ name: item.link, hash: this._.get(item, 'hash') })
      }

      if (Object.prototype.hasOwnProperty.call(item, 'meta') && Object.prototype.hasOwnProperty.call(item.meta, 'label')) {
        // eslint-disable-next-line no-param-reassign
        item.meta.label = this.$t(item.meta.label)
      }
    })

    this.bottomMenuItems = this._.cloneDeep(config.MOBILE_BOTTOM_TABS)
    this.bottomMenuItems.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.link = this.localePath({ name: item.link, hash: this._.get(item, 'hash') })
      // eslint-disable-next-line no-param-reassign
      item.name = this.$t(item.name)
    })

    this.signLayout = !this.isSignedIn
  },

  mounted() {
    if (this.networkState && this.isSignedIn) {
      this.$wamp.open()
    }

    this.$bus.$on('modal-open_account-settings', () => {
      this.openView('accountEdit')
    })

    this.$bus.$on('modal-open_password-settings', () => {
      this.openView('passwordEdit')
    })

    this.$bus.$on('modal-open_security-settings', () => {
      this.openView('securityEdit')
    })

    this.$bus.$on('wait-page_reloading', (status) => {
      if (typeof status === 'number') {
        this.timers.hideOverlay.time = status * 1000
        this.$timer.start('hideOverlay')

        this.loadingOverlay = true
      } else if (status === false && this.timers.hideOverlay.isRunning) {
        this.timers.hideOverlay.time = 500
        this.$timer.restart('hideOverlay')
      } else {
        this.loadingOverlay = status
      }
    })

    this.$bus.$on('user_signed-in', () => {
      this.$router.push(this.localePath({ name: this.$routes.home }))

      this.$nextTick(() => {
        this.signLayout = false

        this.$wamp.open()
      })
    })

    this.$bus.$on('user_signed-out', () => {
      this.$bus.$emit('wait-page_reloading', true)

      this.$cookies.remove('token')
      this.$cookies.remove('refresh_token')

      this.$wamp.close()

      // Process cleanup
      this.$store.dispatch('entities/deleteAll')

      Session.dispatch('reset')
      Device.dispatch('reset')
      Trigger.dispatch('reset')
      Thing.dispatch('reset')

      this.$router.push(this.localePath({ name: this.$routes.account.signIn }))

      this.$nextTick(() => {
        this.signLayout = true
      })
    })

    this.$bus.$on('devices_fetched', this._fetchDevicesProperties)
    this.$bus.$on('device_fetched', this._fetchDeviceProperties)

    this.$wamp.onConnectEvent(this._wampOnConnect)
    this.$wamp.onCloseEvent(this._wampOnDisconnect)

    this._windowResizeHandler()

    window.addEventListener('visibilitychange', this._windowResizeHandler)
    window.addEventListener('DOMContentLoaded', this._windowResizeHandler)
    window.addEventListener('resize', this._windowResizeHandler)
    window.addEventListener('orientationchange', this._windowResizeHandler)
    window.addEventListener('touchstart', this._touchDetectHandler, false)
    window.addEventListener('online', this._setNetworkConnected)
    window.addEventListener('offline', this._setNetworkDisconnected)
  },

  beforeDestroy() {
    window.removeEventListener('visibilitychange', this._windowResizeHandler)
    window.removeEventListener('DOMContentLoaded', this._windowResizeHandler)
    window.removeEventListener('resize', this._windowResizeHandler)
    window.removeEventListener('orientationchange', this._windowResizeHandler)
    window.removeEventListener('touchstart', this._touchDetectHandler, false)
    window.removeEventListener('online', this._setNetworkConnected)
    window.removeEventListener('offline', this._setNetworkDisconnected)

    this.$bus.$off('modal-open_account-settings')
    this.$bus.$off('modal-open_password-settings')

    this.$bus.$off('devices_fetched', this._fetchDevicesProperties)
    this.$bus.$off('device_fetched', this._fetchDeviceProperties)

    this.$bus.$off('wait-page_reloading')
    this.$bus.$off('wait-page_reloading')

    this.$wamp.offConnectEvent(this._wampOnConnect)
    this.$wamp.offCloseEvent(this._wampOnDisconnect)
  },

  methods: {

    /**
     * Open view
     *
     * @param {String} view
     */
    openView(view) {
      if (Object.prototype.hasOwnProperty.call(this.view, view)) {
        this.view[view].show = true
      }
    },

    /**
     * Close opened view
     *
     * @param {String} view
     */
    closeView(view) {
      if (Object.prototype.hasOwnProperty.call(this.view, view)) {
        this.view[view].show = false
      }
    },

    collapseMenu() {
      this.$store.dispatch('app/mainMenuCollapse', null, {
        root: true,
      })
    },

    toggleMenu() {
      this.$store.dispatch('app/mainMenuToggle', null, {
        root: true,
      })
    },

    headingIconClicked() {
      this.$bus.$emit('heading_icon-clicked')
    },

    headingLeftButtonClicked() {
      this.$bus.$emit('heading_left_button-clicked')
    },

    headingRightButtonClicked() {
      this.$bus.$emit('heading_right_button-clicked')
    },

    headingActionButtonClicked() {
      this.$bus.$emit('heading_action_button-clicked')
    },

    componentsMounted() {
      this._applyBodyLimits()
    },

    _setNetworkConnected() {
      this.$store.dispatch('app/setNetworkState', {
        state: true,
      }, {
        root: true,
      })
    },

    _setNetworkDisconnected() {
      this.$store.dispatch('app/setNetworkState', {
        state: false,
      }, {
        root: true,
      })
    },

    _wampOnConnect() {
      // eslint-disable-next-line
      console.log('[WAMP] connected')
    },

    _wampOnDisconnect(reason) {
      // eslint-disable-next-line
      console.log(`[WAMP] closed: ${reason}`)
    },

    _processDevicePropertyMessage(data, origin) {
      const ajv = new Ajv()

      const valid = ajv.validate(devicePropertySchema, data)

      if (valid) {
        const device = Device
          .query()
          .where('identifier', this._.get(data, 'device'))
          .first()

        if (device === null) {
          return
        }

        const property = DeviceProperty
          .query()
          .where('property', this._.get(data, 'property'))
          .where('device_id', device.id)
          .first()

        if (property !== null) {
          if (origin === config.NODE_STORAGE_ORIGIN) {
            DeviceProperty.update({
              where: property.id,
              data: {
                value: this._.get(data, 'value'),
                expected: this._.get(data, 'expected'),
                pending: this._.get(data, 'pending'),
              },
            })
              .catch(() => {
                // Nothing to do here
              })
          }
        }
      }
    },

    _processChannelPropertyMessage(data, origin) {
      const ajv = new Ajv()

      const valid = ajv.validate(channelPropertySchema, data)

      if (valid) {
        const device = Device
          .query()
          .where('identifier', this._.get(data, 'device'))
          .first()

        if (device === null) {
          return
        }

        const channel = Channel
          .query()
          .where('channel', this._.get(data, 'channel'))
          .where('device_id', device.id)
          .first()

        if (channel === null) {
          return
        }

        const property = ChannelProperty
          .query()
          .where('property', this._.get(data, 'property'))
          .where('channel_id', channel.id)
          .first()

        if (property !== null) {
          if (origin === config.NODE_STORAGE_ORIGIN) {
            ChannelProperty.update({
              where: property.id,
              data: {
                value: this._.get(data, 'value'),
                expected: this._.get(data, 'expected'),
                pending: this._.get(data, 'pending'),
              },
            })
              .catch(() => {
                // Nothing to do here
              })
          }
        }
      }
    },

    /**
     * Fetch properties storage data for all devices & devices channels
     */
    _fetchDevicesProperties() {
      const devices = Device.all()

      devices
        .forEach((device) => {
          this._fetchDeviceProperties(device.id)
        })
    },

    /**
     * Fetch properties storage data for device & device channels
     *
     * @param {String} id
     */
    _fetchDeviceProperties(id) {
      const dataFormatter = new Jsona()

      const device = Device.find(id)

      this.$backendApi.fetchDeviceProperties({ device: device.identifier })
        .then((deviceResponse) => {
          dataFormatter.deserialize(deviceResponse.data)
            .forEach((propertyData) => {
              const property = DeviceProperty
                .query()
                .where('property', propertyData.id)
                .where('device_id', device.id)
                .first()

              if (property) {
                DeviceProperty
                  .update({
                    where: property.id,
                    data: {
                      value: propertyData.value,
                    },
                  })
              }
            })

          const channels = Channel
            .query()
            .where('device_id', device.id)
            .all()

          channels
            .forEach((channel) => {
              this.$backendApi.fetchChannelProperties({ device: device.identifier, channel: channel.channel })
                .then((channelResponse) => {
                  dataFormatter.deserialize(channelResponse.data)
                    .forEach((propertyData) => {
                      const property = ChannelProperty
                        .query()
                        .where('property', propertyData.id)
                        .where('channel_id', channel.id)
                        .first()

                      if (property) {
                        ChannelProperty
                          .update({
                            where: property.id,
                            data: {
                              value: propertyData.value,
                            },
                          })
                      }
                    })
                })
            })
        })
    },

    /**
     * Window resize handler
     */
    _windowResizeHandler() {
      this._applyBodyLimits()

      if (!document.hidden) {
        if (matchMedia('(max-width: 575px)').matches) {
          this.$store.dispatch('template/setWindowSize', {
            size: 'xs',
          }, {
            root: true,
          })
        } else if (matchMedia('(max-width: 767px)').matches) {
          this.$store.dispatch('template/setWindowSize', {
            size: 'sm',
          }, {
            root: true,
          })
        } else if (matchMedia('(max-width: 991px)').matches) {
          this.$store.dispatch('template/setWindowSize', {
            size: 'md',
          }, {
            root: true,
          })
        } else if (matchMedia('(max-width: 1199px)').matches) {
          this.$store.dispatch('template/setWindowSize', {
            size: 'lg',
          }, {
            root: true,
          })
        } else {
          this.$store.dispatch('template/setWindowSize', {
            size: 'xl',
          }, {
            root: true,
          })
        }

        this.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      }

      if (this._.get(this.$refs, 'footer')) {
        const elementHeight = this._.get(this.$refs, 'footer.clientHeight')

        this.$store.dispatch('template/setBodyMargin', {
          key: 'footer',
          position: 'bottom',
          margin: elementHeight,
        }, {
          root: true,
        })
      }
    },

    /**
     * Touch device detect handler
     */
    _touchDetectHandler() {
      this.$store.dispatch('app/setTouchDeviceState', {
        state: true,
      }, {
        root: true,
      })

      // We only need to know once that a human touched the screen, so we can stop listening now
      window.removeEventListener('touchstart', this._touchDetectHandler, false)
    },

    /**
     * Calculate viewport size after window resizing
     *
     * @private
     */
    _applyBodyLimits() {
      const footer = this._.get(this.$refs, 'default-layout.$refs.footer')

      if (footer) {
        const elementHeight = this._.get(footer, 'clientHeight')

        this.$store.dispatch('template/setBodyMargin', {
          key: 'footer',
          position: 'bottom',
          margin: elementHeight,
        }, {
          root: true,
        })
      }

      const bottomNavigation = this._.get(this.$refs, 'default-layout.$refs.bottom-navigation.$refs.container')

      if (bottomNavigation) {
        const elementHeight = this._.get(bottomNavigation, 'clientHeight')

        this.$store.dispatch('template/setBodyMargin', {
          key: 'bottom-navigation',
          position: 'bottom',
          margin: this.bottomMenuCollapsed ? 0 : elementHeight,
        }, {
          root: true,
        })
      }

      const phoneHeader = this._.get(this.$refs, 'default-layout.$refs.phone-header.$refs.container')

      if (phoneHeader) {
        const elementHeight = this._.get(phoneHeader, 'clientHeight')

        this.$store.dispatch('template/setBodyMargin', {
          key: 'phone-header',
          position: 'top',
          margin: elementHeight,
        }, {
          root: true,
        })
      }

      const desktopHeader = this._.get(this.$refs, 'default-layout.$refs.desktop-header.$refs.container')

      if (desktopHeader) {
        const elementHeight = this._.get(desktopHeader, 'clientHeight')

        this.$store.dispatch('template/setBodyMargin', {
          key: 'desktop-header',
          position: 'top',
          margin: elementHeight,
        }, {
          root: true,
        })
      }
    },

    hideOverlay() {
      this.loadingOverlay = false

      this.$timer.stop('hideOverlay')
    },

  },

  head() {
    return {
      bodyAttrs: {
        'data-page': this._.get(this.$route, 'name', 'not-defined'),
        style: `padding-top: ${this.$store.getters['template/bodyTopMargin']()}px`,
      },
    }
  },

  timers: {
    hideOverlay: {
      time: 2000,
    },
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'default';
</style>
