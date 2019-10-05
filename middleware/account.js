import * as types from '@/node_modules/@fastybird-com/theme/store/types'

export default function({ store }) {
  const profile = store.getters['entities/profile/query']().first()

  if (profile !== null) {
    store.commit(`theme/${types.ACCOUNT_USERNAME}`, profile.name)
    store.commit(`theme/${types.ACCOUNT_EMAIL}`, profile.email)

    //this.$sentry.configureScope(scope => {
    //  scope.setUser({
    //    'email': profile.email,
    //  })
    //})
  }
}
