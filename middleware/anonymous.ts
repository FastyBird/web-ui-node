import { Middleware } from '@nuxt/types'
import {
  HOME_LINK,
} from '~/configuration/routes'

const anonymousMiddleware: Middleware = ({ app, store, redirect }) => {
  if (store.getters['session/isSignedIn']()) {
    return redirect(app.localePath({ name: HOME_LINK }))
  }
}

export default anonymousMiddleware
