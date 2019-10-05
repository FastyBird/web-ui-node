// JSON:API formatter
import Jsona from 'jsona'

import api from './../../../api'
import {
  USER_PROFILE_PROFILE,
} from './../../../api/types'
import { ApiError } from './../../../api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,
  IO_SERVER_RESET_STATE,
} from './../../types'

import Account from './Account'
import Profile from './Profile'

const dataFormatter = new Jsona()

const initialState = {

  semaphore: {
    fetching: false,
    updating: false,
  },

}

export default {

  state: () => (initialState),

  actions: {

    edit({ state, commit }, { first_name, last_name, middle_name }) {
      if (state.semaphore.updating) {
        return Promise.reject(new Error('profile.profile.update.inProgress'))
      }

      const account = Account.query().first()
      const profile = Profile.query().first()

      const data = {
        details: {
          first_name,
          last_name,
          middle_name,
        },
      }

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, profile)
        Object.assign(formattedData, data)

        formattedData.type = USER_PROFILE_PROFILE

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        Profile.update({
          where: profile.id,
          data: dataFormatter.deserialize(jsonData),
        })
          .catch(e => {
            reject(new ApiError(
              'profile.profile.edit.failed',
              e,
              'Update account profile failed.',
            ))
          })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'edit',
        })

        api.editProfile(jsonData)
          .then(result => {
            const updatedData = dataFormatter.deserialize(result.data)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
            })

            updatedData.account_id = account.id
            updatedData.account = {
              id: account.id,
              type: account.type,
            }

            Profile.update({
              where: profile.id,
              data: updatedData,
            })
              .then(() => {
                // Entity was successfully updated in database
                resolve()
              })
              .catch(e => {
                // Revert changes
                Profile.update({
                  where: profile.id,
                  data: profile,
                })
                  .catch(() => {
                    // Nothing to do here
                  })

                reject(new ApiError(
                  'profile.profile.edit.failed',
                  e,
                  'Update account profile failed.',
                ))
              })
          })
          .catch(e => {
            // Revert changes
            Profile.update({
              where: profile.id,
              data: profile,
            })
              .catch(() => {
                // Nothing to do here
              })

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
            })

            reject(new ApiError(
              'profile.profile.edit.failed',
              e,
              'Update account profile failed.',
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
     * @param {Boolean} state.semaphore.updating
     * @param {Object} action
     * @param {String} action.type
     */
    [IO_SERVER_SET_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'detail':
          state.semaphore.fetching = true
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
     * @param {Boolean} state.semaphore.updating
     * @param {Object} action
     * @param {String} action.type
     */
    [IO_SERVER_CLEAR_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'detail':
          state.semaphore.fetching = false
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
