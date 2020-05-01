import { ActionTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import { AxiosResponse } from 'axios'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'

import Account from './Account'

import { ApiError } from './errors'

interface AccountSemaphoreFetchingState {
  item: Array<string>;
}

interface AccountSemaphoreState {
  fetching: AccountSemaphoreFetchingState;
  updating: Array<string>;
}

interface AccountState {
  semaphore: AccountSemaphoreState;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

function mapAccountResponse(item: any): any {
  const mapped = cloneDeep(item)

  mapped.emails = []

  if (Object.prototype.hasOwnProperty.call(item, 'emails') && item.emails.length) {
    for (const email of item.emails) {
      email.account_id = item.id
      delete email.account

      mapped.emails.push(email)
    }
  }

  mapped.identities = []

  if (Object.prototype.hasOwnProperty.call(item, 'identities') && item.identities.length) {
    for (const identity of item.identities) {
      identity.account_id = item.id
      delete identity.account

      mapped.identities.push(identity)
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(item, 'security-question') &&
    item['security-question'] !== null &&
    Object.keys(item['security-question']).length > 2
  ) {
    const securityQuestion = item['security-question']

    securityQuestion.account_id = item.id
    delete securityQuestion.account

    mapped.security_question = securityQuestion
  }

  delete mapped['security-question']

  return mapped
}

const moduleState: AccountState = {

  semaphore: {
    fetching: {
      item: [],
    },
    updating: [],
  },

}

const moduleActions: ActionTree<AccountState, any> = {
  get({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.item.includes(payload.id)) {
        resolve(false)

        return
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'get',
        id: payload.id,
      })

      Account.api().get(`/accounts-node/v1/accounts/${payload.id}?include=emails,security-question,identities`, {
        dataTransformer: (result: AxiosResponse): any | null => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'get',
            id: payload.id,
          })

          const dataFormatter = new Jsona()

          return mapAccountResponse(dataFormatter.deserialize(result.data))
        },
      })
        .then((): void => {
          // Entity was successfully fetched from server
          resolve(true)
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'get',
            id: payload.id,
          })

          reject(new ApiError(
            'accounts.accounts.get.failed',
            e,
            'Fetching account failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, first_name: string, last_name: string, middle_name: string | null, language: string, week_start: number, time_zone: string, date_format: string, time_format: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('accounts.accounts.update.inProgress'))

        return
      }

      const account = Account.find(payload.id)

      if (account === null) {
        reject(new Error('accounts.accounts.edit.failed'))

        return
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'update',
        id: account.id,
      })

      Account.update({
        where: account.id,
        data: {
          details: {
            first_name: payload.first_name,
            last_name: payload.last_name,
            middle_name: payload.middle_name,
          },
          language: payload.language,
          params: {
            datetime: {
              week_start: payload.week_start,
              zone: payload.time_zone,
              format: {
                date: payload.date_format,
                time: payload.time_format,
              },
            },
          },
        },
      })
        .then((updatedAccount): void => {
          if (updatedAccount instanceof Account) {
            const dataFormatter = new Jsona()

            Account.api().patch(
              `/accounts-node/v1/accounts/${updatedAccount.id}?include=emails,security-question,identities`,
              dataFormatter.serialize({
                stuff: Object.assign({}, updatedAccount, {
                  relationshipNames: [],
                }),
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedAccount.id,
                  })

                  return mapAccountResponse(dataFormatter.deserialize(result.data))
                },
              },
            )
              .then((): void => {
                // Entity was successfully updated in database
                resolve(updatedAccount)
              })
              .catch((e: Error): void => {
                commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: updatedAccount.id,
                })

                Account.update({
                  where: updatedAccount.id,
                  data: account,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole entity
                    Account.dispatch('get', {
                      id: account.id,
                    })
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'accounts.accounts.edit.failed',
                  e,
                  'Edit account failed.',
                ))
              })
          }
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: account.id,
          })

          reject(new ApiError(
            'accounts.accounts.edit.failed',
            e,
            'Edit account failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('ACCOUNTS_RESET_STATE')
  },
}

const moduleMutations: MutationTree<AccountState> = {
  /**
   * Set action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Object} state.semaphore.fetching
   * @param {Array} state.semaphore.fetching.item
   * @param {Array} state.semaphore.updating
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ACCOUNTS_SET_SEMAPHORE'](state: AccountState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'get':
        state.semaphore.fetching.item.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
        break

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
   * @param {Array} state.semaphore.updating
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ACCOUNTS_CLEAR_SEMAPHORE'](state: AccountState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'get':
        // Process all semaphore items
        state.semaphore.fetching.item
          .forEach((item: string, index: number): void => {
            // Find created item in reading one item semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.fetching.item.splice(index, 1)
            }
          })
        break

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
  ['ACCOUNTS_RESET_STATE'](state: AccountState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): AccountState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
