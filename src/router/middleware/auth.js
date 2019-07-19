import Vue from 'vue'
import jwtDecode from 'jwt-decode'
import axios from 'axios'

import { ACCOUNT_SIGN_IN_LINK } from '../index'
import { USER_PROFILE_SESSION } from '@/api/server/types'

export default function auth({ next }) {
  const token = Vue.cookie.get('token')

  if (token === null) {
    next({
      path: ACCOUNT_SIGN_IN_LINK,
    })
  } else {
    try {
      const decoded = jwtDecode(token)

      if ((new Date() / 1000) >= (new Date(decoded.exp * 1000) / 1000)) {
        // Token is expired
        Vue.cookie.delete('token')

        const refreshToken = Vue.cookie.get('refresh_token')

        if (refreshToken !== null) {
          axios.patch(`${process.env.VUE_APP_API_ROOT}/user-profile/session`, {
            data: {
              type: USER_PROFILE_SESSION,
              attributes: {
                refresh: refreshToken,
              },
            },
          }, {
            headers: {
              'Content-Type': 'application/vnd.api+json',
              'X-Api-Key': process.env.VUE_APP_API_KEY,
            },
          })
            .then((res) => {
              // Update access token
              if (res.data.data.hasOwnProperty('attributes') && res.data.data.attributes.hasOwnProperty('token')) {
                Vue.cookie.delete('token')
                Vue.cookie.set('token', res.data.data.attributes.token)
              }

              // Update refresh token
              if (res.data.data.hasOwnProperty('attributes') && res.data.data.attributes.hasOwnProperty('refresh')) {
                Vue.cookie.delete('refresh_token')
                Vue.cookie.set('refresh_token', res.data.data.attributes.refresh)
              }
            })
            .catch(() => {
              // Token could not be refreshed
              next({
                path: ACCOUNT_SIGN_IN_LINK,
              })
            })
        } else {
          next({
            path: ACCOUNT_SIGN_IN_LINK,
          })
        }
      }
    } catch (error) {
      // Token could not be parsed
      Vue.cookie.delete('token')

      next({
        path: ACCOUNT_SIGN_IN_LINK,
      })
    }
  }

  return next()
}
