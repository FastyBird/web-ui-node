import { Middleware, NuxtAppOptions } from '@nuxt/types'
// @ts-ignore
import jwtDecode from 'jwt-decode'

import Session, { SessionInterface } from '~/models/accounts-node/Session'
import Device from '~/models/devices-node/Device'
import Trigger from '~/models/triggers-node/Trigger'

function updateTokensCookies(app: NuxtAppOptions, session: SessionInterface): void {
  const decodedAccessToken = jwtDecode(session.token)

  app.$cookies.set('token', session.token, {
    path: '/',
    maxAge: (((new Date(decodedAccessToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
  })

  const decodedRefreshToken = jwtDecode(session.refresh)

  app.$cookies.set('refresh_token', session.refresh, {
    path: '/',
    maxAge: (((new Date(decodedRefreshToken.exp * 1000)).getTime() / 1000) - ((new Date()).getTime() / 1000)),
  })
}

const sessionMiddleware: Middleware = ({ app, store }): Promise<any> => {
  const accessTokenCookie = app.$cookies.get('token')
  const refreshTokenCookie = app.$cookies.get('refresh_token')

  if (
    accessTokenCookie !== null &&
    typeof accessTokenCookie !== 'undefined' &&
    accessTokenCookie !== '' &&
    Session.query().first() === null
  ) {
    // //////////////////////////////////////////////////////////////////////////
    // Access token is present, session is not loaded, probably after page reload
    // Try to load session from server
    // //////////////////////////////////////////////////////////////////////////
    return Session.dispatch('get', {
      token: accessTokenCookie,
      refresh: refreshTokenCookie,
    })
      .catch((e: Error) => {
        if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
          app.$sentry.captureException(e)
        } else {
          // eslint-disable-next-line
          console.log('Middleware: Fetch session error - both tokens presents')
        }
      })
  }

  if (
    accessTokenCookie === null ||
    typeof accessTokenCookie === 'undefined' ||
    accessTokenCookie === '' ||
    refreshTokenCookie === null ||
    typeof refreshTokenCookie === 'undefined' ||
    refreshTokenCookie === ''
  ) {
    // /////////////////////////////////////////
    // Try to refresh session with refresh token
    // /////////////////////////////////////////
    if (
      refreshTokenCookie !== null &&
      typeof refreshTokenCookie !== 'undefined' &&
      refreshTokenCookie !== ''
    ) {
      // ///////////////////////////////
      // Perform session refresh process
      // ///////////////////////////////
      return Session.dispatch('refresh', {
        refresh_token: refreshTokenCookie,
      })
        .then((session: SessionInterface) => {
          // Session was successfully refreshed
          updateTokensCookies(app, session)
        })
        .catch((e: Error) => {
          // Session refreshing failed
          app.$cookies.remove('token')
          app.$cookies.remove('refresh_token')

          // Process cleanup
          store.dispatch('entities/deleteAll')
          Session.dispatch('reset')
          Device.dispatch('reset')
          Trigger.dispatch('reset')

          if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
            app.$sentry.captureException(e)
          } else {
            // eslint-disable-next-line
            console.log('Middleware: Refresh session failed - one token missing')
          }
        })
    }

    // //////////////////////////////////////////////////////////////////////
    // One of tokes is missing, we could not continue with authenticated user
    // //////////////////////////////////////////////////////////////////////
    app.$cookies.remove('token')
    app.$cookies.remove('refresh_token')

    // Process cleanup
    return store.dispatch('entities/deleteAll')
      .then(() => {
        Session.dispatch('reset')
        Device.dispatch('reset')
        Trigger.dispatch('reset')
      })
  } else {
    try {
      const decodedAccessToken = jwtDecode(accessTokenCookie)
      const decodedRefreshToken = jwtDecode(refreshTokenCookie)

      // Access token is expired && refresh token is still valid
      if (
        ((new Date()).getTime() / 1000) >= ((new Date(decodedAccessToken.exp * 1000)).getTime() / 1000) &&
        ((new Date()).getTime() / 1000) < ((new Date(decodedRefreshToken.exp * 1000)).getTime() / 1000)
      ) {
        // Token is expired
        app.$cookies.remove('token')

        // ///////////////////////////////
        // Perform session refresh process
        // ///////////////////////////////
        return Session.dispatch('refresh', {
          refresh_token: refreshTokenCookie,
        })
          .then((session: SessionInterface) => {
            // Session was successfully refreshed
            updateTokensCookies(app, session)
          })
          .catch((e: Error) => {
            // Session refreshing failed
            app.$cookies.remove('token')
            app.$cookies.remove('refresh_token')

            // Process cleanup
            store.dispatch('entities/deleteAll')
            Session.dispatch('reset')
            Device.dispatch('reset')
            Trigger.dispatch('reset')

            if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
              app.$sentry.captureException(e)
            } else {
              // eslint-disable-next-line
              console.log('Middleware: Refresh session failed - expired token')
            }
          })
      } else if (
        ((new Date()).getTime() / 1000) >= ((new Date(decodedAccessToken.exp * 1000)).getTime() / 1000) &&
        ((new Date()).getTime() / 1000) >= ((new Date(decodedRefreshToken.exp * 1000)).getTime() / 1000)
      ) {
        // Both tokens are expired
        app.$cookies.remove('token')
        app.$cookies.remove('refresh_token')

        // Process cleanup
        return store.dispatch('entities/deleteAll')
          .then(() => {
            Session.dispatch('reset')
            Device.dispatch('reset')
            Trigger.dispatch('reset')
          })
      }

      return Promise.resolve()
    } catch (e) {
      if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
        app.$sentry.captureException(e)
      } else {
        // eslint-disable-next-line
        console.log('Middleware: At least one token is invalid')
      }

      // Token could not be parsed
      app.$cookies.remove('token')
      app.$cookies.remove('refresh_token')

      // Process cleanup
      return store.dispatch('entities/deleteAll')
        .then(() => {
          Session.dispatch('reset')
          Device.dispatch('reset')
          Trigger.dispatch('reset')
        })
    }
  }
}

export default sessionMiddleware
