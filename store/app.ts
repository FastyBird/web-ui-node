import { ActionTree, GetterTree, MutationTree } from 'vuex'

interface AppState {
  networkState: boolean
  touchDeviceState: boolean
  hideMenu: boolean
  hideTabs: boolean
  windowSize: string
  heading: {
    heading: string | null,
    subHeading: string | null,
    icon: string | null,
  }
}

const moduleState: AppState = {
  networkState: true,
  touchDeviceState: false,
  hideMenu: false,
  hideTabs: false,
  windowSize: 'md',
  heading: {
    heading: null,
    subHeading: null,
    icon: null,
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

  setTouchDeviceState({ commit }, payload: { state: boolean }): void {
    commit('APP_SET_TOUCH_DEVICE_STATE', {
      state: payload.state,
    })
  },

  setWindowSize({ commit }, payload: { size: string }): void {
    commit('APP_SET_WINDOW_SIZE', {
      size: payload.size,
    })
  },

  setLayoutConfig({ commit }, payload: { hideMenu: boolean, hideTabs: boolean }): void {
    commit('APP_SET_LAYOUT_CONFIG', {
      hideMenu: payload.hideMenu,
      hideTabs: payload.hideTabs,
    })
  },

  setHeading({ commit }, payload: { heading: string, subHeading: string | null, icon: string | null }): void {
    commit('SET_HEADING', {
      heading: payload.heading,
      subHeading: payload.subHeading,
      icon: payload.icon,
    })
  },

  resetHeading({ commit }): void {
    commit('RESET_HEADING')
  },

  resetStore({ commit }) {
    commit('RESET_STATE')
  },
}

const moduleMutations: MutationTree<AppState> = {
  ['APP_SET_NETWORK_STATE'](state, action: { state: boolean }): void {
    state.networkState = action.state
  },

  ['APP_SET_TOUCH_DEVICE_STATE'](state: AppState, action: { state: boolean }): void {
    state.touchDeviceState = action.state
  },

  ['APP_SET_WINDOW_SIZE'](state: AppState, action: { size: string }): void {
    state.windowSize = action.size
  },

  ['APP_SET_LAYOUT_CONFIG'](state: AppState, action: { hideMenu: boolean, hideTabs: boolean }): void {
    state.hideMenu = action.hideMenu
    state.hideTabs = action.hideTabs
  },

  ['SET_HEADING'](state: AppState, action: { heading: string, subHeading: string | null, icon: string | null }): void {
    state.heading.heading = action.heading
    state.heading.subHeading = action.subHeading
    state.heading.icon = action.icon
  },

  ['RESET_HEADING'](state: AppState): void {
    state.heading.heading = null
    state.heading.subHeading = null
    state.heading.icon = null
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
