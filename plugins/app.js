import Vue from 'vue'

import FastyBirdTheme from '@/node_modules/@fastybird-com/theme'

import * as config from '@/configuration'
import { version } from './../package.json'

import HelpersMixin from '@/mixins/helpers'

import {
  HOME_LINK,
  ACCOUNT_SIGN_IN_LINK,
  ACCOUNT_SIGN_UP_LINK,
} from '@/configuration/routes'

Vue.prototype.$menuItems = config.MENU_ITEMS
Vue.prototype.$bottomMenu = config.MOBILE_BOTTOM_TABS
Vue.prototype.$userMenuItems = config.USER_MENU_ITEMS
Vue.prototype.$authorName = config.AUTHOR_NAME
Vue.prototype.$authorWebsite = config.AUTHOR_WEBSITE
Vue.prototype.$appVersion = version
Vue.prototype.$avatar = null
Vue.prototype.$coreLinks = null

Vue.mixin(HelpersMixin)

Vue.use(FastyBirdTheme)

export default ({ app }) => {
  Vue.prototype.$coreLinks = {
    home: app.localePath({ name: HOME_LINK }),
    signInLnk: app.localePath({ name: ACCOUNT_SIGN_IN_LINK }),
    signUpLnk: app.localePath({ name: ACCOUNT_SIGN_UP_LINK }),
  }

  const menuItems = config.MENU_ITEMS

  menuItems[0].items.forEach(item => {
    // eslint-disable-next-line
    item.link = app.localePath({ name: item.link })
  })

  Vue.prototype.$menuItems = menuItems

  const bottomMenu = config.MOBILE_BOTTOM_TABS

  bottomMenu.forEach(item => {
    // eslint-disable-next-line
    item.link = app.localePath({ name: item.link })
  })

  Vue.prototype.$bottomMenu = bottomMenu
}
