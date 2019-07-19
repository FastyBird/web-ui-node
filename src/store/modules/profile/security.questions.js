// JSON:API formatter
import Jsona from 'jsona'

import api from '@/api/server'
import { USER_PROFILE_SECURITY_QUESTION } from '@/api/server/types'

import { ApiError } from '@/helpers/errors'

import { COMMON_CLEAR_SEMAPHORE, COMMON_SET_SEMAPHORE } from '../../types'

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

  state: initialState,

  actions: {

    add({ commit }, { data }) {
      const account = Account.query().first()

      return new Promise((resolve, reject) => {
        const id = uuid.v4()

        const jsonData = {
          data: {
            type: USER_PROFILE_SECURITY_QUESTION,
            id,
            attributes: data,
          },
        }

        SecurityQuestion.insertOrUpdate({
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

        commit(COMMON_SET_SEMAPHORE, {
          type: 'create',
          id,
        })

        api.createSecurityQuestion(jsonData)
          .then(result => {
            commit(COMMON_CLEAR_SEMAPHORE, {
              type: 'create',
              id,
            })

            SecurityQuestion.insertOrUpdate({
              data: Object.assign(
                dataFormatter.deserialize(result.data),
                {
                  account_id: account.id,
                  account: {
                    id: account.id,
                    type: account.type,
                  },
                },
              ),
            })
              .then(() => {
                // Entity was successfully created in database
                resolve()
              })
              .catch(e => {
                reject(new ApiError(
                  'profile.security_question.create.failed',
                  e,
                  'Create account security question failed.',
                ))
              })
          })
          .catch(e => {
            SecurityQuestion.delete(id)

            commit(COMMON_CLEAR_SEMAPHORE, {
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

    edit({ commit }, { id, data }) {
      const account = Account.query().first()
      const question = SecurityQuestion.find(id)

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, question)
        Object.assign(formattedData, data)

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        SecurityQuestion.insertOrUpdate({
          data: dataFormatter.deserialize(jsonData),
        })
          .catch(e => {
            reject(new ApiError(
              'profile.security_question.edit.failed',
              e,
              'Edit account security question failed.',
            ))
          })

        commit(COMMON_SET_SEMAPHORE, {
          type: 'edit',
          id,
        })

        api.editSecurityQuestion(jsonData)
          .then(result => {
            commit(COMMON_CLEAR_SEMAPHORE, {
              type: 'edit',
              id,
            })

            SecurityQuestion.insertOrUpdate({
              data: Object.assign(
                dataFormatter.deserialize(result.data),
                {
                  account_id: account.id,
                  account: {
                    id: account.id,
                    type: account.type,
                  },
                },
              ),
            })
              .then(() => {
                // Entity was successfully created in database
                resolve()
              })
              .catch(e => {
                reject(new ApiError(
                  'profile.security_question.edit.failed',
                  e,
                  'Edit account security question failed.',
                ))
              })
          })
          .catch(e => {
            SecurityQuestion.insertOrUpdate({
              data: question,
            })

            commit(COMMON_CLEAR_SEMAPHORE, {
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

    validate({}, { data }) {
      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, data)

        formattedData.type = USER_PROFILE_SECURITY_QUESTION

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        api.validateSecurityQuestion(jsonData)
          .then(() => {
            // Entity was successfully created in database
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
    [COMMON_SET_SEMAPHORE](state, action) {
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
    [COMMON_CLEAR_SEMAPHORE](state, action) {
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

  },

}
