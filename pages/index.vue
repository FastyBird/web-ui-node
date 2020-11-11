<template>
  <div class="fb-index__container">
    <div class="fb-index__container-inner">
      <fb-layout-sidebar
        slot="sidebar"
        :collapsed="menuCollapsed"
        @collapse="collapseMenu"
      >
        <nuxt-link
          slot="header"
          :to="localePath({ name: $routes.home })"
          class="fb-index__logo"
        >
          <logo />
        </nuxt-link>

        <template slot="content">
          <fb-layout-navigation :name="$t('application.menu.root')">
            <fb-layout-navigation-item
              :link="localePath({ name: $routes.home })"
              :label="$t('application.menu.dashboard')"
              type="nuxt_link"
            >
              <font-awesome-icon
                slot="icon"
                icon="tachometer-alt"
              />
            </fb-layout-navigation-item>
            <fb-layout-navigation-item
              :link="localePath({ name: $routes.devices.list })"
              :label="$t('application.menu.devices')"
              @click="collapseMenu"
              type="nuxt_link"
            >
              <font-awesome-icon
                slot="icon"
                icon="plug"
              />
            </fb-layout-navigation-item>
            <fb-layout-navigation-item
              :link="localePath({ name: $routes.triggers.list })"
              :label="$t('application.menu.triggers')"
              @click="collapseMenu"
              type="nuxt_link"
            >
              <font-awesome-icon
                slot="icon"
                icon="project-diagram"
              />
            </fb-layout-navigation-item>
          </fb-layout-navigation>

          <fb-layout-navigation :name="$t('application.menu.administration')">
            <fb-layout-navigation-item
              :link="localePath({ name: $routes.home })"
              :label="$t('application.menu.users')"
              type="nuxt_link"
            >
              <font-awesome-icon
                slot="icon"
                icon="users"
              />
            </fb-layout-navigation-item>
          </fb-layout-navigation>

          <fb-layout-navigation
            :name="$t('application.menu.user')"
            class="fb-index__user-navigation"
          >
            <fb-layout-navigation-item
              :label="$t('application.userMenu.accountSettings')"
              @click="openView(viewTypes.ACCOUNT_EDIT)"
              type="button"
            >
              <font-awesome-icon
                slot="icon"
                icon="user"
              />
            </fb-layout-navigation-item>
            <fb-layout-navigation-item
              :label="$t('application.userMenu.passwordChange')"
              @click="openView(viewTypes.PASSWORD_EDIT)"
              type="button"
            >
              <font-awesome-icon
                slot="icon"
                icon="lock"
              />
            </fb-layout-navigation-item>
            <fb-layout-navigation-divider />
            <fb-layout-navigation-item
              :label="$t('application.userMenu.signOut')"
              @click="signOut"
              type="button"
            >
              <font-awesome-icon
                slot="icon"
                icon="sign-out-alt"
              />
            </fb-layout-navigation-item>
          </fb-layout-navigation>
        </template>

        <fb-layout-user-menu
          slot="footer"
          :name="_.get(account, 'name')"
          class="fb-index__user-menu"
        >
          <gravatar
            slot="avatar"
            :email="_.get(account, 'email.address')"
            :size="36"
            :default-img="'mm'"
            :alt="_.get(account, 'name')"
          />

          <template slot="items">
            <fb-layout-user-menu-item
              :label="`Version: ${application.version}`"
              type="text"
            />
            <fb-layout-user-menu-divider />
            <fb-layout-user-menu-item
              :label="$t('application.userMenu.accountSettings')"
              @click="openView(viewTypes.ACCOUNT_EDIT)"
              type="button"
            >
              <font-awesome-icon
                slot="icon"
                icon="user"
              />
            </fb-layout-user-menu-item>
            <fb-layout-user-menu-item
              :label="$t('application.userMenu.passwordChange')"
              @click="openView(viewTypes.PASSWORD_EDIT)"
              type="button"
            >
              <font-awesome-icon
                slot="icon"
                icon="lock"
              />
            </fb-layout-user-menu-item>
            <fb-layout-user-menu-divider />
            <fb-layout-user-menu-item
              :label="$t('application.userMenu.signOut')"
              @click="signOut"
              type="button"
            >
              <font-awesome-icon
                slot="icon"
                icon="sign-out-alt"
              />
            </fb-layout-user-menu-item>
          </template>
        </fb-layout-user-menu>
      </fb-layout-sidebar>

      <fb-layout-content>
        <fb-layout-header
          slot="header"
          :menu-hidden="menuHidden"
          :menu-collapsed="menuCollapsed"
          @toggleMenu="toggleMenu"
        >
          <nuxt-link
            slot="logo"
            :to="localePath({ name: $routes.home })"
            class="fb-index__header-logo"
          >
            <logo />
          </nuxt-link>
        </fb-layout-header>

        <template slot="content">
          <nuxt-child />
        </template>

        <template slot="footer">
          <fb-layout-tabs :collapsed="tabsHidden">
            <fb-layout-tabs-item
              :label="$t('application.tabs.dashboard.title')"
              :link="localePath({ name: $routes.home })"
              type="nuxt_link"
            >
              <font-awesome-icon
                slot="icon"
                icon="tachometer-alt"
              />
            </fb-layout-tabs-item>
            <fb-layout-tabs-item
              :label="$t('application.tabs.devices.title')"
              :link="localePath({ name: $routes.devices.list })"
              type="nuxt_link"
            >
              <font-awesome-icon
                slot="icon"
                icon="plug"
              />
            </fb-layout-tabs-item>
            <fb-layout-tabs-item
              :label="$t('application.tabs.triggers.title')"
              :link="localePath({ name: $routes.triggers.list })"
              type="nuxt_link"
            >
              <font-awesome-icon
                slot="icon"
                icon="project-diagram"
              />
            </fb-layout-tabs-item>
          </fb-layout-tabs>

          <fb-layout-footer />
        </template>
      </fb-layout-content>
    </div>

    <fb-ui-modal-info
      v-if="!networkState"
      :enable-closing="false"
      class="fb-index__offline-info"
    >
      <div slot="info">
        <font-awesome-icon
          icon="power-off"
          class="fb-index__offline-info-icon"
        />

        <h3>
          {{ $t('application.headings.offlineState') }}
        </h3>

        <p>
          {{ $t('application.messages.offlineState') }}
        </p>
      </div>
    </fb-ui-modal-info>

    <account-edit
      v-if="view.accountEdit.opened && account !== null"
      @close="closeView(viewTypes.ACCOUNT_EDIT)"
    />

    <password-edit
      v-if="view.passwordEdit.opened && account !== null"
      :identity="systemIdentity"
      @close="closeView(viewTypes.PASSWORD_EDIT)"
    />

    <fb-layout-header-heading
      v-if="isMounted && heading !== null"
      :heading="heading"
      :sub-heading="subHeading"
    />

    <fb-layout-phone-menu />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import get from 'lodash/get'

import Gravatar from 'vue-gravatar'

import { version } from './../package.json'

import * as config from '~/configuration'

import Account from '~/models/auth-node/accounts/Account'
import { AccountInterface } from '~/models/auth-node/accounts/types'
import Identity from '~/models/auth-node/identities/Identity'
import { IdentityInterface } from '~/models/auth-node/identities/types'

import Device from '~/models/devices-node/devices/Device'

import Trigger from '~/models/triggers-node/triggers/Trigger'

// @ts-ignore
import Logo from '~/assets/images/fastybird_row.svg?inline'

// @ts-ignore
const AccountEdit = () => import('~/components/account/AccountEdit')
// @ts-ignore
const PasswordEdit = () => import('~/components/account/PasswordEdit')

enum ViewTypes {
  ACCOUNT_EDIT = 'accountEdit',
  PASSWORD_EDIT = 'passwordEdit',
}

interface IndexPageViewAccountEditInterface {
  opened: boolean
}

interface IndexPageViewPasswordEditInterface {
  opened: boolean
}

interface IndexPageViewInterface {
  accountEdit: IndexPageViewAccountEditInterface
  passwordEdit: IndexPageViewPasswordEditInterface
}

interface IndexPageApplicationInterface {
  author: string
  website: string
  version: string
}

export default defineComponent({

  name: 'IndexPage',

  middleware: 'authenticated',

  transition: 'fade',

  components: {
    Gravatar,

    AccountEdit,
    PasswordEdit,

    Logo,
  },

  setup(props: {}, context: SetupContext) {
    const view = reactive<IndexPageViewInterface>({
      accountEdit: {
        opened: false,
      },
      passwordEdit: {
        opened: false,
      },
    })

    const menuCollapsed = ref<boolean>(true)

    const application = reactive<IndexPageApplicationInterface>({
      author: config.AUTHOR_NAME,
      website: config.AUTHOR_WEBSITE,
      version,
    })

    const account = computed<AccountInterface | null>((): AccountInterface | null => context.root.$store.getters['session/getAccount']())

    const networkState = computed<boolean>((): boolean => context.root.$store.state.app.networkState)

    const systemIdentity = computed<IdentityInterface | null>((): IdentityInterface | null => {
      if (account.value === null || account.value.email === null) {
        return null
      }

      return Identity
        .query()
        .where('uid', account.value.email.address)
        .first()
    })

    const menuHidden = computed<boolean>((): boolean => context.root.$store.state.app.hideMenu)

    const tabsHidden = computed<boolean>((): boolean => context.root.$store.state.app.hideTabs)

    const heading = computed<string | null>((): string | null => context.root.$store.state.app.heading.heading)

    const subHeading = computed<string | null>((): string | null => context.root.$store.state.app.heading.subHeading)

    const isMounted = ref<boolean>(false)

    function wampOnMessage(data: string): void {
      const body = JSON.parse(data)

      if (
        Object.prototype.hasOwnProperty.call(body, 'routing_key') &&
        Object.prototype.hasOwnProperty.call(body, 'origin') &&
        Object.prototype.hasOwnProperty.call(body, 'data')
      ) {
        context.root.$store.$db().entities
          .forEach((entity) => {
            if (
              Object.prototype.hasOwnProperty.call(entity.module, 'actions') &&
              Object.prototype.hasOwnProperty.call(entity.module.actions, 'socketData')
            ) {
              entity.model.dispatch('socketData', {
                origin: get(body, 'origin'),
                routingKey: get(body, 'routing_key'),
                data: JSON.stringify(get(body, 'data')),
              })
            }
          })
      }
    }

    function windowResizeHandler(): void {
      if (!document.hidden) {
        if (matchMedia('(max-width: 575px)').matches) {
          context.root.$store.dispatch('app/setWindowSize', {
            size: 'xs',
          }, {
            root: true,
          })
        } else if (matchMedia('(max-width: 767px)').matches) {
          context.root.$store.dispatch('app/setWindowSize', {
            size: 'sm',
          }, {
            root: true,
          })
        } else if (matchMedia('(max-width: 991px)').matches) {
          context.root.$store.dispatch('app/setWindowSize', {
            size: 'md',
          }, {
            root: true,
          })
        } else if (matchMedia('(max-width: 1199px)').matches) {
          context.root.$store.dispatch('app/setWindowSize', {
            size: 'lg',
          }, {
            root: true,
          })
        } else {
          context.root.$store.dispatch('app/setWindowSize', {
            size: 'xl',
          }, {
            root: true,
          })
        }
      }
    }

    function touchDetectHandler(): void {
      context.root.$store.dispatch('app/setTouchDeviceState', {
        state: true,
      }, {
        root: true,
      })

      // We only need to know once that a human touched the screen, so we can stop listening now
      window.removeEventListener('touchstart', touchDetectHandler, false)
    }

    function setNetworkConnected(): void {
      context.root.$store.dispatch('app/setNetworkState', {
        state: true,
      }, {
        root: true,
      })
    }

    function setNetworkDisconnected(): void {
      context.root.$store.dispatch('app/setNetworkState', {
        state: false,
      }, {
        root: true,
      })
    }

    onMounted((): void => {
      isMounted.value = true

      context.root.$bus.$emit('wait-page_reloading', false)

      if (networkState.value) {
        context.root.$wamp.open()
      }

      context.root.$wamp.subscribe(config.IO_SOCKET_TOPIC_EXCHANGE, wampOnMessage)

      windowResizeHandler()

      window.addEventListener('visibilitychange', windowResizeHandler)
      window.addEventListener('DOMContentLoaded', windowResizeHandler)
      window.addEventListener('resize', windowResizeHandler)
      window.addEventListener('orientationchange', windowResizeHandler)

      window.addEventListener('touchstart', touchDetectHandler, false)

      window.addEventListener('online', setNetworkConnected)
      window.addEventListener('offline', setNetworkDisconnected)
    })

    onBeforeUnmount((): void => {
      window.removeEventListener('visibilitychange', windowResizeHandler)
      window.removeEventListener('DOMContentLoaded', windowResizeHandler)
      window.removeEventListener('resize', windowResizeHandler)
      window.removeEventListener('orientationchange', windowResizeHandler)

      window.removeEventListener('touchstart', touchDetectHandler, false)

      window.removeEventListener('online', setNetworkConnected)
      window.removeEventListener('offline', setNetworkDisconnected)

      context.root.$wamp.unsubscribe(config.IO_SOCKET_TOPIC_EXCHANGE, wampOnMessage)
    })

    function signOut(): void {
      context.root.$bus.$emit('wait-page_reloading', true)

      context.root.$cookies.remove('token')
      context.root.$cookies.remove('refresh_token')

      context.root.$wamp.close()

      // Process cleanup
      context.root.$store.dispatch('entities/deleteAll')

      Account.dispatch('reset')
      Device.dispatch('reset')
      Trigger.dispatch('reset')

      context.root.$store.dispatch('session/clear')

      context.root.$bus.$emit('user_signed-out', true)
    }

    function toggleMenu(): void {
      menuCollapsed.value = !menuCollapsed.value
    }

    function collapseMenu(): void {
      menuCollapsed.value = true
    }

    function openView(type: ViewTypes): void {
      collapseMenu()

      view[type].opened = true
    }

    function closeView(type: ViewTypes): void {
      view[type].opened = false
    }

    watch(
      (): boolean => networkState.value,
      (val: boolean): void => {
        if (val && isMounted.value) {
          context.root.$wamp.open()
        }
      },
    )

    return {
      view,
      viewTypes: ViewTypes,
      isMounted,
      menuCollapsed,
      application,
      account,
      networkState,
      systemIdentity,
      menuHidden,
      tabsHidden,
      heading,
      subHeading,
      signOut,
      toggleMenu,
      collapseMenu,
      openView,
      closeView,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
