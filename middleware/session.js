import jwtDecode from 'jwt-decode'

export default function({ app, store }) {
  const tokenCookie = app.$cookies.get('token')

  if (tokenCookie === null || typeof tokenCookie === 'undefined') {
    app.$cookies.remove('token')
    app.$cookies.remove('refresh_token')
  } else {
    try {
      const decoded = jwtDecode(tokenCookie)

      const refreshToken = app.$cookies.get('refresh_token')

      // Access token is expired
      if ((new Date() / 1000) >= (new Date(decoded.exp * 1000) / 1000)) {
        // Token is expired
        app.$cookies.remove('token')

        if (refreshToken !== null && typeof refreshToken !== 'undefined') {
          return store.dispatch('entities/session/refresh', {
            id: process.env.NUXT_ENV_SESSION_KEY,
            refresh_token: refreshToken,
          }, {
            root: true,
          })
            .then(tokens => {
              app.$cookies.set('token', tokens.token)
              app.$cookies.set('refresh_token', tokens.refresh)
            })
            .catch(() => {
              app.$cookies.remove('token')
              app.$cookies.remove('refresh_token')
            })
        } else {
          app.$cookies.remove('token')
          app.$cookies.remove('refresh_token')
        }
      } else {
        return store.dispatch('entities/session/fetch', {
          id: process.env.NUXT_ENV_SESSION_KEY,
          token: tokenCookie,
          refresh: refreshToken,
        }, {
          root: true,
        })
          .catch(e => {
            console.log(e)
          })
      }
    } catch (error) {
      // Token could not be parsed
      app.$cookies.remove('token')
      app.$cookies.remove('refresh_token')
    }
  }
}
