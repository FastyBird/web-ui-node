import { ActionTree, GetterTree, MutationTree } from 'vuex'

interface TemplateButtonInterface {
  name: string;
  icon: string | null;
}

interface TemplateTabStateInterface {
  name: string;
  link: string;
  icon: string | null;
}

interface TemplateMarginsInterface {
  key: string;
  position: string;
  margin: number;
}

interface TemplateState {
  leftButton: TemplateButtonInterface | null;
  rightButton: TemplateButtonInterface | null;
  actionButton: TemplateButtonInterface | null;

  heading: string | null;
  subHeading: string | null;
  headingInfoText: string | null;
  headingIcon: string | null;

  hiddenHeading: boolean;
  fullRowHeading: boolean;

  headingTabs: Array<TemplateTabStateInterface>;

  windowSize: string;

  margins: Array<TemplateMarginsInterface>;
  marginTop: number;
  marginBottom: number;
}

const moduleState: TemplateState = {
  leftButton: null,
  rightButton: null,
  actionButton: null,

  heading: null,
  subHeading: null,
  headingInfoText: null,
  headingIcon: null,

  hiddenHeading: false,
  fullRowHeading: false,

  headingTabs: [],

  windowSize: 'md',

  margins: [],
  marginTop: 0,
  marginBottom: 0,
}

const moduleGetters: GetterTree<TemplateState, any> = {
  hasLeftButton: state => (): boolean => {
    return state.leftButton !== null
  },

  hasRightButton: state => (): boolean => {
    return state.rightButton !== null
  },

  hasActionButton: state => (): boolean => {
    return state.actionButton !== null
  },

  hasHeading: state => (): boolean => {
    return state.heading !== null
  },

  hasInfoText: state => (): boolean => {
    return state.headingInfoText !== null
  },

  isHiddenHeading: state => (): boolean => {
    return state.hiddenHeading
  },

  hasHeadingIcon: state => (): boolean => {
    return state.headingIcon !== null
  },

  hasFullRowHeading: state => (): boolean => {
    return state.fullRowHeading
  },

  hasTabs: state => (): boolean => {
    return state.headingTabs.length > 0
  },

  bodyTopBottomMargin: state => (): number => {
    return state.marginTop + state.marginBottom
  },

  bodyTopMargin: state => (): number => {
    return state.marginTop
  },

  bodyBottomMargin: state => (): number => {
    return state.marginBottom
  },
}

const moduleActions: ActionTree<TemplateState, any> = {
  setLeftButton({ commit }, payload: { name: string, icon: string | null }): void {
    commit('TEMPLATE_SET_BUTTON', {
      position: 'left',
      name: payload.name,
      icon: typeof payload.icon === 'undefined' ? null : payload.icon,
    })
  },

  setRightButton({ commit }, payload: { name: string, icon: string | null }): void {
    commit('TEMPLATE_SET_BUTTON', {
      position: 'right',
      name: payload.name,
      icon: typeof payload.icon === 'undefined' ? null : payload.icon,
    })
  },

  setActionButton({ commit }, payload: { name: string, icon: string | null }): void {
    commit('TEMPLATE_SET_BUTTON', {
      position: 'action',
      name: payload.name,
      icon: typeof payload.icon === 'undefined' ? null : payload.icon,
    })
  },

  resetLeftButton({ commit }): void {
    commit('TEMPLATE_UNSET_BUTTON', {
      position: 'left',
    })
  },

  resetRightButton({ commit }): void {
    commit('TEMPLATE_UNSET_BUTTON', {
      position: 'right',
    })
  },

  resetActionButton({ commit }): void {
    commit('TEMPLATE_UNSET_BUTTON', {
      position: 'action',
    })
  },

  setHeading({ commit }, payload: { heading: string, subHeading: string | null }): void {
    commit('TEMPLATE_SET_HEADING', {
      heading: payload.heading,
      subHeading: typeof payload.subHeading === 'undefined' ? null : payload.subHeading,
    })
  },

  resetHeading({ commit }): void {
    commit('TEMPLATE_RESET_HEADING')
  },

  hideHeading({ commit }): void {
    commit('TEMPLATE_HIDE_HEADING')
  },

  setHeadingIcon({ commit }, payload: { icon: string }): void {
    commit('TEMPLATE_SET_HEADING_ICON', {
      icon: payload.icon,
    })
  },

  setFullRowHeading({ commit }): void {
    commit('TEMPLATE_HEADING_FULL_ROW')
  },

  setHeadingInfoText({ commit }, payload: { text: string }): void {
    commit('TEMPLATE_HEADING_SET_INFO_TEXT', {
      text: payload.text,
    })
  },

  resetHeadingInfoText({ commit }): void {
    commit('TEMPLATE_HEADING_RESET_INFO_TEXT')
  },

  addHeadingTab({ commit }, payload: { name: string, link: string, icon: string | null }): void {
    commit('TEMPLATE_HEADING_ADD_TAB', {
      name: payload.name,
      link: payload.link,
      icon: typeof payload.icon === 'undefined' ? null : payload.icon,
    })
  },

  clearHeadingTabs({ commit }): void {
    commit('TEMPLATE_HEADING_CLEAR_TABS')
  },

  setWindowSize({ commit }, payload: { size: string }): void {
    commit('TEMPLATE_SET_WINDOW_SIZE', {
      size: payload.size,
    })
  },

  setBodyMargin({ commit }, payload: { key: string, position: string, margin: number }): void {
    commit('TEMPLATE_SET_BODY_MARGIN', {
      key: payload.key,
      position: payload.position,
      margin: payload.margin,
    })
  },

  resetStore({ commit }): void {
    commit('TEMPLATE_RESET_STATE')
    commit('TEMPLATE_HEADING_CLEAR_TABS')
  },

}

const moduleMutations: MutationTree<TemplateState> = {
  ['TEMPLATE_SET_BUTTON'](state: TemplateState, action: { position: string, name: string, icon: string | null }): void {
    if (action.position === 'left') {
      state.leftButton = {
        name: action.name,
        icon: action.icon,
      }
    } else if (action.position === 'right') {
      state.rightButton = {
        name: action.name,
        icon: action.icon,
      }
    } else if (action.position === 'action') {
      state.actionButton = {
        name: action.name,
        icon: action.icon,
      }
    }
  },

  ['TEMPLATE_UNSET_BUTTON'](state: TemplateState, action: { position: string }): void {
    if (action.position === 'left') {
      state.leftButton = null
    } else if (action.position === 'right') {
      state.rightButton = null
    } else if (action.position === 'action') {
      state.actionButton = null
    }
  },

  ['TEMPLATE_SET_HEADING'](state: TemplateState, action: { heading: string, subHeading: string | null }): void {
    state.heading = action.heading
    state.subHeading = action.subHeading
  },

  ['TEMPLATE_RESET_HEADING'](state: TemplateState): void {
    state.heading = null
    state.subHeading = null
  },

  ['TEMPLATE_HIDE_HEADING'](state: TemplateState): void {
    state.hiddenHeading = true
  },

  ['TEMPLATE_SET_HEADING_ICON'](state: TemplateState, action: { icon: string }): void {
    state.headingIcon = action.icon
  },

  ['TEMPLATE_HEADING_FULL_ROW'](state: TemplateState): void {
    state.fullRowHeading = true
  },

  ['TEMPLATE_HEADING_SET_INFO_TEXT'](state: TemplateState, action: { text: string }): void {
    state.headingInfoText = action.text
  },

  ['TEMPLATE_HEADING_RESET_INFO_TEXT'](state: TemplateState): void {
    state.headingInfoText = null
  },

  ['TEMPLATE_HEADING_ADD_TAB'](state: TemplateState, action: { name: string, link: string, icon: string | null }): void {
    state.headingTabs.push({
      name: action.name,
      link: action.link,
      icon: action.icon,
    })
  },

  ['TEMPLATE_SET_WINDOW_SIZE'](state: TemplateState, action: { size: string }): void {
    state.windowSize = action.size
  },

  ['TEMPLATE_SET_BODY_MARGIN'](state: TemplateState, action: { key: string, position: string, margin: number }): void {
    const index = state.margins
      .findIndex(({ key }) => key === action.key)

    if (index === -1) {
      state.margins.push({
        key: action.key,
        position: action.position,
        margin: action.margin,
      })
    } else {
      state.margins[index].position = action.position
      state.margins[index].margin = action.margin
    }

    let marginTop = 0
    let marginBottom = 0

    state.margins
      .forEach((margin: TemplateMarginsInterface): void => {
        if (margin.position === 'top' && margin.margin > marginTop) {
          marginTop = margin.margin
        }

        if (margin.position === 'bottom' && margin.margin > marginBottom) {
          marginBottom = margin.margin
        }
      })

    state.marginTop = marginTop
    state.marginBottom = marginBottom
  },

  ['TEMPLATE_HEADING_CLEAR_TABS'](state: TemplateState): void {
    state.headingTabs = []
  },

  ['TEMPLATE_RESET_STATE'](state: TemplateState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): TemplateState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
