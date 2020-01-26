export const state = () => ({
  isConnecting: false,
  isConnected: false,
})

export const actions = {

  resetStore({ commit }) {
    commit('WAMP_RESET_STATE')
  },

  setConnecting({ commit }) {
    commit('WAMP_WS_STATE', {
      connecting: true,
    })
  },

  setConnected({ commit }) {
    commit('WAMP_WS_STATE', {
      connected: true,
    })
  },

  setDisconnected({ commit }) {
    commit('WAMP_WS_STATE', {
      connected: false,
    })
  },

}

export const mutations = {

  ['WAMP_WS_STATE'](moduleState, action) {
    if (Object.prototype.hasOwnProperty.call(action, 'connected')) {
      Object.assign(moduleState, { isConnecting: false })
      Object.assign(moduleState, { isConnected: action.connected })
    } else if (Object.prototype.hasOwnProperty.call(action, 'connecting')) {
      Object.assign(moduleState, { isConnecting: action.connecting })
      Object.assign(moduleState, { isConnected: false })
    }
  },

  ['WAMP_RESET_STATE'](moduleState) {
    Object.assign(moduleState, { isConnecting: false })
    Object.assign(moduleState, { isConnected: false })
  },

}
