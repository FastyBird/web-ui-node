import { ActionTree, GetterTree, MutationTree } from 'vuex'

interface WampState {
  isConnecting: boolean;
  isConnected: boolean;
}

const moduleState: WampState = {
  isConnecting: false,
  isConnected: false,
}

const moduleActions: ActionTree<WampState, any> = {
  resetStore({ commit }): void {
    commit('WAMP_RESET_STATE')
  },

  setConnecting({ commit }): void {
    commit('WAMP_WS_CONNECTING')
  },

  setConnected({ commit }): void {
    commit('WAMP_WS_CONNECTED')
  },
}

const moduleMutations: MutationTree<WampState> = {
  ['WAMP_WS_CONNECTING'](state: WampState): void {
    state.isConnecting = true
    state.isConnected = false
  },

  ['WAMP_WS_CONNECTED'](state: WampState): void {
    state.isConnecting = false
    state.isConnected = true
  },

  ['WAMP_RESET_STATE'](state: WampState): void {
    state.isConnecting = false
    state.isConnected = false
  },
}

export default {
  state: (): WampState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
