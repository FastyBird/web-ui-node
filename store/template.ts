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

interface TemplateHeadingInterface {
  heading: string | null;
  subHeading: string | null;
  infoText: string | null;
  icon: string | null;

  style: string;

  tabs: Array<TemplateTabStateInterface>;
}

interface TemplateState {
  leftButton: TemplateButtonInterface | null;
  rightButton: TemplateButtonInterface | null;
  actionButton: TemplateButtonInterface | null;

  heading: TemplateHeadingInterface;

  windowSize: string;

  margins: Array<TemplateMarginsInterface>;
  marginTop: number;
  marginBottom: number;
}

const moduleState: TemplateState = {
  leftButton: null,
  rightButton: null,
  actionButton: null,

  heading: {
    heading: null,
    subHeading: null,
    infoText: null,
    icon: null,
    style: 'normal',
    tabs: [],
  },

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
    return state.heading.infoText !== null
  },

  isHiddenHeading: state => (): boolean => {
    return state.heading.style === 'hidden'
  },

  hasHeadingIcon: state => (): boolean => {
    return state.heading.icon !== null
  },

  hasFullRowHeading: state => (): boolean => {
    return state.heading.style === 'row'
  },

  hasTabs: state => (): boolean => {
    return state.heading.tabs.length > 0
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

  setHeadingIcon({ commit }, payload: { icon: string | null }): void {
    commit('TEMPLATE_SET_HEADING_ICON', {
      icon: typeof payload.icon === 'undefined' ? null : payload.icon,
    })
  },

  setNormalHeading({ commit }): void {
    commit('TEMPLATE_SET_HEADING_STYLE', {
      style: 'normal',
    })
  },

  setHiddenHeading({ commit }): void {
    commit('TEMPLATE_SET_HEADING_STYLE', {
      style: 'hidden',
    })
  },

  setFullRowHeading({ commit }): void {
    commit('TEMPLATE_SET_HEADING_STYLE', {
      style: 'row',
    })
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

  resetHeadings({ commit }): void {
    commit('TEMPLATE_RESET_HEADINGS')
  },

  resetButtons({ commit }): void {
    commit('TEMPLATE_RESET_BUTTONS')
  },

  resetStore({ commit }): void {
    commit('TEMPLATE_RESET_STATE')
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
    state.heading.heading = action.heading
    state.heading.subHeading = action.subHeading
  },

  ['TEMPLATE_RESET_HEADING'](state: TemplateState): void {
    state.heading.heading = null
    state.heading.subHeading = null
  },

  ['TEMPLATE_SET_HEADING_ICON'](state: TemplateState, action: { icon: string | null }): void {
    state.heading.icon = action.icon
  },

  ['TEMPLATE_SET_HEADING_STYLE'](state: TemplateState, action: { style: string }): void {
    state.heading.style = action.style
  },

  ['TEMPLATE_HEADING_SET_INFO_TEXT'](state: TemplateState, action: { text: string }): void {
    state.heading.infoText = action.text
  },

  ['TEMPLATE_HEADING_RESET_INFO_TEXT'](state: TemplateState): void {
    state.heading.infoText = null
  },

  ['TEMPLATE_HEADING_ADD_TAB'](state: TemplateState, action: { name: string, link: string, icon: string | null }): void {
    state.heading.tabs.push({
      name: action.name,
      link: action.link,
      icon: action.icon,
    })
  },

  ['TEMPLATE_HEADING_CLEAR_TABS'](state: TemplateState): void {
    state.heading.tabs = []
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

  ['TEMPLATE_RESET_HEADINGS'](state: TemplateState): void {
    Object.assign(state.heading, moduleState.heading)

    state.heading.tabs = []
  },

  ['TEMPLATE_RESET_BUTTONS'](state: TemplateState): void {
    state.leftButton = null
    state.rightButton = null
    state.actionButton = null
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
