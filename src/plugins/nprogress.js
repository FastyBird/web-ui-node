import NProgress from 'nprogress'

function NProgressApi(options) {
  this.requestsTotal = 0
  this.requestsCompleted = 0

  this.latencyThreshold = options.latencyThreshold

  this.confirmed = true
}

NProgressApi.prototype.setComplete = function() {
  this.requestsTotal = 0
  this.requestsCompleted = 0

  NProgress.done()
}

NProgressApi.prototype.initProgress = function() {
  if (this.requestsTotal === 0) {
    setTimeout(() => NProgress.start(), this.latencyThreshold)
  }

  this.requestsTotal++

  NProgress.set(this.requestsCompleted / this.requestsTotal)
}

NProgressApi.prototype.increase = function() {
  // Finish progress bar 50 ms later
  setTimeout(() => {
    ++this.requestsCompleted
    if (this.requestsCompleted >= this.requestsTotal) {
      this.setComplete()
    } else {
      NProgress.set((this.requestsCompleted / this.requestsTotal) - 0.1)
    }
  }, this.latencyThreshold + 50)
}

function plugin(Vue, opt) {
  NProgress.configure({ parent: '.nprogress-container' })

  const options = Object.assign({
    latencyThreshold: 100,
  }, opt)

  const _nprogress = new NProgressApi(options)

  Vue.axios.interceptors.request.use((request) => {
    _nprogress.initProgress()

    return request
  }, (error) => {
    return Promise.reject(error)
  })

  Vue.axios.interceptors.response.use((response) => {
    _nprogress.increase()

    return response
  }, (error) => {
    _nprogress.increase()

    return Promise.reject(error)
  })

  Vue.router
    .beforeEach((route, from, next) => {
      if (_nprogress.confirmed) {
        _nprogress.initProgress()
        _nprogress.confirmed = false
      }

      next()
    })

  Vue.router
    .afterEach(() => {
      _nprogress.increase()
      _nprogress.confirmed = true
    })

  Vue.mixin({
    beforeCreate() {
      const np = this.$options.nprogress

      if (np) {
        np.init(this)
      }
    },
  })

  /* eslint-disable-next-line */
  Vue.nprogress = _nprogress

  Object.defineProperties(Vue.prototype, {
    $nprogress: {
      get() {
        return NProgress
      },
    },
  })
}

export default plugin
