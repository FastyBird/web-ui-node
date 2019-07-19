import {
  HOME_LINK,
  THINGS_LIST_LINK,
  TRIGGERS_LIST_LINK,
  SCHEDULES_LIST_LINK,
} from '@/router'

export const AUTHOR_NAME = 'FastyBird s.r.o.'
export const AUTHOR_WEBSITE = 'https://www.fastybird.com'

export const APPLICATION_WEBSITE = process.env.VUE_APP_APPLICATION_WEBSITE

export const API_ROOT = process.env.VUE_APP_API_ROOT
export const API_KEY = process.env.VUE_APP_API_KEY

export const WAMP_SERVER_ADDRESS = process.env.VUE_APP_WS_SERVER
export const WAMP_TOPIC_THING = '/io/thing/{thing_id}'
export const WAMP_TOPIC_THING_CHANNEL = '/io/thing/{thing_id}/channel/{channel_id}'
export const WAMP_TOPIC_THING_CHANNEL_PROPERTY = '/io/thing/{thing_id}/channel/{channel_id}/property/{property_id}'

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
        path: HOME_LINK,
        name: 'Home',
        meta: {
          icon: 'home',
          label: 'application.menu.home',
          type: 'home',
        },
      }, {
        path: THINGS_LIST_LINK,
        name: 'Things',
        meta: {
          auth: true,
          icon: 'plug',
          label: 'application.menu.things',
          type: 'things',
        },
      }, {
        path: TRIGGERS_LIST_LINK,
        name: 'Triggers',
        meta: {
          auth: true,
          icon: 'sliders-h',
          label: 'application.menu.triggers',
          type: 'triggers',
        },
      }, {
        path: SCHEDULES_LIST_LINK,
        name: 'Schedules',
        meta: {
          auth: true,
          icon: 'calendar',
          label: 'application.menu.schedules',
          type: 'schedules',
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
      auth: true,
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
      auth: true,
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
      auth: true,
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
      auth: true,
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
      auth: true,
      icon: 'sign-out-alt',
      label: 'application.userMenu.signOut',
      type: 'account',
    },
  },
]

export const MOBILE_BOTTOM_TABS = [
  {
    type: 'home',
    name: 'application.tabs.home.title',
    icon: 'home',
    link: HOME_LINK,
  }, {
    type: 'things',
    name: 'application.tabs.things.title',
    icon: 'plug',
    link: THINGS_LIST_LINK,
  },
]
