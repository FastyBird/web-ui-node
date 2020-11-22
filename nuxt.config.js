const path = require('path')
const fs = require('fs')
const get = require('lodash/get')

const i18n = require('./locales')

const envFile = path.resolve(process.cwd(), '.env')

// Import env vars
if (fs.existsSync(envFile)) {
  require('dotenv').config({
    path: envFile,
  })
}

const modules = [
  // '@nuxtjs/onesignal',
  // '@nuxtjs/pwa',
  '@nuxtjs/svg',
  '@nuxtjs/toast',
  '@nuxtjs/proxy',
  '@nuxtjs/device',
  '@nuxtjs/date-fns',
  'cookie-universal-nuxt',
  'nuxt-i18n',
  'nuxt-fontawesome',
  '@fastybird/vue-wamp-v1/@nuxt',
]

const proxy = {}

if (Object.prototype.hasOwnProperty.call(process.env, 'NUXT_ENV_API_TARGET')) {
  proxy['/api'] = {
    target: process.env.NUXT_ENV_API_TARGET,
    pathRewrite: {
      '^/api': '', // Remove base path
    },
    secure: true,
    changeOrigin: true,
    headers: {
      'X-Api-Key': process.env.NUXT_ENV_API_KEY,
    },
  }
}

if (Object.prototype.hasOwnProperty.call(process.env, 'NUXT_ENV_WS_TARGET')) {
  proxy['/ws-exchange'] = {
    target: process.env.NUXT_ENV_WS_TARGET,
    pathRewrite: {
      '^/ws-exchange': '',
    },
    secure: true,
    changeOrigin: true,
    ws: true,
    onProxyReqWs: (proxyReq, req) => {
      get(req, 'headers.cookie', '')
        .split(';')
        .forEach((item) => {
          const row = item.trim().split('=')

          if (get(row, '[0]') === 'token') {
            proxyReq.setHeader('Authorization', `Bearer ${get(row, '[1]')}`)
          }
        })

      proxyReq.setHeader('X-Ws-Key', process.env.NUXT_ENV_WS_KEY)
    },
  }
}

const sentry = {}

if (Object.prototype.hasOwnProperty.call(process.env, 'NUXT_ENV_SENTRY_DSN')) {
  modules.push('@nuxtjs/sentry')

  Object.assign(sentry, {
    dsn: process.env.NUXT_ENV_SENTRY_DSN,
    config: {
      environment: Object.prototype.hasOwnProperty.call(process.env, 'NUXT_ENV_SENTRY_ENV') ? process.env.NUXT_ENV_SENTRY_ENV : process.env.NODE_ENV,
    },
  })
}

module.exports = {

  mode: process.env.BUILD_TARGET === 'electron' ? 'spa' : 'universal',

  head: {
    title: 'IOT control app',
    titleTemplate: '%s | FastyBird IO server',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width,initial-scale=1.0',
      },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
    htmlAttrs: {
      lang: 'en',
    },
  },

  loading: { color: '#fff' },

  css: [
    '@/node_modules/@fastybird/web-ui-theme/src/assets/theme',
    '@/node_modules/pretty-checkbox/src/pretty-checkbox',
    '@/node_modules/vue-swipe-actions/dist/vue-swipe-actions',
    '@/assets/scss/toaster',
  ],

  plugins: [
    '@/plugins/app',
    '@/plugins/app.client',
    '@/plugins/routes',
    '@/plugins/flash-messages',
    '@/plugins/lodash',
    '@/plugins/event.bus',
    '@/plugins/backend',
    '@/plugins/icons.group',
    '@/plugins/vuex-orm-axios',
    '@/plugins/window-size',
    {
      src: '@/plugins/vuex-orm-wamp',
      mode: 'client',
    },
  ],

  buildModules: [
    '@nuxt/typescript-build',
  ],

  modules,

  wamp: {
    wsuri: 'ws://localhost:3000/ws-exchange',
    debug: true,
  },

  toast: {
    theme: 'primary',
    position: 'bottom-center',
    duration: 5000,
    className: 'toast',
  },

  router: {
    middleware: ['session', 'account', 'router'],
  },

  i18n,

  fontawesome: {
    imports: [
      {
        set: '@fortawesome/free-solid-svg-icons',
        icons: [
          'faAddressCard',
          'faAngleLeft',
          'faAngleRight',
          'faArrowLeft',
          'faArrowRight',
          'faBaby',
          'faBan',
          'faBath',
          'faBed',
          'faBlender',
          'faBolt',
          'faCalculator',
          'faCalendar',
          'faChair',
          'faChartBar',
          'faChartLine',
          'faCheck',
          'faCheckCircle',
          'faChevronRight',
          'faClipboard',
          'faClock',
          'faCog',
          'faCogs',
          'faCouch',
          'faCube',
          'faCubes',
          'faDesktop',
          'faEllipsisV',
          'faEllipsisH',
          'faEnvelope',
          'faExclamationTriangle',
          'faFan',
          'faFolder',
          'faFolderPlus',
          'faGamepad',
          'faGlobe',
          'faHome',
          'faHotTub',
          'faInfo',
          'faKey',
          'faLightbulb',
          'faLock',
          'faMagic',
          'faMapMarkerAlt',
          'faMicrochip',
          'faMicrophoneAlt',
          'faMinus',
          'faMinusCircle',
          'faMobile',
          'faPencilAlt',
          'faPlug',
          'faPlus',
          'faPlusCircle',
          'faPowerOff',
          'faProjectDiagram',
          'faRobot',
          'faSatelliteDish',
          'faSearch',
          'faShower',
          'faSignOutAlt',
          'faSlidersH',
          'faStar',
          'faStopCircle',
          'faSun',
          'faSyncAlt',
          'faSwimmingPool',
          'faTableTennis',
          'faTachometerAlt',
          'faThermometerHalf',
          'faTrashAlt',
          'faTimes',
          'faTint',
          'faToggleOn',
          'faToilet',
          'faTv',
          'faTrash',
          'faUnlock',
          'faUser',
          'faUsers',
          'faUserShield',
          'faWifi',
          'faWindowClose',
        ],
      }, {
        set: '@fortawesome/free-brands-svg-icons',
        icons: [
          'faFacebook',
          'faGithub',
          'faTwitter',
        ],
      },
    ],
  },

  proxy,

  // oneSignal: {
  //  init: {
  //    appId: process.env.NUXT_ENV_ONE_SIGNAL,
  //    allowLocalhostAsSecureOrigin: true,
  //    welcomeNotification: {
  //      disable: true,
  //    },
  //  },
  // },

  sentry,

  typescript: {
    typeCheck: {
      eslint: true,
    },
  },

}
