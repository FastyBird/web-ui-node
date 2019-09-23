import Vue from 'vue'

import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_DNS,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })],
    environment: (process.env.NODE_ENV === 'production') ? 'production' : 'development',
  })
}

import { sync } from 'vuex-router-sync'

import Vuex from 'vuex'

import axios from 'axios'
import VueAxios from 'vue-axios'

import VueCookie from 'vue-cookie'
import VueMeta from 'vue-meta'
import VueToasted from 'vue-toasted'

import FastyBirdTheme from '@fastybird-com/theme'

import VueLodash from './plugins/lodash'
import VueEventBus from './plugins/event.bus'
import VueNProgress from './plugins/nprogress'
import VueWamp from './plugins/wamp'
import VueThingTranslate from './plugins/translate'
import VueIOServer from './plugins/io-server'

import { Validator, install as VeeValidate } from 'vee-validate/dist/vee-validate.minimal.esm.js'
import { required, email, numeric, between } from 'vee-validate/dist/rules.esm.js'

import veeEn from 'vee-validate/dist/locale/en'

import App from './App.vue'
import { router, HOME_LINK, ACCOUNT_SIGN_IN_LINK, ACCOUNT_SIGN_UP_LINK } from './router'
import store from './store'

import * as config from './config'
import { version } from './../package.json'

import DeviceIcon from './elements/DeviceIcon'

import HelpersMixin from './mixins/helpers'

import i18n from './i18n'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faExclamationTriangle,
  faPlug,
  faMapMarkerAlt,
  faHome,
  faDesktop,
  faPlus,
  faMinus,
  faChevronRight,
  faInfo,
  faWifi,
  faCogs,
  faCube,
  faCubes,
  faAngleLeft,
  faAngleRight,
  faSlidersH,
  faCalendar,
  faWindowClose,
  faBan,
  faCheck,
  faPencilAlt,
  faTrash,
  faTimes,
  faEnvelope,
  faClock,
  faUser,
  faKey,
  faUserShield,
  faSyncAlt,
  faPowerOff,
  faSignOutAlt,
  faMobile,
  faTachometerAlt,
} from '@fortawesome/free-solid-svg-icons'

import {
  faTwitter,
  faFacebook,
  faGithub,
} from '@fortawesome/free-brands-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faExclamationTriangle, faPlug, faMapMarkerAlt, faHome, faDesktop, faPlus, faMinus, faChevronRight, faInfo, faWifi, faCogs, faCube, faCubes, faAngleLeft, faAngleRight, faSlidersH, faCalendar, faWindowClose, faBan, faCheck, faPencilAlt, faTrash, faTimes, faEnvelope, faClock, faUser, faKey, faUserShield, faSyncAlt, faPowerOff, faSignOutAlt, faMobile, faTwitter, faFacebook, faGithub, faTachometerAlt)

Vue.use(VueAxios, axios)
Vue.use(VueCookie)
Vue.use(VueMeta)

Vue.router = router

Vue.use(VueLodash)
Vue.use(VueEventBus)
Vue.use(VueNProgress)
Vue.use(VueThingTranslate)

Vue.use(VueToasted, {
  theme: 'primary',
  position: 'bottom-center',
  duration: 5000,
  className: 'toast',
})

// Add the rules you need.
Validator.extend('required', required)
Validator.extend('email', email)
Validator.extend('numeric', numeric)
Validator.extend('between', between)

// Merge the messages.
Validator.localize('en', veeEn)

Vue.use(VeeValidate)

Vue.mixin(HelpersMixin)

Vue.component('DeviceIcon', DeviceIcon)
Vue.component('FontAwesomeIcon', FontAwesomeIcon)

// Enable devtools
Vue.config.devtools = (process.env.NODE_ENV !== 'production')
// Enable performance profiling
Vue.config.performance = (process.env.NODE_ENV !== 'production')

Vue.config.productionTip = false

// This empty Vue model will serve as our event bus.
const bus = new Vue({
  i18n,
})

// Define global vars
Vue.prototype.$sentry = Sentry

Vue.prototype.$menuItems = config.MENU_ITEMS
Vue.prototype.$bottomMenu = config.MOBILE_BOTTOM_TABS
Vue.prototype.$userMenuItems = config.USER_MENU_ITEMS
Vue.prototype.$authorName = config.AUTHOR_NAME
Vue.prototype.$authorWebsite = config.AUTHOR_WEBSITE
Vue.prototype.$appVersion = version
Vue.prototype.$avatar = null
Vue.prototype.$coreLinks = {
  home: HOME_LINK,
  signInLnk: ACCOUNT_SIGN_IN_LINK,
  signUpLnk: ACCOUNT_SIGN_UP_LINK,
}

const vuexStore = new Vuex.Store(store)

Vue.use(VueWamp, {
  wsuri: process.env.VUE_APP_WS_SERVER,
  debug: true,
  store: vuexStore,
})

Vue.use(FastyBirdTheme, {
  store: vuexStore,
})

Vue.use(VueIOServer, {
  store: vuexStore,
  api: {
    root: process.env.VUE_APP_API_ROOT,
    key: process.env.VUE_APP_API_KEY,
  },
  accessToken: {
    read: () => {
      return Vue.cookie.get('token')
    },
    write: (token) => {
      Vue.cookie.set('token', token)
    },
    clear: () => {
      Vue.cookie.delete('token')
    },
  },
  refreshToken: {
    read: () => {
      return Vue.cookie.get('refresh_token')
    },
    write: (token) => {
      Vue.cookie.set('refresh_token', token)
    },
    clear: () => {
      Vue.cookie.delete('refresh_token')
    },
  },
})

new Vue({
  bus,
  router,
  store: vuexStore,
  i18n,
  beforeCreate() {
    sync(vuexStore, router)
  },
  render: h => h(App),
}).$mount('#app')
