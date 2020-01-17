import { Middleware } from '@nuxt/types'
import {
  HOME_LINK,
} from '@/configuration/routes'

const anonymousMiddleware: Middleware = ({ app, store, redirect }) => {
  if (store.getters['entities/session/query']().where('id', process.env.NUXT_ENV_SESSION_KEY).count() !== 0) {
    return redirect(app.localePath({ name: HOME_LINK }))
  }
};

export default anonymousMiddleware