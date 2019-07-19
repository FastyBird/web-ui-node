export default {

  install(Vue) {
    const v = new Vue({})
    const bus = {}

    bus.$on = function() {
      v.$on.apply(v, arguments)
    }
    bus.$off = function() {
      v.$off.apply(v, arguments)
    }
    bus.$emit = function() {
      v.$emit.apply(v, arguments)
    }
    bus.$once = function() {
      v.$once.apply(v, arguments)
    }

    Object.defineProperty(Vue.prototype, '$bus', {
      get() {
        return bus
      },
    })
  },

}
