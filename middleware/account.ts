import { Middleware } from '@nuxt/types'
// @ts-ignore
import * as types from '@/node_modules/@fastybird-com/theme/store/types.js'

const accountMiddleware: Middleware = ({ app, store }) => {
  const profile = store.getters['entities/profile/query']().first();

  if (profile !== null) {
    store.commit(`theme/${types.ACCOUNT_USERNAME}`, profile.name);
    store.commit(`theme/${types.ACCOUNT_EMAIL}`, profile.email);

    if (Object.prototype.hasOwnProperty.call(app, '$sentry')) {
      app.$sentry.configureScope((scope:any) => {
        scope.setUser({
          email: profile.email,
        })
      });
    }
  }
};

export default accountMiddleware
