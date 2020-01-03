const path = require('path')
const fs = require('fs')

const i18n = require('./locales')

const conf = process.env.BUILD_CONF

const confEnvPath = path.resolve(process.cwd(), `.env.${conf}`)
const defaultEnvPath = path.resolve(process.cwd(), '.env')

require('dotenv').config({
  path: fs.existsSync(confEnvPath) ? confEnvPath : defaultEnvPath,
})

// Generated session key
process.env.NUXT_ENV_SESSION_KEY = '93b448d8-8b48-4606-9d99-96c4007b856d'

module.exports = {

  mode: process.env.BUILD_TARGET === 'electron' ? 'spa' : 'universal',

  head: {
    title: 'IOT control app',
    titleTemplate: '%s | FastyBird IO server',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1.0' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
    htmlAttrs: {
      lang: 'en',
    },
  },

  loading: { color: '#fff' },

  css: [
    '@/node_modules/@fastybird-com/theme/assets/theme/theme',
    '@/node_modules/@fastybird-com/theme/assets/layout/transitions',
  ],

  plugins: [
    '@/plugins/app',
    '@/plugins/app.client',
    '@/plugins/template',
    '@/plugins/lodash',
    '@/plugins/event.bus',
    '@/plugins/io-server',
    '@/plugins/translate',
    '@/plugins/icons',
    '@/plugins/wamp.client',
  ],

  buildModules: [
    '@nuxtjs/eslint-module',
  ],

  modules: [
    //'@nuxtjs/onesignal',
    '@nuxtjs/pwa',
    '@nuxtjs/svg',
    '@nuxtjs/toast',
    '@nuxtjs/proxy',
    '@nuxtjs/device',
    '@nuxtjs/sentry',
    'cookie-universal-nuxt',
    'nuxt-validate',
    'nuxt-i18n',
    'nuxt-fontawesome',
    'vue-scrollto/nuxt',
  ],

  validate: {
    lang: 'en',
    nuxti18n: true,
  },

  toast: {
    theme: 'primary',
    position: 'bottom-center',
    duration: 5000,
    className: 'toast',
  },

  router: {
    middleware: ['session', 'account'],
  },

  i18n,

  fontawesome: {
    imports: [
      {
        set: '@fortawesome/free-solid-svg-icons',
        icons: [
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
          'faClock',
          'faCogs',
          'faCouch',
          'faCube',
          'faCubes',
          'faDesktop',
          'faEnvelope',
          'faExclamationTriangle',
          'faFan',
          'faFolder',
          'faFolderPlus',
          'faGamepad',
          'faHome',
          'faHotTub',
          'faInfo',
          'faKey',
          'faLightbulb',
          'faMapMarkerAlt',
          'faMicrophoneAlt',
          'faMinus',
          'faMobile',
          'faPencilAlt',
          'faPlug',
          'faPlus',
          'faPlusCircle',
          'faPowerOff',
          'faProjectDiagram',
          'faShower',
          'faSignOutAlt',
          'faSlidersH',
          'faStar',
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
          'faUser',
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

  proxy: {
    '/v1': {
      target: 'https://io.fastybird.ovh/api',
      secure: true,
      changeOrigin: true,
    },
    '/ws-exchange': {
      target: 'wss://io.fastybird.ovh/sockets',
      pathRewrite: {
        '^/ws-exchange': '',
      },
      secure: true,
      ws: true,
      changeOrigin: true,
    },
  },

  //oneSignal: {
  //  init: {
  //    appId: process.env.NUXT_ENV_ONE_SIGNAL,
  //    allowLocalhostAsSecureOrigin: true,
  //    welcomeNotification: {
  //      disable: true,
  //    },
  //  },
  //},

  sentry: {
    dsn: process.env.NUXT_ENV_SENTRY_DNS,
    disabled: process.env.NODE_ENV === 'development',
    config: {
      environment: process.env.NUXT_ENV_SENTRY_ENV,
    },
  },

}
