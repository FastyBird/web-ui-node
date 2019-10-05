export default {

  /**
   * Set client network connection status
   *
   * @param {Object} state
   * @param {Boolean} state.connectionStatus
   * @param {Boolean} status
   */
  ['APP_STORE_CONNECTION_STATUS'](state, status) {
    state.connectionStatus = status
  },

}
