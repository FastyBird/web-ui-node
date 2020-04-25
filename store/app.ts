import { ActionTree, GetterTree, MutationTree } from 'vuex'

interface AppMenuInterface {
  main: boolean;
  bottom: boolean;
}

interface AppState {
  networkState: boolean;

  touchDeviceState: boolean;

  menu: AppMenuInterface;
}

const moduleState: AppState = {

  networkState: true,

  touchDeviceState: false,

  menu: {
    main: true,
    bottom: false,
  },
}

const moduleGetters: GetterTree<AppState, any> = {
  isTouchDevice: state => (): boolean => {
    return state.touchDeviceState
  },
}

const moduleActions: ActionTree<AppState, any> = {
  setNetworkState({ commit }, payload: { state: boolean }): void {
    commit('APP_SET_NETWORK_STATE', {
      state: payload.state,
    })
  },

  mainMenuCollapse({ commit }): void {
    commit('APP_SET_MENU_STATE', {
      state: true,
      type: 'main',
    })
  },

  mainMenuToggle({ commit, state }): void {
    commit('APP_SET_MENU_STATE', {
      state: !state.menu.main,
      type: 'main',
    })
  },

  bottomMenuCollapse({ commit }): void {
    commit('APP_SET_MENU_STATE', {
      state: true,
      type: 'bottom',
    })
  },

  bottomMenuExpand({ commit }): void {
    commit('APP_SET_MENU_STATE', {
      state: false,
      type: 'bottom',
    })
  },

  bottomMenuToggle({ commit, state }): void {
    commit('APP_SET_MENU_STATE', {
      state: !state.menu.bottom,
      type: 'bottom',
    })
  },

  setTouchDeviceState({ commit, state }, payload: { state: boolean }): void {
    commit('APP_SET_TOUCH_DEVICE_STATE', {
      state: payload.state,
    })
  },

  resetStore({ commit }) {
    commit('RESET_STATE')
  },
}

const moduleMutations: MutationTree<AppState> = {
  ['APP_SET_NETWORK_STATE'](state, action: { state: boolean }): void {
    state.networkState = action.state
  },

  ['APP_SET_MENU_STATE'](state: AppState, action: { state: boolean, type: string }): void {
    if (action.type === 'main') {
      state.menu.main = action.state
    } else if (action.type === 'bottom') {
      state.menu.bottom = action.state
    }
  },

  ['APP_SET_TOUCH_DEVICE_STATE'](state: AppState, action: { state: boolean }): void {
    state.touchDeviceState = action.state
  },

  ['RESET_STATE'](state: AppState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): AppState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
