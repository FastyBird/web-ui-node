import { Middleware } from '@nuxt/types'
import {
  ACCOUNT_SIGN_IN_LINK,
} from '@/configuration/routes'

const authenticatedMiddleware: Middleware = ({ app, store, redirect }) => {
  if (store.getters['entities/session/query']().where('id', process.env.NUXT_ENV_SESSION_KEY).count() === 0) {
    return redirect(app.localePath({ name: ACCOUNT_SIGN_IN_LINK }))
  }
};

export default authenticatedMiddleware
