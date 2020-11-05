import { Middleware } from '@nuxt/types'
import { Scope } from '@sentry/types/dist/scope'

const accountMiddleware: Middleware = ({ app, store }) => {
  const account = store.getters['session/getAccount']()

  if (
    !app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry') &&
    account !== null
  ) {
    app.$sentry.configureScope((scope: Scope) => {
      scope.setUser({
        email: account.email?.address,
      })
    })
  }
}

export default accountMiddleware
