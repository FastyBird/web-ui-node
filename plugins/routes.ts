import { Plugin } from '@nuxt/types'

import * as routes from '~/configuration/routes'

interface AccountRoutesInterface {
  signIn: string;
  signUp: string;
  resetPassword: string;
}

interface DevicesRoutesInterface {
  list: string;
  detail: string;
  connect: string;
}

interface GroupsRoutesInterface {
  list: string;
  detail: string;
  create: string;
}

interface TriggersRoutesInterface {
  list: string;
  detail: string;
  create: string;
}

interface UsersRoutesInterface {
  list: string;
  detail: string;
  create: string;
}

interface RoutesInterface {
  home: string;
  account: AccountRoutesInterface;
  devices: DevicesRoutesInterface;
  groups: GroupsRoutesInterface;
  triggers: TriggersRoutesInterface;
  users: UsersRoutesInterface;
}

declare module 'vue/types/vue' {
  interface Vue {
    $routes: RoutesInterface
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $routes: RoutesInterface
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $routes: RoutesInterface
  }
}

const routesPlugin: Plugin = (context, inject): void => {
  inject('routes', {
    home: routes.HOME_LINK,
    account: {
      signIn: routes.ACCOUNT_SIGN_IN_LINK,
      signUp: routes.ACCOUNT_SIGN_UP_LINK,
      resetPassword: routes.ACCOUNT_RESET_PASSWORD_LINK,
    },
    devices: {
      list: routes.DEVICES_LIST_LINK,
      detail: routes.DEVICES_DETAIL_LINK,
      connect: routes.DEVICES_CONNECT_LINK,
    },
    groups: {
      list: routes.GROUPS_LIST_LINK,
      detail: routes.GROUPS_GROUP_DETAIL_LINK,
      create: routes.GROUPS_GROUP_CREATE_LINK,
    },
    triggers: {
      list: routes.TRIGGERS_LIST_LINK,
      detail: routes.TRIGGERS_DETAIL_LINK,
      create: routes.TRIGGERS_CREATE_LINK,
    },
    users: {
      list: routes.USERS_LIST_LINK,
      detail: routes.USERS_DETAIL_LINK,
      create: routes.USERS_CREATE_LINK,
    },
  })
}

export default routesPlugin
