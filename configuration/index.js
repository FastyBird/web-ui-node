import {
  HOME_LINK,
  THINGS_LIST_LINK,
  ROUTINES_LIST_LINK,
} from '@/configuration/routes'

export const AUTHOR_NAME = 'FastyBird s.r.o.'
export const AUTHOR_WEBSITE = 'https://www.fastybird.com'

export const MQTT_SERVER_ADDRESS = process.env.VUE_APP_MQTT_SERVER_ADDRESS
export const MQTT_SERVER_PORT = '1883'
export const MQTT_SERVER_SECURED_PORT = '8883'

export const icons = [
  'thermometer',
  'lighting',
  'valve',
  'motor',
  'lock',
  'plug',
  'button',
  'humidity',
  'luminosity',
  'fan',
]

export const API_DEFAULT_THING_ROOT = 'http://192.168.4.1'
export const THING_DEFAULT_DEFAULT_AUTHORIZATION = 'Basic YWRtaW46Zmlib25hY2Np'
export const TOKEN_SECRET_STRING = 'e2d012b2ab4feb24f251c7388b3c7f311d14d92d871d81932cf7442b92d52746'

export const MENU_ITEMS = [
  {
    name: 'Application',
    meta: {
      label: 'application.menu.root',
    },
    items: [
      {
        name: 'Home',
        link: HOME_LINK,
        meta: {
          icon: 'home',
          label: 'application.menu.home',
          type: 'home',
        },
      }, {
        name: 'Things',
        link: THINGS_LIST_LINK,
        meta: {
          icon: 'plug',
          label: 'application.menu.things',
          type: 'things',
        },
      }, {
        name: 'Routines',
        link: ROUTINES_LIST_LINK,
        meta: {
          icon: 'project-diagram',
          label: 'application.menu.routines',
          type: 'routines',
        },
      },
    ],
  },
]

export const USER_MENU_ITEMS = [
  {
    name: 'Account settings',
    callback: (context) => {
      context.$store.dispatch('theme/menuCollapse', null, {
        root: true,
      })

      context.$bus.$emit('openAccountSettings', true)
    },
    meta: {
      icon: 'user',
      label: 'application.userMenu.accountSettings',
      type: 'account',
    },
  }, {
    name: 'Profile settings',
    callback: (context) => {
      context.$store.dispatch('theme/menuCollapse', null, {
        root: true,
      })

      context.$bus.$emit('openProfileSettings', true)
    },
    meta: {
      icon: 'user',
      label: 'application.userMenu.accountProfile',
      type: 'account',
    },
  }, {
    name: 'Password change',
    callback: (context) => {
      context.$store.dispatch('theme/menuCollapse', null, {
        root: true,
      })

      context.$bus.$emit('openPasswordChange', true)
    },
    meta: {
      icon: 'user',
      label: 'application.userMenu.passwordChange',
      type: 'account',
    },
  }, {
    name: 'Security settings',
    callback: (context) => {
      context.$store.dispatch('theme/menuCollapse', null, {
        root: true,
      })

      context.$bus.$emit('openSecuritySettings', true)
    },
    meta: {
      icon: 'user',
      label: 'application.userMenu.securitySettings',
      type: 'account',
    },
  }, {
    name: 'divider',
  }, {
    name: 'Sign out',
    callback: (context) => {
      context.$store.dispatch('theme/menuCollapse', null, {
        root: true,
      })

      context.$bus.$emit('signOut', true)
    },
    meta: {
      icon: 'sign-out-alt',
      label: 'application.userMenu.signOut',
      type: 'account',
    },
  },
]

export const MOBILE_BOTTOM_TABS = [
  {
    link: HOME_LINK,
    icon: 'home',
    name: 'application.tabs.home.title',
  }, {
    link: THINGS_LIST_LINK,
    icon: 'plug',
    name: 'application.tabs.things.title',
  }, {
    link: ROUTINES_LIST_LINK,
    icon: 'project-diagram',
    name: 'application.tabs.routines.title',
  },
]
