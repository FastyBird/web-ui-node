const path = require('path')
const fs = require('fs')

const i18n = require('./locales')

const conf = process.env.BUILD_CONF

const confEnvPath = path.resolve(process.cwd(), `.env.${conf}`)
const defaultEnvPath = path.resolve(process.cwd(), '.env')

require('dotenv').config({
  path: fs.existsSync(confEnvPath) ? confEnvPath : defaultEnvPath,
})

const proxy = {}

if (
  Object.prototype.hasOwnProperty.call(process.env, 'NUXT_ENV_PROXY_PATH') &&
  Object.prototype.hasOwnProperty.call(process.env, 'NUXT_ENV_PROXY_TARGET')
) {
  proxy[process.env.NUXT_ENV_PROXY_PATH] = {
    target: process.env.NUXT_ENV_PROXY_TARGET,
    secure: true,
    changeOrigin: true,
  }
}

if (
  Object.prototype.hasOwnProperty.call(process.env, 'NUXT_ENV_WS_PROXY_PATH') &&
  Object.prototype.hasOwnProperty.call(process.env, 'NUXT_ENV_WS_PROXY_TARGET')
) {
  proxy[process.env.NUXT_ENV_WS_PROXY_PATH] = {
    target: process.env.NUXT_ENV_WS_PROXY_TARGET,
    pathRewrite: {
      '^/ws-exchange': '',
    },
    secure: true,
    ws: true,
    changeOrigin: true,
  }
}

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
    '@/node_modules/@fastybird-com/theme/assets/theme',
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
    '@/plugins/translate.device',
    '@/plugins/translate.channel',
    '@/plugins/translate.device.property',
    '@/plugins/translate.channel.property',
    '@/plugins/icons.channel',
    '@/plugins/icons.group',
    '@/plugins/icons.routine',
    '@/plugins/icons.thing',
    '@/plugins/wamp.client',
    '@/plugins/composition-api',
  ],

  buildModules: [
    '@nuxt/typescript-build',
  ],

  modules: [
    // '@nuxtjs/onesignal',
    // '@nuxtjs/pwa',
    '@nuxtjs/svg',
    '@nuxtjs/toast',
    '@nuxtjs/proxy',
    '@nuxtjs/device',
    '@nuxtjs/sentry',
    '@nuxtjs/date-fns',
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
          'faGlobe',
          'faHome',
          'faHotTub',
          'faInfo',
          'faKey',
          'faLightbulb',
          'faLock',
          'faMapMarkerAlt',
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

  sentry: {
    dsn: process.env.NUXT_ENV_SENTRY_DNS,
    disabled: process.env.NODE_ENV === 'development',
    config: {
      environment: process.env.NUXT_ENV_SENTRY_ENV,
    },
  },

  typescript: {
    typeCheck: {
      eslint: true,
    },
  },

}
