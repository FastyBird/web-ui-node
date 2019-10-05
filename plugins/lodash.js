import Vue from 'vue'

import get from 'lodash/get'
import find from 'lodash/find'
import filter from 'lodash/filter'

const lodash = {
  get,
  find,
  filter,
}

Vue._ = lodash

Vue.prototype._ = lodash
