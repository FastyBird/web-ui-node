import Vue from 'vue'

import get from 'lodash/get'
import find from 'lodash/find'
import filter from 'lodash/filter'
import first from 'lodash/first'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'

const lodash = {
  get,
  find,
  filter,
  first,
  cloneDeep,
  uniq,
}

Vue._ = lodash
Vue.prototype._ = lodash
