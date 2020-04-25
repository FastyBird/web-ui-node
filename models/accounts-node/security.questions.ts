import { ActionTree, MutationTree } from 'vuex'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'

import { AccountInterface } from './Account'
import SecurityQuestion, { SecurityQuestionInterface } from './SecurityQuestion'

import { ApiError } from './errors'

import {
  ACCOUNTS_NODE_SECURITY_QUESTION,
} from './types'

interface SecurityQuestionSemaphoreFetchingState {
  item: Array<string>;
}

interface SecurityQuestionSemaphoreState {
  fetching: SecurityQuestionSemaphoreFetchingState;
  creating: Array<string>;
  updating: Array<string>;
  deleting: Array<string>;
}

interface SecurityQuestionState {
  semaphore: SecurityQuestionSemaphoreState;
}

interface SemaphoreAction {
  id: string;
  type: string;
}

function mapSecurityQuestionResponse(item: any): any {
  const mapped = cloneDeep(item)

  if (item.account) {
    mapped.account_id = item.account.id
  }

  return mapped
}

const moduleState: SecurityQuestionState = {

  semaphore: {
    fetching: {
      item: [],
    },
    creating: [],
    updating: [],
    deleting: [],
  },

}

const moduleActions: ActionTree<SecurityQuestionState, any> = {
  get({ state, commit }, payload: { account_id: string }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.fetching.item.includes(payload.account_id)) {
        resolve(false)

        return
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'get',
        id: payload.account_id,
      })

      SecurityQuestion.api().get(`/accounts-node/v1/accounts/${payload.account_id}/security-question`, {
        dataTransformer: (result: AxiosResponse): any | null => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'get',
            id: payload.account_id,
          })

          const dataFormatter = new Jsona()

          return mapSecurityQuestionResponse(dataFormatter.deserialize(result.data))
        },
      })
        .then((): void => {
          // Entity was successfully fetched from server
          resolve(true)
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'get',
            id: payload.account_id,
          })

          reject(new ApiError(
            'accounts.security_question.get.failed',
            e,
            'Fetching security question failed.',
          ))
        })
    })
  },

  add({ commit }, payload: { account: AccountInterface, question: string, is_custom: boolean, answer: string, locking_notice: boolean }): Promise<any> {
    return new Promise((resolve, reject): void => {
      const id = uuid.v4()

      const entity = {
        id,
        type: ACCOUNTS_NODE_SECURITY_QUESTION,

        question: payload.question,
        is_custom: payload.is_custom,
        answer: payload.answer,
        locking_notice: payload.locking_notice,

        account_id: payload.account.id,
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'create',
        id,
      })

      SecurityQuestion.insert({
        data: entity,
      })
        .then((entities): void => {
          const dataFormatter = new Jsona()

          if (Object.prototype.hasOwnProperty.call(entities, 'security_question') && Array.isArray(entities.security_question)) {
            entities.security_question
              .forEach((createdQuestion): void => {
                SecurityQuestion.api().post(
                  `/accounts-node/v1/accounts/${payload.account.id}/security-question`,
                  dataFormatter.serialize({
                    stuff: Object.assign({}, createdQuestion, {
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

                      return mapSecurityQuestionResponse(dataFormatter.deserialize(result.data))
                    },
                  },
                )
                  .then((): void => {
                    // Entity was successfully created in database
                    resolve(createdQuestion)
                  })
                  .catch((e: Error): void => {
                    commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                      type: 'create',
                      id,
                    })

                    SecurityQuestion.delete(id)
                      .catch((): void => {
                        // Failed creating could not be removed
                      })

                    reject(new ApiError(
                      'accounts.security_question.create.failed',
                      e,
                      'Create new security question failed.',
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

          SecurityQuestion.delete(id)
            .catch((): void => {
              // Failed creating could not be removed
            })

          reject(new ApiError(
            'accounts.security_question.create.failed',
            e,
            'Create new security question failed.',
          ))
        })
    })
  },

  edit({ state, commit }, payload: { id: string, current_answer: string, question: string, is_custom: boolean, answer: string, locking_notice: boolean }): Promise<any> {
    return new Promise((resolve, reject): void => {
      if (state.semaphore.updating.includes(payload.id)) {
        reject(new Error('accounts.security_question.update.inProgress'))

        return
      }

      const securityQuestion = SecurityQuestion.find(payload.id)

      if (securityQuestion === null) {
        reject(new Error('accounts.security_question.edit.failed'))

        return
      }

      commit('ACCOUNTS_SET_SEMAPHORE', {
        type: 'update',
        id: securityQuestion.id,
      })

      SecurityQuestion.update({
        where: securityQuestion.id,
        data: {
          current_answer: payload.current_answer,
          question: payload.question,
          is_custom: payload.is_custom,
          answer: payload.answer,
          locking_notice: payload.locking_notice,
        },
      })
        .then((updatedSecurityQuestion): void => {
          if (updatedSecurityQuestion instanceof SecurityQuestion) {
            const dataFormatter = new Jsona()

            SecurityQuestion.api().patch(
              `/accounts-node/v1/accounts/${updatedSecurityQuestion.account_id}/security-question`,
              dataFormatter.serialize({
                stuff: Object.assign({}, updatedSecurityQuestion, {
                  answer: payload.answer,
                  current_answer: payload.current_answer,
                  relationshipNames: [],
                }),
              }),
              {
                dataTransformer: (result: AxiosResponse): any | null => {
                  commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                    type: 'update',
                    id: updatedSecurityQuestion.id,
                  })

                  return mapSecurityQuestionResponse(dataFormatter.deserialize(result.data))
                },
              },
            )
              .then((): void => {
                // Entity was successfully updated in database
                resolve(updatedSecurityQuestion)
              })
              .catch((e: Error): void => {
                commit('ACCOUNTS_CLEAR_SEMAPHORE', {
                  type: 'update',
                  id: updatedSecurityQuestion.id,
                })

                SecurityQuestion.update({
                  where: updatedSecurityQuestion.id,
                  data: securityQuestion,
                })
                  .catch((): void => {
                    // Replacing backup failed, we need to refresh whole list
                    SecurityQuestion.dispatch('fetch', {
                      account_id: securityQuestion.account_id,
                    })
                      .catch((): void => {
                        // Refreshing failed
                      })
                  })

                reject(new ApiError(
                  'accounts.security_question.edit.failed',
                  e,
                  'Edit security question failed.',
                ))
              })
          }
        })
        .catch((e: Error): void => {
          commit('ACCOUNTS_CLEAR_SEMAPHORE', {
            type: 'update',
            id: securityQuestion.id,
          })

          reject(new ApiError(
            'accounts.security_question.edit.failed',
            e,
            'Edit security question failed.',
          ))
        })
    })
  },

  reset({ commit }): void {
    commit('ACCOUNTS_RESET_STATE')
  },
}

const moduleMutations: MutationTree<SecurityQuestionState> = {
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
  ['ACCOUNTS_SET_SEMAPHORE'](state: SecurityQuestionState, action: SemaphoreAction): void {
    switch (action.type) {
      case 'get':
        state.semaphore.fetching.item.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
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
   * @param {Array} state.semaphore.fetching.item
   * @param {Array} state.semaphore.creating
   * @param {Array} state.semaphore.updating
   * @param {Array} state.semaphore.deleting
   * @param {Object} action
   * @param {String} action.type
   * @param {String} action.id
   */
  ['ACCOUNTS_CLEAR_SEMAPHORE'](state: SecurityQuestionState, action: SemaphoreAction): void {
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
  ['ACCOUNTS_RESET_STATE'](state: SecurityQuestionState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): SecurityQuestionState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
