import { ActionTree, GetterTree, MutationTree } from 'vuex'

import Account from '~/models/auth-node/accounts/Account'

interface SemaphoreState {
  fetching: boolean
  creating: boolean
  updating: boolean
}

interface DataState {
  accessToken: string | null,
  refreshToken: string | null,
  tokenType: string,
  tokenExpiration: string | null
  accountId: string | null
}

interface SessionState {
  semaphore: SemaphoreState,
  data: DataState,
}

export enum SemaphoreType {
  FETCHING = 'fetching',
  CREATING = 'creating',
  UPDATING = 'updating',
}

interface SemaphoreAction {
  type: SemaphoreType
}

interface SessionAction {
  accessToken: string,
  refreshToken: string,
  tokenType: string,
  tokenExpiration: string,
  accountId: string,
}

const moduleState: SessionState = {

  semaphore: {
    fetching: false,
    creating: false,
    updating: false,
  },

  data: {
    accessToken: null,
    refreshToken: null,
    tokenType: 'Bearer',
    tokenExpiration: null,
    accountId: null,
  },
}

const moduleGetters: GetterTree<SessionState, any> = {
  getAccessToken: state => (): string | null => {
    return state.data.accessToken
  },

  getRefreshToken: state => (): string | null => {
    return state.data.refreshToken
  },

  getAccountId: state => (): string | null => {
    return state.data.accountId
  },

  getAccount: state => (): Account | null => {
    if (state.data.accountId === null) {
      return null
    }

    return Account
      .query()
      .with('emails')
      .with('identities')
      .where('id', state.data.accountId)
      .first()
  },

  isSignedIn: state => (): boolean => {
    return state.data.accountId !== null
  },

  getSemaphoreState: state => (type: SemaphoreType): boolean => {
    switch (type) {
      case SemaphoreType.FETCHING:
        return state.semaphore.fetching

      case SemaphoreType.CREATING:
        return state.semaphore.creating

      case SemaphoreType.UPDATING:
        return state.semaphore.updating
    }

    return false
  },
}

const moduleActions: ActionTree<SessionState, any> = {
  set({ commit }, payload: SessionAction): void {
    commit('SESSION_SAVE_SESSION', payload)
  },

  clear({ commit }): void {
    commit('SESSION_CLEAR_SESSION')
  },

  setSemaphore({ commit }, payload: SemaphoreAction): void {
    commit('SESSION_SET_SEMAPHORE', payload)
  },

  clearSemaphore({ commit }, payload: SemaphoreAction): void {
    commit('SESSION_CLEAR_SEMAPHORE', payload)
  },
}

const moduleMutations: MutationTree<SessionState> = {
  ['SESSION_SAVE_SESSION'](state: SessionState, action: SessionAction): void {
    state.data.accessToken = action.accessToken
    state.data.refreshToken = action.refreshToken
    state.data.tokenExpiration = action.tokenExpiration
    state.data.tokenType = action.tokenType
    state.data.accountId = action.accountId
  },

  ['SESSION_CLEAR_SESSION'](state: SessionState): void {
    Object.assign(state, moduleState)
  },

  ['SESSION_SET_SEMAPHORE'](state: SessionState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreType.FETCHING:
        state.semaphore.fetching = true
        break

      case SemaphoreType.CREATING:
        state.semaphore.creating = true
        break

      case SemaphoreType.UPDATING:
        state.semaphore.updating = true
        break
    }
  },

  ['SESSION_CLEAR_SEMAPHORE'](state: SessionState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreType.FETCHING:
        state.semaphore.fetching = false
        break

      case SemaphoreType.CREATING:
        state.semaphore.creating = false
        break

      case SemaphoreType.UPDATING:
        state.semaphore.updating = false
        break
    }
  },
}

export default {
  state: (): SessionState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
