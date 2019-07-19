import Vue from 'nativescript-vue'

// HTTP client
import axios from 'axios'
import VueAxios from 'vue-axios'

import App from './App.native.vue'

import * as config from './config'
import { version } from './../package.json'

import lodash from './plugins/lodash'

Vue.use(VueAxios, axios)

Vue.use(lodash)

// Set the following to `true` to hide the logs created by nativescript-vue
Vue.config.silent = false
// Set the following to `false` to not colorize the logs created by nativescript-vue
// disabled in template due to typing issue for Typescript projects....NEEDS TO BE FIXED
// Vue.config.debug = true;

// Define global vars
Vue.prototype.$menuItems = config.MENU_ITEMS
Vue.prototype.$userMenuItems = config.USER_MENU_ITEMS
Vue.prototype.$authorName = config.AUTHOR_NAME
Vue.prototype.$authorWebsite = config.AUTHOR_WEBSITE
Vue.prototype.$appVersion = version
Vue.prototype.$avatar = null
Vue.prototype.$coreLinks = null

new Vue({
  render: (h) => h('frame', [h(App)]),
}).$start()
