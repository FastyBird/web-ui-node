import { WAMP_WS_STATE, WAMP_RESET_STATE } from '@/plugins/wamp.client'

export default {

  resetStore({ commit }) {
    commit(WAMP_RESET_STATE)
  },

  setConnecting({ commit }) {
    commit(WAMP_WS_STATE, {
      connecting: true,
    })
  },

  setConnected({ commit }) {
    commit(WAMP_WS_STATE, {
      connected: true,
    })
  },

  setDisconnected({ commit }) {
    commit(WAMP_WS_STATE, {
      connected: false,
    })
  },

}
