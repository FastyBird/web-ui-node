import Vue from 'vue'
import Vuex from 'vuex'

import * as types from './types'

Vue.use(Vuex)

const storeState = {
  connectionStatus: true,
}

const storeActions = {

  /**
   * Set client connection status
   *
   * @param {Function} commit
   * @param {Boolean} status
   */
  setConnectionStatus({ commit }, { status }) {
    commit(types.APP_STORE_CONNECTION_STATUS, status)
  },

}

const storeMutations = {

  /**
   * Set client network connection status
   *
   * @param {Object} state
   * @param {Boolean} state.connectionStatus
   * @param {Boolean} status
   */
  [types.APP_STORE_CONNECTION_STATUS](state, status) {
    state.connectionStatus = status
  },

}

const store = {
  strict: true,
  state: storeState,
  actions: storeActions,
  mutations: storeMutations,
}

export default store
