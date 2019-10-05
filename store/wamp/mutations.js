import { WAMP_WS_STATE, WAMP_RESET_STATE } from '@/plugins/wamp.client'

export default {

  [WAMP_WS_STATE](state, action) {
    if (action.hasOwnProperty('connected')) {
      state.isConnected = action.connected
      state.isConnecting = false
    } else if (action.hasOwnProperty('connecting')) {
      state.isConnecting = action.connecting
    }
  },

  [WAMP_RESET_STATE](state) {
    state.isConnecting = false
    state.isConnected = false
  },

}
