import {
  HOME_LINK,
  THINGS_LIST_LINK,
  ROUTINES_LIST_LINK,
  USERS_LIST_LINK,
  ACCESS_RIGHTS_LIST_LINK,
} from '~/configuration/routes'

export const AUTHOR_NAME = 'FastyBird s.r.o.'
export const AUTHOR_WEBSITE = 'https://www.fastybird.com'

export const MQTT_SERVER_ADDRESS = process.env.NUXT_ENV_MQTT_SERVER_ADDRESS
export const MQTT_SERVER_PORT = process.env.NUXT_ENV_MQTT_SERVER_PORT
export const MQTT_SERVER_SECURED_PORT = process.env.NUXT_ENV_MQTT_SERVER_SECURED_PORT

export const NODE_DEVICES_ORIGIN = 'com.fastybird.devices-node'
export const NODE_STORAGE_ORIGIN = 'com.fastybird.storage-node'
export const NODE_TRIGGERS_ORIGIN = 'com.fastybird.triggers-node'

export const RABBIT_MQ_DEVICES_PROPERTIES_DATA_ROUTING_KEY = 'fb.bus.node.data.device.property'
export const RABBIT_MQ_DEVICES_CONFIGURATION_DATA_ROUTING_KEY = 'fb.bus.node.data.device.property'
export const RABBIT_MQ_CHANNELS_PROPERTIES_DATA_ROUTING_KEY = 'fb.bus.node.data.channel.property'
export const RABBIT_MQ_CHANNELS_CONFIGURATION_DATA_ROUTING_KEY = 'fb.bus.node.data.channel.property'

// WS topics
export const IO_SOCKET_TOPIC_EXCHANGE = '/io/exchange'

export const groupIcons = [
  'blender',
  'baby',
  'bath',
  'shower',
  'toilet',
  'chair',
  'couch',
  'tv',
  'gamepad',
  'hot-tub',
  'swimming-pool',
  'bed',
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
        name: 'Dashboard',
        link: HOME_LINK,
        meta: {
          icon: 'tachometer-alt',
          label: 'application.menu.dashboard',
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
        module: 'io-server',
      }, {
        name: 'Routines',
        link: ROUTINES_LIST_LINK,
        meta: {
          icon: 'project-diagram',
          label: 'application.menu.routines',
          type: 'routines',
        },
        module: 'triggers',
      },
    ],
  }, {
    name: 'Administration',
    meta: {
      label: 'application.menu.administration',
    },
    items: [
      {
        name: 'Users',
        link: USERS_LIST_LINK,
        meta: {
          icon: 'users',
          label: 'application.menu.users',
          type: 'users',
        },
        module: 'users',
      }, {
        name: 'Access settings',
        link: ACCESS_RIGHTS_LIST_LINK,
        meta: {
          icon: 'unlock',
          label: 'application.menu.access',
          type: 'access',
        },
        module: 'acl',
        items: [
          {
            name: 'Roles',
            link: HOME_LINK,
            meta: {
              label: 'application.menu.roles',
              type: 'roles',
            },
            module: 'acl',
          }, {
            name: 'Permission',
            link: HOME_LINK,
            meta: {
              label: 'application.menu.permissions',
              type: 'permissions',
            },
            module: 'acl',
          },
        ],
      },
    ],
  },
]

export const USER_MENU_ITEMS = [
  {
    name: 'Account settings',
    callback: (context) => {
      context.$store.dispatch('app/mainMenuCollapse', null, {
        root: true,
      })

      context.$bus.$emit('modal-open_account-settings', true)
    },
    meta: {
      icon: 'user',
      label: 'application.userMenu.accountSettings',
      type: 'account',
    },
  }, {
    name: 'Password change',
    callback: (context) => {
      context.$store.dispatch('app/mainMenuCollapse', null, {
        root: true,
      })

      context.$bus.$emit('modal-open_password-settings', true)
    },
    meta: {
      icon: 'lock',
      label: 'application.userMenu.passwordChange',
      type: 'account',
    },
  }, {
    name: 'Security settings',
    callback: (context) => {
      context.$store.dispatch('app/mainMenuCollapse', null, {
        root: true,
      })

      context.$bus.$emit('modal-open_security-settings', true)
    },
    meta: {
      icon: 'key',
      label: 'application.userMenu.securitySettings',
      type: 'account',
    },
  }, {
    name: 'divider',
  }, {
    name: 'Sign out',
    callback: (context) => {
      context.$store.dispatch('app/mainMenuCollapse', null, {
        root: true,
      })

      context.$bus.$emit('user_signed-out')
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
    icon: 'tachometer-alt',
    name: 'application.tabs.dashboard.title',
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
