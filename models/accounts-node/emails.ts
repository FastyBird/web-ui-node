import { ActionTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'

import { AccountInterface } from './Account'
import Email, { EmailInterface } from './Email'

import { ApiError } from './errors'

import {
  ACCOUNTS_NODE_EMAIL,
} from './types'

interface EmailSemaphoreFetchingState {
  items: Array<string>;
}

interface EmailSemaphoreState {
  fetching: EmailSemaphoreFetchingState;
  creating: Array<string>;
  updating: Array<string>;
  deleting: Array<string>;
}

interface EmailState {
  semaphore: EmailSemaphoreState;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

function mapEmailResponse(item: any): any {
  const mapped = cloneDeep(item)

  if (item.account) {
    mapped.account_id = item.account.id
  }

  return mapped
}

const moduleState: EmailState = {

  semaphore: {
    fetching: {
      items: [],
    },
    creating: [],
    updating: [],
    deleting: [],
  },

}

const moduleActions: ActionTree<EmailState, any> = {
  fetch({ state, commit }, payload: { account_id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.items.includes(payload.account_id)) {
        resolve(false)

        return
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'fetch',
        id: payload.account_id,
      })

      Email.api().get(`/accounts-node/v1/accounts/${payload.account_id}/emails`, {
        dataTransformer: (result: AxiosResponse): any | null => {
          const dataFormatter = new Jsona()

          const data = dataFormatter.deserialize(result.data)

          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'fetch',
            id: payload.account_id,
          })

          const insert = []

          // @ts-ignore
          for (const item of data) {
            insert.push(mapEmailResponse(item))
          }

          return insert
        },
      })
        .then((): void => {
          // Entities were successfully fetched from server
          resolve(true)
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'fetch',
            id: payload.account_id,
          })

          reject(new ApiError(
            'accounts.emails.fetch.failed',
            e,
            'Fetching emails failed.',
          ))
        })
    })
  },

  add({ commit }, payload: { account: AccountInterface, address: string, is_default: boolean, is_private: boolean }): Promise<any> {
    return new Promise((resolve, reject): void => {
      const id = uuid.v4()

      const entity = {
        id,
        type: ACCOUNTS_NODE_EMAIL,

        address: payload.address,
        is_default: payload.is_default,
        is_private: payload.is_private,

        account_id: payload.account.id,
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'create',
        id,
      })

      Email.insert({
        data: entity,
      })
        .then((entities): void => {
          const dataFormatter = new Jsona()

          if (Object.prototype.hasOwnProperty.call(entities, 'email') && Array.isArray(entities.email)) {
            entities.email
              .forEach((createdEmail): void => {
                Email.api().post(
                  `/accounts-node/v1/accounts/${payload.account.id}/emails`,
                  dataFormatter.serialize({
                    stuff: Object.assign({}, createdEmail, {
                      relationshipNames: ['account'],
                      account: {
                        type: payload.account.type,
                        id: payload.account.id,
                      },
                    }),
                  }),
                  {
                    dataTransformer: (result: AxiosResponse): any | null => {
                      commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                        type: 'create',
                        id,
                      })

                      return mapEmailResponse(dataFormatter.deserialize(result.data))
                    },
                  },
                )
                  .then((): void => {
                    // Refresh emails
                    Email.dispatch('fetch', {
                      account_id: payload.account.id,
                    })
                      .then((): void => {
                        // Entity was successfully created in database
                        resolve(createdEmail)
                      })
                      .catch((): void => {
                        // Entity was successfully created in database but could not be refreshed
                        resolve(createdEmail)
                      })
                  })
                  .catch((e: Error): void => {
                    commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                      type: 'create',
                      id,
                    })

                    Email.delete(id)
                      .catch((): void => {
                        // Failed creating could not be removed
                      })

                    reject(new ApiError(
                      'accounts.emails.create.failed',
                      e,
                      'Create new email failed.',
                    ))
                  })
              })
          }
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'create',
            id,
          })

          Email.delete(id)
            .catch((): void => {
              // Failed creating could not be removed
            })

          reject(new ApiError(
            'accounts.emails.create.failed',
            e,
            'Create new email failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, is_default: boolean, is_private: boolean }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('accounts.emails.update.inProgress'))

        return
      }

      const email = Email.find(payload.id)

      if (email === null) {
        reject(new Error('accounts.emails.edit.failed'))

        return
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'update',
        id: email.id,
      })

      Email.update({
        where: email.id,
        data: {
          is_default: payload.is_default,
          is_private: payload.is_private,
        },
      })
        .then((updatedEmail): void => {
          if (updatedEmail instanceof Email) {
            const dataFormatter = new Jsona()

            Email.api().patch(
              `/accounts-node/v1/accounts/${updatedEmail.account_id}/emails/${updatedEmail.id}`,
              dataFormatter.serialize({
                stuff: Object.assign({}, updatedEmail, {
                  relationshipNames: [],
                }),
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedEmail.id,
                  })

                  return mapEmailResponse(dataFormatter.deserialize(result.data))
                },
              },
            )
              .then((): void => {
                // Refresh emails
                Email.dispatch('fetch', {
                  account_id: email.account_id,
                })
                  .then((): void => {
                    // Entity was successfully updated in database
                    resolve(updatedEmail)
                  })
                  .catch((): void => {
                    // Entity was successfully updated in database but could not be refreshed
                    resolve(updatedEmail)
                  })
              })
              .catch((e: Error): void => {
                commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: updatedEmail.id,
                })

                Email.update({
                  where: updatedEmail.id,
                  data: email,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole list
                    Email.dispatch('fetch', {
                      account_id: email.account_id,
                    })
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'accounts.emails.edit.failed',
                  e,
                  'Edit email failed.',
                ))
              })
          }
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: email.id,
          })

          reject(new ApiError(
            'accounts.emails.edit.failed',
            e,
            'Edit email failed.',
          ))
        })
    })
  },

  remove({ state, commit }, payload: { id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.deleting.includes(payload.id)) {
        reject(new Error('accounts.emails.delete.inProgress'))

        return
      }

      const email = Email.find(payload.id)

      if (email === null) {
        reject(new Error('accounts.emails.delete.failed'))

        return
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'delete',
        id: email.id,
      })

      Email.delete(email.id)
        .then((): void => {
          Email.api().delete(
            `/accounts-node/v1/accounts/${email.account_id}/emails/${email.id}`,
            {
              save: false,
            },
          )
            .then((): void => {
              commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: email.id,
              })

              // Entity was successfully deleted from database
              resolve()
            })
            .catch((e: Error): void => {
              commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                type: 'delete',
                id: email.id,
              })

              Email.insert({
                data: email,
              })
                .catch((): void => {
                  // Replacing backup failed, we need to refresh whole list
                  Email.dispatch('fetch', {
                    account_id: email.account_id,
                  })
                    .catch((): void => {
                      // Refreshing failed
                    })
                })

              reject(new ApiError(
                'accounts.emails.delete.failed',
                e,
                'Delete email failed.',
              ))
            })
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'delete',
            id: email.id,
          })

          reject(new ApiError(
            'accounts.emails.delete.failed',
            e,
            'Delete email failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('ACCOUNTS_RESET_STATE')
  },
}

const moduleMutations: MutationTree<EmailState> = {
  /**
   * Set action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Object} state.semaphore.fetching
   * @param {Array} state.semaphore.fetching.items
   * @param {Array} state.semaphore.creating
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ACCOUNTS_SET_SEMAPHORE'](state: EmailState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'fetch':
        state.semaphore.fetching.items.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.items = uniq(state.semaphore.fetching.items)
        break

      case 'create':
        state.semaphore.creating.push(action.id)

        // Make all keys uniq
        state.semaphore.creating = uniq(state.semaphore.creating)
        break

      case 'update':
        state.semaphore.updating.push(action.id)

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break

      case 'delete':
        state.semaphore.deleting.push(action.id)

        // Make all keys uniq
        state.semaphore.deleting = uniq(state.semaphore.deleting)
        break
    }
  },

  /**
   * Reset action processing semaphore
   *
   * @param {Object} state
   * @param {Object} state.semaphore
   * @param {Object} state.semaphore.fetching
   * @param {Array} state.semaphore.fetching.items
   * @param {Array} state.semaphore.creating
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ACCOUNTS_CLEAR_SEMAPHORE'](state: EmailState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'fetch':
        // Process all semaphore items
        state.semaphore.fetching.items
          .forEach((item: string, index: number): void => {
            // Find created item in reading one item semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.fetching.items.splice(index, 1)
            }
          })
        break

      case 'create':
        // Process all semaphore items
        state.semaphore.creating
          .forEach((item: string, index: number): void => {
            // Find created item in creating semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.creating.splice(index, 1)
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

      case 'delete':
        // Process all semaphore items
        state.semaphore.deleting
          .forEach((item: string, index: number): void => {
            // Find removed item in removing semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.deleting.splice(index, 1)
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
  ['ACCOUNTS_RESET_STATE'](state: EmailState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): EmailState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
