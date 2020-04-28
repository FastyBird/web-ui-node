import { Middleware } from '@nuxt/types'
import {
  ACCOUNT_SIGN_IN_LINK,
} from '~/configuration/routes'

import Session from '~/models/accounts-node/Session'

const authenticatedMiddleware: Middleware = ({ app, store, redirect }) => {
  if (Session.query().count() === 0) {
    return redirect(app.localePath({ name: ACCOUNT_SIGN_IN_LINK }))
  }
}

export default authenticatedMiddleware
