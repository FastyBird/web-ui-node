import Vue from 'vue'
import { Store } from 'vuex'

import { WampClientInterface } from '@fastybird/vue-wamp-v1'
import { NuxtCookies } from 'cookie-universal-nuxt'

import { Plugin } from '@nuxt/types'

import VueCompositionApi from '@vue/composition-api'

import FastyBirdTheme,
{
  FbUiAlert,
  FbUiButton,
  FbUiContent,
  FbUiConfirmationWindow,
  FbUiDivider,
  FbUiItemsContainer,
  FbUiIconWithChild,
  FbUiLoadingBox,
  FbUiMediaItem,
  FbUiModalForm,
  FbUiModalInfo,
  FbUiModalHeader,
  FbUiModalHeaderIcon,
  FbUiModalWindow,
  FbUiNoResults,
  FbUiPageLoading,
  FbUiResultErr,
  FbUiResultOk,
  FbUiSpinner,
  FbUiSwitchElement,
  FbUiTransitionExpand,
  FbFormInput,
  FbFormCheckbox,
  FbFormCheckboxesGroup,
  FbFormRadioButton,
  FbFormRadioButtonsGroup,
  FbFormSelect,
  FbFormTextArea,
  FbLayoutContent,
  FbLayoutFooter,
  FbLayoutHeader,
  FbLayoutHeaderHeading,
  FbLayoutHeaderButton,
  FbLayoutHeaderContent,
  FbLayoutHeaderIcon,
  FbLayoutHeaderMenuButton,
  FbLayoutHeaderSpacer,
  FbLayoutNavigation,
  FbLayoutNavigationItem,
  FbLayoutNavigationDivider,
  FbLayoutPhoneMenu,
  FbLayoutPhoneMenuButton,
  FbLayoutPhoneMenuContent,
  FbLayoutPhoneMenuHeading,
  FbLayoutSidebar,
  FbLayoutSignBox,
  FbLayoutSignFooter,
  FbLayoutSignFooterItem,
  FbLayoutTabs,
  FbLayoutTabsItem,
  FbLayoutUserMenu,
  FbLayoutUserMenuItem,
  FbLayoutUserMenuDivider,
} from '@fastybird/web-ui-theme'

// @ts-ignore
import PrettyCheckbox from 'pretty-checkbox-vue'

// Layout components
import DesktopDetailHeading from '~/components/layout/DesktopDetailHeading/index.vue'
import DesktopDetailToolbar from '~/components/layout/DesktopDetailToolbar/index.vue'
import ExpandableBox from '~/components/layout/ExpandableBox/index.vue'
import ListItem from '~/components/layout/ListItem/index.vue'
import ListLayout from '~/components/layout/ListLayout/index.vue'
import ListItemsSearch from '~/components/layout/ListItemsSearch/index.vue'
import NoResults from '~/components/layout/NoResults/index.vue'
import OffCanvas from '~/components/layout/OffCanvas/index.vue'
import OffCanvasBody from '~/components/layout/OffCanvas/Body/index.vue'
import OffCanvasButton from '~/components/layout/OffCanvas/Button/index.vue'
import ScrollShadow from '~/components/layout/ScrollShadow/index.vue'

import HelpersMixin from '~/mixins/helpers'

Vue.use(VueCompositionApi)

Vue.use(FastyBirdTheme)

Vue.use(PrettyCheckbox)

Vue.component('DesktopDetailHeading', DesktopDetailHeading)
Vue.component('DesktopDetailToolbar', DesktopDetailToolbar)
Vue.component('ExpandableBox', ExpandableBox)
Vue.component('ListItem', ListItem)
Vue.component('ListLayout', ListLayout)
Vue.component('ListItemsSearch', ListItemsSearch)
Vue.component('NoResults', NoResults)
Vue.component('OffCanvas', OffCanvas)
Vue.component('OffCanvasBody', OffCanvasBody)
Vue.component('OffCanvasButton', OffCanvasButton)
Vue.component('ScrollShadow', ScrollShadow)

Vue.component('FbUiAlert', FbUiAlert)
Vue.component('FbUiButton', FbUiButton)
Vue.component('FbUiContent', FbUiContent)
Vue.component('FbUiConfirmationWindow', FbUiConfirmationWindow)
Vue.component('FbUiDivider', FbUiDivider)
Vue.component('FbUiItemsContainer', FbUiItemsContainer)
Vue.component('FbUiIconWithChild', FbUiIconWithChild)
Vue.component('FbUiLoadingBox', FbUiLoadingBox)
Vue.component('FbUiMediaItem', FbUiMediaItem)
Vue.component('FbUiModalForm', FbUiModalForm)
Vue.component('FbUiModalInfo', FbUiModalInfo)
Vue.component('FbUiModalHeader', FbUiModalHeader)
Vue.component('FbUiModalHeaderIcon', FbUiModalHeaderIcon)
Vue.component('FbUiModalWindow', FbUiModalWindow)
Vue.component('FbUiNoResults', FbUiNoResults)
Vue.component('FbUiPageLoading', FbUiPageLoading)
Vue.component('FbUiResultErr', FbUiResultErr)
Vue.component('FbUiResultOk', FbUiResultOk)
Vue.component('FbUiSpinner', FbUiSpinner)
Vue.component('FbUiSwitchElement', FbUiSwitchElement)
Vue.component('FbUiTransitionExpand', FbUiTransitionExpand)

Vue.component('FbFormInput', FbFormInput)
Vue.component('FbFormCheckbox', FbFormCheckbox)
Vue.component('FbFormCheckboxesGroup', FbFormCheckboxesGroup)
Vue.component('FbFormRadioButton', FbFormRadioButton)
Vue.component('FbFormRadioButtonsGroup', FbFormRadioButtonsGroup)
Vue.component('FbFormSelect', FbFormSelect)
Vue.component('FbFormTextArea', FbFormTextArea)

Vue.component('FbLayoutContent', FbLayoutContent)
Vue.component('FbLayoutFooter', FbLayoutFooter)
Vue.component('FbLayoutHeader', FbLayoutHeader)
Vue.component('FbLayoutHeaderHeading', FbLayoutHeaderHeading)
Vue.component('FbLayoutHeaderButton', FbLayoutHeaderButton)
Vue.component('FbLayoutHeaderContent', FbLayoutHeaderContent)
Vue.component('FbLayoutHeaderIcon', FbLayoutHeaderIcon)
Vue.component('FbLayoutHeaderMenuButton', FbLayoutHeaderMenuButton)
Vue.component('FbLayoutHeaderSpacer', FbLayoutHeaderSpacer)
Vue.component('FbLayoutNavigation', FbLayoutNavigation)
Vue.component('FbLayoutNavigationItem', FbLayoutNavigationItem)
Vue.component('FbLayoutNavigationDivider', FbLayoutNavigationDivider)
Vue.component('FbLayoutPhoneMenu', FbLayoutPhoneMenu)
Vue.component('FbLayoutPhoneMenuButton', FbLayoutPhoneMenuButton)
Vue.component('FbLayoutPhoneMenuContent', FbLayoutPhoneMenuContent)
Vue.component('FbLayoutPhoneMenuHeading', FbLayoutPhoneMenuHeading)
Vue.component('FbLayoutSidebar', FbLayoutSidebar)
Vue.component('FbLayoutSignBox', FbLayoutSignBox)
Vue.component('FbLayoutSignFooter', FbLayoutSignFooter)
Vue.component('FbLayoutSignFooterItem', FbLayoutSignFooterItem)
Vue.component('FbLayoutTabs', FbLayoutTabs)
Vue.component('FbLayoutTabsItem', FbLayoutTabsItem)
Vue.component('FbLayoutUserMenu', FbLayoutUserMenu)
Vue.component('FbLayoutUserMenuItem', FbLayoutUserMenuItem)
Vue.component('FbLayoutUserMenuDivider', FbLayoutUserMenuDivider)

Vue.mixin(HelpersMixin)

declare module 'vue/types/vue' {
  interface Vue {
    $validateUUID(uuid: string): boolean
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $validateUUID(uuid: string): boolean
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $validateUUID(uuid: string): boolean
  }
}

// eslint-disable-next-line no-empty-pattern
const validateUUIDPlugin: Plugin = ({}, inject): void => {
  inject('validateUUID', (uuid: string): boolean => {
    const regex = /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/i

    return regex.test(uuid)
  })
}

export default validateUUIDPlugin

declare module 'vuex/types/index' {
  interface Store<S> {
    $wamp: WampClientInterface
  }
}

// Cookies plugin
declare module 'vue/types/vue' {
  interface Vue {
    $cookies: NuxtCookies
  }

  interface VueConstructor {
    $cookies: NuxtCookies
  }
}
