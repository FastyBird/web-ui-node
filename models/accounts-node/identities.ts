import { ActionTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import { AxiosResponse } from 'axios'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'

import Identity from './Identity'

import { ApiError } from './errors'

import {
  ACCOUNTS_NODE_SYSTEM_IDENTITY,
} from './types'

interface IdentitySemaphoreState {
  updating: Array<string>;
}

interface IdentityState {
  semaphore: IdentitySemaphoreState;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

function mapIdentityResponse(item: any): any {
  const mapped = cloneDeep(item)

  if (item.account) {
    mapped.account_id = item.account.id
  }

  return mapped
}

const moduleState: IdentityState = {

  semaphore: {
    updating: [],
  },

}

const moduleActions: ActionTree<IdentityState, any> = {
  edit({ state, commit }, payload: { id: string, current_password: string, new_password: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('accounts.identities.update.inProgress'))

        return
      }

      const identity = Identity.find(payload.id)

      if (identity === null) {
        reject(new Error('accounts.identities.edit.failed'))

        return
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'update',
        id: identity.id,
      })

      const dataFormatter = new Jsona()

      Identity.api().patch(
        `/accounts-node/v1/accounts/${identity.account_id}/identities/${identity.id}`,
        dataFormatter.serialize({
          stuff: Object.assign({}, {
            type: ACCOUNTS_NODE_SYSTEM_IDENTITY,
            id: identity.id,
            password: {
              current: payload.current_password,
              new: payload.new_password,
            },
          }),
        }),
        {
          save: false,
        },
      )
        .then((): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: identity.id,
          })

          // Entity was successfully updated in database
          resolve(identity)
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: identity.id,
          })

          reject(new ApiError(
            'accounts.identities.edit.failed',
            e,
            'Edit identity failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('ACCOUNTS_RESET_STATE')
  },
}

const moduleMutations: MutationTree<IdentityState> = {
  /**
   * Set action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Object} state.semaphore.fetching
   * @param {Array} state.semaphore.fetching.item
   * @param {Array} state.semaphore.creating
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ACCOUNTS_SET_SEMAPHORE'](state: IdentityState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'update':
        state.semaphore.updating.push(action.id)

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break
    }
  },

  /**
   * Reset action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Object} state.semaphore.fetching
   * @param {Array} state.semaphore.fetching.item
   * @param {Array} state.semaphore.creating
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ACCOUNTS_CLEAR_SEMAPHORE'](state: IdentityState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'update':
        // Process all semaphore items
        state.semaphore.updating
          .forEach((item: string, index: number): void => {
            // Find created item in creating semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.updating.splice(index, 1)
            }
          })
        break
    }
  },

  /**
   * Reset store to initial state
   *
   * @param {Object} state
   */
  ['ACCOUNTS_RESET_STATE'](state: IdentityState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): IdentityState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
