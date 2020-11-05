import { Middleware } from '@nuxt/types'

const router: Middleware = ({ route, store }) => {
  const menuHidden = route.meta.reduce((hideMenu: boolean, meta: any) => meta.hideMenu || hideMenu, false)
  const tabsHidden = route.meta.reduce((hideTabs: boolean, meta: any) => meta.hideTabs || hideTabs, false)

  store.dispatch('app/setLayoutConfig', {
    hideMenu: menuHidden,
    hideTabs: tabsHidden,
  })
}

export default router
