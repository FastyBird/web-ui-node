import { Middleware } from '@nuxt/types'
import { Scope } from '@sentry/types/dist/scope'

import Session from '~/models/accounts-node/Session'
import Account from '~/models/accounts-node/Account'

const accountMiddleware: Middleware = ({ app, store }) => {
  const session = Session.query().first()

  if (session !== null) {
    const account = Account.query().where('session_id', session.id).first()

    if (account !== null) {
      if (!app.context.isDev && Object.prototype.hasOwnProperty.call(app, '$sentry')) {
        app.$sentry.configureScope((scope: Scope) => {
          scope.setUser({
            email: account.email,
          })
        })
      }
    }
  }
}

export default accountMiddleware
