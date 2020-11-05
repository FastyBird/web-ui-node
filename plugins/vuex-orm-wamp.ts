import { Model } from '@vuex-orm/core'
import { Plugin } from '@nuxt/types'

const vuexOrmWampPlugin: Plugin = ({ app }): void => {
  Model.setWamp(app.$wamp)
}

export default vuexOrmWampPlugin
