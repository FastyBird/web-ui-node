import { ActionTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import { AxiosResponse } from 'axios'
import { Response } from '@vuex-orm/plugin-axios'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'

import Session, { SessionInterface } from './Session'
import Account from './Account'
import SecurityQuestion from './SecurityQuestion'
import Email from './Email'
import Identity from './Identity'

import { ApiError } from './errors'

import {
  ACCOUNTS_NODE_SESSION,
} from './types'

interface SessionSemaphoreState {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
}

interface SessionState {
  semaphore: SessionSemaphoreState;
}

interface SemaphoreAction {
  type: string;
}

function mapSessionResponse(item: any): any {
  const mapped = cloneDeep(item)

  if (Object.prototype.hasOwnProperty.call(item, 'account') && Object.keys(item.account).length > 2) {
    const account = item.account

    account.session_id = item.id
    delete account.session

    if (
      Object.prototype.hasOwnProperty.call(account, 'security-question') &&
      account['security-question'] !== null &&
      Object.keys(account['security-question']).length > 2
    ) {
      const securityQuestion = account['security-question']

      securityQuestion.account_id = account.id
      delete securityQuestion.account

      account.security_question = securityQuestion
    }

    mapped.emails = []

    if (Object.prototype.hasOwnProperty.call(account, 'emails') && account.emails.length) {
      for (const email of account.emails) {
        email.account_id = account.id
        delete email.account

        mapped.emails.push(email)
      }
    }

    mapped.identities = []

    if (Object.prototype.hasOwnProperty.call(account, 'identities') && account.identities.length) {
      for (const identity of account.identities) {
        identity.account_id = account.id
        delete identity.account

        mapped.identities.push(identity)
      }
    }

    mapped.account = account
  }

  return mapped
}

const moduleState: SessionState = {

  semaphore: {
    fetching: false,
    creating: false,
    updating: false,
  },

}

const moduleActions: ActionTree<SessionState, any> = {
  get({ state, commit }, payload: { token: string, refresh: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (state.semaphore.fetching) {
        resolve(false)

        return
      }

      const session = Session.query().where('token', payload.token).first()

      if (session !== null) {
        resolve(session)

        return
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'get',
      })

      Session.api().get('/accounts-node/v1/session?include=account,account.emails,account.identities,account.security-question', {
        dataTransformer: (result: AxiosResponse): any | null => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'get',
          })

          const dataFormatter = new Jsona()

          return mapSessionResponse(dataFormatter.deserialize(result.data))
        },
      })
        .then((response: Response): void => {
          // Entity was successfully fetched from server
          resolve(get(response, 'entities.session[0]'))
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'get',
          })

          reject(new ApiError(
            'accounts.session.get.failed',
            e,
            'Fetching session failed.',
          ))
        })
    })
  },

  create({ state, commit }, payload: { uid: string, password: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (state.semaphore.creating) {
        reject(new Error('accounts.session.create.inProgress'))

        return
      }

      const entity = {
        type: ACCOUNTS_NODE_SESSION,

        uid: payload.uid,
        password: payload.password,
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'create',
      })

      const dataFormatter = new Jsona()

      Session.api().post(
        '/accounts-node/v1/session?include=account,account.emails,account.identities,account.security-question',
        dataFormatter.serialize({
          stuff: Object.assign({}, entity),
        }),
        {
          dataTransformer: (result: AxiosResponse): any => {
            commit('ACCOUNTS_CLEAR_SEMAPHORE', {
              type: 'create',
            })

            return mapSessionResponse(dataFormatter.deserialize(result.data))
          },
        },
      )
        .then((response: Response): void => {
          // Entity was successfully created in database
          resolve(get(response, 'entities.session[0]'))
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'create',
          })

          reject(new ApiError(
            'accounts.session.create.failed',
            e,
            'Create new session failed.',
          ))
        })
    })
  },

  refresh({ state, commit }, payload: { refresh_token: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (state.semaphore.updating) {
        reject(new Error('accounts.session.refresh.inProgress'))

        return
      }

      const entity = {
        type: ACCOUNTS_NODE_SESSION,

        refresh: payload.refresh_token,
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'update',
      })

      const dataFormatter = new Jsona()

      Session.api().patch(
        '/accounts-node/v1/session',
        dataFormatter.serialize({
          stuff: Object.assign({}, entity),
        }),
        {
          dataTransformer: (result: AxiosResponse): any | null => {
            commit('ACCOUNTS_CLEAR_SEMAPHORE', {
              type: 'update',
            })

            return mapSessionResponse(dataFormatter.deserialize(result.data))
          },
        },
      )
        .then((response: Response): void => {
          const session = get(response, 'entities.session[0]')

          // Cleanup old sessions
          const oldSessions = Session
            .query()
            .where((record: SessionInterface): boolean => {
              return record.id !== session.id
            })
            .get()

          oldSessions
            .forEach((row) => {
              Session.delete(row.id)
            })

          // Entity was successfully updated in database
          resolve(session)
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'update',
          })

          reject(new ApiError(
            'accounts.session.update.failed',
            e,
            'Refresh session failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('ACCOUNTS_RESET_STATE')

    Account.dispatch('reset')

    Email.dispatch('reset')

    Identity.dispatch('reset')

    SecurityQuestion.dispatch('reset')
  },
}

const moduleMutations: MutationTree<SessionState> = {
  /**
   * Set action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Boolean} state.semaphore.fetching
   * @param {Boolean} state.semaphore.creating
   * @param {Boolean} state.semaphore.updating
   * @param {Object} action
   * @param {String} action.type
   */
  ['ACCOUNTS_SET_SEMAPHORE'](state: SessionState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'get':
        state.semaphore.fetching = true
        break

      case 'create':
        state.semaphore.creating = true
        break

      case 'update':
        state.semaphore.updating = true
        break
    }
  },

  /**
   * Reset action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Boolean} state.semaphore.fetching
   * @param {Boolean} state.semaphore.creating
   * @param {Boolean} state.semaphore.updating
   * @param {Object} action
   * @param {String} action.type
   */
  ['ACCOUNTS_CLEAR_SEMAPHORE'](state: SessionState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'get':
        state.semaphore.fetching = false
        break

      case 'create':
        state.semaphore.creating = false
        break

      case 'update':
        state.semaphore.updating = false
        break
    }
  },

  /**
   * Reset store to initial state
   *
   * @param {Object} state
   */
  ['ACCOUNTS_RESET_STATE'](state: SessionState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): SessionState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
