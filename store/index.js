import VuexORM from '@vuex-orm/core'

import database from '@/node_modules/@fastybird-com/io-logic/store'

import Thing from '~/models/Thing'
import things from '~/models/things'

database.register(Thing, things)

export const plugins = [
  VuexORM.install(database),
]

export const state = () => ({
  connectionStatus: true,
})

export const actions = {

  /**
   * Set client connection status
   *
   * @param {Function} commit
   * @param {Boolean} status
   */
  setConnectionStatus({ commit }, { status }) {
    commit('APP_STORE_CONNECTION_STATUS', status)
  },

}

export const mutations = {

  /**
   * Set client network connection status
   *
   * @param {Object} storeState
   * @param {Boolean} storeState.connectionStatus
   * @param {Boolean} status
   */
  ['APP_STORE_CONNECTION_STATUS'](storeState, status) {
    Object.assign(storeState.connectionStatus, status)
  },

}
