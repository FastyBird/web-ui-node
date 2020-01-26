import Vue from 'vue'

import VueContentLoading from 'vue-content-loading'

import FastyBirdTheme from '@/node_modules/@fastybird-com/theme'

// Layout components
import IconWithChild from '@/components/layout/IconWithChild'
import ListItem from '@/components/layout/ListItem'
import ListItemsContainer from '@/components/layout/ListItemsContainer'
import MobileBottomMenu from '@/components/layout/MobileBottomMenu'
import NoResults from '@/components/layout/NoResults'
import OffCanvas from '@/components/layout/OffCanvas'
import OffCanvasBody from '@/components/layout/OffCanvas/Body'
import ResultOk from '@/components/layout/ResultOk'
import ResultError from '@/components/layout/ResultError'
import SettingsListItem from '@/components/layout/SettingsListItem'

Vue.use(FastyBirdTheme)

Vue.component('IconWithChild', IconWithChild)
Vue.component('ListItem', ListItem)
Vue.component('ListItemsContainer', ListItemsContainer)
Vue.component('MobileBottomMenu', MobileBottomMenu)
Vue.component('NoResults', NoResults)
Vue.component('OffCanvas', OffCanvas)
Vue.component('OffCanvasBody', OffCanvasBody)
Vue.component('ResultOk', ResultOk)
Vue.component('ResultError', ResultError)
Vue.component('SettingsListItem', SettingsListItem)

Vue.component('ContentLoading', VueContentLoading)
