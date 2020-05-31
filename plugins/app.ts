import { Plugin } from '@nuxt/types'

import Vue from 'vue'

// @ts-ignore
import VueContentLoading from 'vue-content-loading'

// @ts-ignore
import FastyBirdTheme from '@/node_modules/@fastybird-com/web-ui-theme'

// Layout components
// @ts-ignore
import IconWithChild from '~/components/layout/IconWithChild'
// @ts-ignore
import ListItem from '~/components/layout/ListItem'
// @ts-ignore
import ListItemsContainer from '~/components/layout/ListItemsContainer'
// @ts-ignore
import PhoneBottomMenu from '~/components/layout/PhoneBottomMenu'
// @ts-ignore
import NoResults from '~/components/layout/NoResults'
// @ts-ignore
import OffCanvas from '~/components/layout/OffCanvas'
// @ts-ignore
import OffCanvasBody from '~/components/layout/OffCanvas/Body'
// @ts-ignore
import SettingsListItem from '~/components/layout/SettingsListItem'

import HelpersMixin from '~/mixins/helpers'

Vue.use(FastyBirdTheme)

Vue.component('IconWithChild', IconWithChild)
Vue.component('ListItem', ListItem)
Vue.component('ListItemsContainer', ListItemsContainer)
Vue.component('PhoneBottomMenu', PhoneBottomMenu)
Vue.component('NoResults', NoResults)
Vue.component('OffCanvas', OffCanvas)
Vue.component('OffCanvasBody', OffCanvasBody)
Vue.component('SettingsListItem', SettingsListItem)

Vue.component('ContentLoading', VueContentLoading)

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
