import { Middleware } from '@nuxt/types'
import {
  HOME_LINK,
} from '@/configuration/routes'

import Session from '~/models/accounts-node/Session'

const anonymousMiddleware: Middleware = ({ app, store, redirect }) => {
  if (Session.query().count() !== 0) {
    return redirect(app.localePath({ name: HOME_LINK }))
  }
}

export default anonymousMiddleware
