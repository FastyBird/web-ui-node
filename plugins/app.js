import Vue from 'vue'

import HelpersMixin from '@/mixins/helpers'

Vue.mixin(HelpersMixin);

// eslint-disable-next-line no-empty-pattern
export default ({}, inject) => {
  inject('validateUUID', (uuid) => {
    const regex = /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/i

    return regex.test(uuid)
  })
}
