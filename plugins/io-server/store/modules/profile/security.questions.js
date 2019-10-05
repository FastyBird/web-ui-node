// JSON:API formatter
import Jsona from 'jsona'

import api from './../../../api'
import { USER_PROFILE_SECURITY_QUESTION } from './../../../api/types'

import { ApiError } from './../../../api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,
  IO_SERVER_RESET_STATE,
} from './../../types'

import uuid from 'uuid'

import Account from './Account'
import SecurityQuestion from './SecurityQuestion'

const dataFormatter = new Jsona()

const initialState = {

  semaphore: {
    fetching: false,
    creating: false,
    updating: false,
  },

}

export default {

  state: () => (initialState),

  actions: {

    add({ commit }, { question, is_custom = false, answer, locking_notice = false }) {
      const account = Account.query().first()

      const data = {
        question,
        is_custom,
        answer,
        locking_notice,
      }

      return new Promise((resolve, reject) => {
        const id = uuid.v4()

        const jsonData = {
          data: {
            type: USER_PROFILE_SECURITY_QUESTION,
            id,
            attributes: data,
          },
        }

        SecurityQuestion.insert({
          data: Object.assign(
            dataFormatter.deserialize(jsonData),
            {
              account_id: account.id,
              account: {
                id: account.id,
                type: account.type,
              },
            },
          ),
        })
          .catch(e => {
            reject(new ApiError(
              'profile.security_question.create.failed',
              e,
              'Create account security question failed.',
            ))
          })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'create',
          id,
        })

        api.createSecurityQuestion(jsonData)
          .then(result => {
            const updatedData = dataFormatter.deserialize(result.data)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'create',
              id,
            })

            updatedData.account_id = account.id
            updatedData.account = {
              id: account.id,
              type: account.type,
            }

            SecurityQuestion.update({
              where: id,
              data: updatedData,
            })
              .then(() => {
                // Entity was successfully created in database
                resolve()
              })
              .catch(e => {
                // Revert changes
                SecurityQuestion.delete(id)
                  .catch(() => {
                    // Nothing to do here
                  })

                reject(new ApiError(
                  'profile.security_question.create.failed',
                  e,
                  'Create account security question failed.',
                ))
              })
          })
          .catch(e => {
            // Revert changes
            SecurityQuestion.delete(id)
              .catch(() => {
                // Nothing to do here
              })

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'create',
              id,
            })

            reject(new ApiError(
              'profile.security_question.create.failed',
              e,
              'Create account security question failed.',
            ))
          })
      })
    },

    edit({ state, commit }, { id, current_answer, question, is_custom = false, answer, locking_notice = false }) {
      if (state.semaphore.updating) {
        return Promise.reject(new Error('profile.security_question.update.inProgress'))
      }

      const account = Account.query().first()
      const securityQuestion = SecurityQuestion.find(id)

      const data = {
        current_answer,
        question,
        is_custom,
        answer,
        locking_notice,
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, securityQuestion)
        Object.assign(formattedData, data)

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        SecurityQuestion.update({
          where: securityQuestion.id,
          data: dataFormatter.deserialize(jsonData),
        })
          .catch(e => {
            reject(new ApiError(
              'profile.security_question.edit.failed',
              e,
              'Edit account security question failed.',
            ))
          })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'edit',
          id,
        })

        api.editSecurityQuestion(jsonData)
          .then(result => {
            const updatedData = dataFormatter.deserialize(result.data)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
              id,
            })

            updatedData.account_id = account.id
            updatedData.account = {
              id: account.id,
              type: account.type,
            }

            SecurityQuestion.update({
              where: securityQuestion.id,
              data: updatedData,
            })
              .then(() => {
                // Entity was successfully updated in database
                resolve()
              })
              .catch(e => {
                // Revert changes
                SecurityQuestion.update({
                  where: securityQuestion.id,
                  data: securityQuestion,
                })
                  .catch(() => {
                    // Nothing to do here
                  })

                reject(new ApiError(
                  'profile.security_question.edit.failed',
                  e,
                  'Edit account security question failed.',
                ))
              })
          })
          .catch(e => {
            // Revert changes
            SecurityQuestion.update({
              where: securityQuestion.id,
              data: securityQuestion,
            })
              .catch(() => {
                // Nothing to do here
              })

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
              id,
            })

            reject(new ApiError(
              'profile.security_question.edit.failed',
              e,
              'Edit account security question failed.',
            ))
          })
      })
    },

    validate({}, { answer }) {
      const data = {
        current_answer: answer,
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, data)

        formattedData.type = USER_PROFILE_SECURITY_QUESTION

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        api.validateSecurityQuestion(jsonData)
          .then(() => {
            // Validation was successful
            resolve()
          })
          .catch(e => {
            reject(new ApiError(
              'profile.security_question.validate.failed',
              e,
              'Validate security question address failed.',
            ))
          })
      })
    },

    reset({ commit }) {
      commit(IO_SERVER_RESET_STATE)
    },

  },

  mutations: {

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
    [IO_SERVER_SET_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'detail':
          state.semaphore.fetching = true
          break

        case 'create':
          state.semaphore.creating = true
          break

        case 'edit':
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
    [IO_SERVER_CLEAR_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'detail':
          state.semaphore.fetching = false
          break

        case 'create':
          state.semaphore.creating = false
          break

        case 'edit':
          state.semaphore.updating = false
          break
      }
    },

    /**
     * Reset store to initial state
     *
     * @param {Object} state
     */
    [IO_SERVER_RESET_STATE](state) {
      Object.assign(state, initialState)
    },

  },

}
