import { Plugin } from '@nuxt/types'

import * as routes from '@/configuration/routes'

declare module 'vue/types/vue' {
  interface Vue {
    $routes(): void
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $routes(): void
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $routes(): void
  }
}

const routesPlugin: Plugin = (context, inject) => {
  inject('routes', {
    home: routes.HOME_LINK,
    account: {
      signIn: routes.ACCOUNT_SIGN_IN_LINK,
      signUp: routes.ACCOUNT_SIGN_UP_LINK,
      resetPassword: routes.ACCOUNT_RESET_PASSWORD_LINK,
    },
    things: {
      list: routes.THINGS_LIST_LINK,
      detail: routes.THINGS_THING_DETAIL_LINK,
      routines: routes.THINGS_THING_ROUTINES_LINK,
      connect: routes.THINGS_THING_CONNECT_LINK,
    },
    groups: {
      list: routes.GROUPS_LIST_LINK,
      detail: routes.GROUPS_GROUP_DETAIL_LINK,
      create: routes.GROUPS_GROUP_CREATE_LINK,
    },
    routines: {
      list: routes.ROUTINES_LIST_LINK,
      detail: routes.ROUTINES_ROUTINE_DETAIL_LINK,
      create: routes.ROUTINES_CREATE_LINK,
    },
  })
};

export default routesPlugin