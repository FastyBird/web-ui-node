import { Middleware } from '@nuxt/types'
import {
  ACCOUNT_SIGN_IN_LINK,
} from '~/configuration/routes'

const authenticatedMiddleware: Middleware = ({ app, store, redirect }) => {
  if (!store.getters['session/isSignedIn']()) {
    return redirect(app.localePath({ name: ACCOUNT_SIGN_IN_LINK }))
  }
}

export default authenticatedMiddleware
