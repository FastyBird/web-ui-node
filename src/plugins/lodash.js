import get from 'lodash/get'
import find from 'lodash/find'
import filter from 'lodash/filter'

export default {
  install(Vue) {
    if (!Vue.prototype.hasOwnProperty('_')) {
      const lodash = {
        get,
        find,
        filter,
      }

      /* eslint-disable-next-line */
      Vue._ = lodash

      Object.defineProperty(Vue.prototype, '_', {
        get() {
          return lodash
        },
      })
    }
  },
}
