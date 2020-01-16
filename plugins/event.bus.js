import Vue from 'vue'

// eslint-disable-next-line
export default ({ }, inject) => {
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

  inject('bus', bus)
}
