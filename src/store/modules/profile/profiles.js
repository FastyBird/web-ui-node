// JSON:API formatter
import Jsona from 'jsona'

import api from '@/api/server'
import { USER_PROFILE_PROFILE } from '@/api/server/types'

import { ApiError } from '@/helpers/errors'

import { COMMON_CLEAR_SEMAPHORE, COMMON_SET_SEMAPHORE } from '../../types'

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

  state: initialState,

  actions: {

    edit({ commit }, { data }) {
      const account = Account.query().first()
      const profile = Profile.query().first()

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, profile)
        Object.assign(formattedData, data)

        formattedData.type = USER_PROFILE_PROFILE

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        Profile.insertOrUpdate({
          data: dataFormatter.deserialize(jsonData),
        })
          .catch(e => {
            reject(new ApiError(
              'profile.profile.edit.failed',
              e,
              'Update account profile failed.',
            ))
          })

        commit(COMMON_SET_SEMAPHORE, {
          type: 'edit',
        })

        api.editProfile(jsonData)
          .then(result => {
            commit(COMMON_CLEAR_SEMAPHORE, {
              type: 'edit',
            })

            Profile.insertOrUpdate({
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
                  'profile.profile.edit.failed',
                  e,
                  'Update account profile failed.',
                ))
              })
          })
          .catch(e => {
            Profile.insertOrUpdate({
              data: profile,
            })

            commit(COMMON_CLEAR_SEMAPHORE, {
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
    [COMMON_SET_SEMAPHORE](state, action) {
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
    [COMMON_CLEAR_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'detail':
          state.semaphore.fetching = false
          break

        case 'edit':
          state.semaphore.updating = false
          break
      }
    },

  },

}
