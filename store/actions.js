export default {

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
