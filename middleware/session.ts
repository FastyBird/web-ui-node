import { Middleware, NuxtAppOptions } from '@nuxt/types'
import { Store } from 'vuex'
import get from 'lodash/get'
// @ts-ignore
import jwtDecode from 'jwt-decode'

import Account from '~/models/auth-module/accounts/Account'
import Device from '~/models/devices-module/devices/Device'
import Trigger from '~/models/triggers-module/triggers/Trigger'

function updateCookies(app: NuxtAppOptions, accessToken: string, refreshToken: string): void {
  const decodedAccessToken = jwtDecode(accessToken)

  app.$cookies.set('token', accessToken, {
    path: '/',
    maxAge: (((new Date(decodedAccessToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
  })

  const decodedRefreshToken = jwtDecode(refreshToken)

  app.$cookies.set('refresh_token', refreshToken, {
    path: '/',
    maxAge: (((new Date(decodedRefreshToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
  })
}

function readCookie(app: NuxtAppOptions, name: string): string | null {
  if (
    app.$cookies.get(name) !== null &&
    typeof app.$cookies.get(name) !== 'undefined' &&
    app.$cookies.get(name) !== ''
  ) {
    return app.$cookies.get(name)
  }

  return null
}

function sessionCleanup(app: NuxtAppOptions, store: Store<any>): void {
  app.$cookies.remove('token')
  app.$cookies.remove('refresh_token')

  // Process cleanup
  store.dispatch('entities/deleteAll')
    .then(() => {
      Account.dispatch('reset')
      Device.dispatch('reset')
      Trigger.dispatch('reset')
    })
}

const sessionMiddleware: Middleware = ({ app, store }): Promise<any> => {
  const accessTokenCookie = readCookie(app, 'token')
  const refreshTokenCookie = readCookie(app, 'refresh_token')

  // ///////////////////////////////
  // Both tokens cookies are present
  // ///////////////////////////////
  if (
    accessTokenCookie !== null &&
    refreshTokenCookie !== null
  ) {
    const decodedAccessToken = jwtDecode(accessTokenCookie)
    const decodedRefreshToken = jwtDecode(refreshTokenCookie)

    if (((new Date()).getTime() / 1000) >= ((new Date(get(decodedAccessToken, 'exp', 0) * 1000)).getTime() / 1000)) {
      // Access token is expired
      app.$cookies.remove('token')

      // ///////////////////////////////
      // Perform session refresh process
      // ///////////////////////////////
      return app.$backendApi.refreshSession({
        refreshToken: refreshTokenCookie,
      })
        .then((tokens) => {
          // Session was successfully refreshed
          updateCookies(app, tokens.accessToken, tokens.refreshToken)
        })
        .catch((e: Error) => {
          // Session refreshing failed
          sessionCleanup(app, store)

          if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
            app.$sentry.captureException(e)
          } else {
            // eslint-disable-next-line
            console.log('Middleware: Refresh session failed - expired token')
          }
        })
    }

    if (((new Date()).getTime() / 1000) >= ((new Date(get(decodedRefreshToken, 'exp', 0) * 1000)).getTime() / 1000)) {
      // Both tokens are expired
      sessionCleanup(app, store)

      return Promise.resolve()
    }

    // /////////////////////////////////////////
    // Try to refresh session with refresh token
    // /////////////////////////////////////////
    if (accessTokenCookie === null && refreshTokenCookie !== null) {
      return app.$backendApi.refreshSession({
        refreshToken: refreshTokenCookie,
      })
        .then((tokens) => {
          // Session was successfully refreshed
          updateCookies(app, tokens.accessToken, tokens.refreshToken)
        })
        .catch((e: Error) => {
          // Session refreshing failed
          sessionCleanup(app, store)

          if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
            app.$sentry.captureException(e)
          } else {
            // eslint-disable-next-line
            console.log('Middleware: Refresh session failed - one token missing')
          }
        })
    }

    // ////////////////////
    // Try to check account
    // ////////////////////
    return store.dispatch('session/set', {
      accessToken: accessTokenCookie,
      refreshToken: refreshTokenCookie,
      tokenExpiration: (new Date(get(decodedAccessToken, 'exp', 0) * 1000)).toISOString(),
      tokenType: 'Bearer',
      accountId: get(decodedAccessToken, 'user'),
    }, {
      root: true,
    })
      .then(() => {
        if (store.getters['session/getAccount']() === null) {
          // //////////////////////////////////////
          // Session account is not loaded in store
          // Try to load session from server
          // //////////////////////////////////////
          return Account.dispatch('get', {
            id: store.getters['session/getAccountId'](),
          })
            .catch((e) => {
              if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
                app.$sentry.captureException(e)
              } else {
                // eslint-disable-next-line
                console.log('Middleware: Fetch account error - both tokens presents')
              }
            })
        }

        return Promise.resolve()
      })
      .catch((e) => {
        if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
          app.$sentry.captureException(e)
        } else {
          // eslint-disable-next-line
          console.log('Middleware: Store session error - both tokens presents')
        }

        sessionCleanup(app, store)
      })
  }

  // /////////////////////////////////////////
  // Try to refresh session with refresh token
  // /////////////////////////////////////////
  if (refreshTokenCookie !== null) {
    return app.$backendApi.refreshSession({
      refreshToken: refreshTokenCookie,
    })
      .then((tokens) => {
        // Session was successfully refreshed
        updateCookies(app, tokens.accessToken, tokens.refreshToken)
      })
      .catch((e: Error) => {
        // Session refreshing failed
        sessionCleanup(app, store)

        if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
          app.$sentry.captureException(e)
        } else {
          // eslint-disable-next-line
          console.log('Middleware: Refresh session failed - one token missing')
        }
      })
  }

  // ///////////////////////////////////////////////////////////////////////
  // Refresh token is missing, we could not continue with authenticated user
  // ///////////////////////////////////////////////////////////////////////
  sessionCleanup(app, store)

  return Promise.resolve()
}

export default sessionMiddleware
