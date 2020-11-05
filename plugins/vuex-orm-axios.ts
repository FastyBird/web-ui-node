import { Model } from '@vuex-orm/core'
import { Plugin } from '@nuxt/types'

const vuexOrmAxiosPlugin: Plugin = ({ app }): void => {
  Model.setAxios(app.$backendApi.getAxios())
}

export default vuexOrmAxiosPlugin
