import get from 'lodash/get'

import api from './api'
import store from './store'
import channelProperties from './sockets/channels.properties'

export default {
  install(Vue, opt) {
    if (!opt || !opt.store) {
      throw new Error('Please initialise plugin with a Vuex store.')
    }

    // Register vuex plugin - VuexORM
    store(opt.store)

    // Configure api
    api.setApiKey(get(opt, 'api.key'))
    api.setBaseURL(get(opt, 'api.root'))
    api.setAccessToken(get(opt, 'accessToken'))
    api.setRefreshToken(get(opt, 'refreshToken'))

    Object.defineProperty(Vue.prototype, '$ioServerChannelPropertySocket', {
      get() {
        return channelProperties
      },
    })
  },
}
