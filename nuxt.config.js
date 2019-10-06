import uuid from 'uuid'

import i18n from './locales'

import * as path from 'path'
import * as fs from 'fs'

const env = process.env.NODE_ENV

const envPath = path.resolve(process.cwd(), `.env.${env}`)
const defaultEnvPath = path.resolve(process.cwd(), '.env')

require('dotenv').config({
  path: fs.existsSync(envPath) ? envPath : defaultEnvPath,
})

// Generate session key
process.env.NUXT_ENV_SESSION_KEY = uuid.v4()

export default {

  mode: 'universal',

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
    '@/plugins/elements',
    '@/plugins/lodash',
    '@/plugins/event.bus',
    '@/plugins/io-server',
    '@/plugins/translate',
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
    '@nuxtjs/recaptcha',
    '@nuxtjs/sentry',
    'cookie-universal-nuxt',
    'nuxt-validate',
    'nuxt-i18n',
    'nuxt-fontawesome',
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
          'faBan',
          'faCalendar',
          'faCheck',
          'faChevronRight',
          'faClock',
          'faCogs',
          'faCube',
          'faCubes',
          'faDesktop',
          'faEnvelope',
          'faExclamationTriangle',
          'faHome',
          'faInfo',
          'faKey',
          'faMapMarkerAlt',
          'faMinus',
          'faMobile',
          'faPencilAlt',
          'faPlug',
          'faPlus',
          'faPowerOff',
          'faSignOutAlt',
          'faSlidersH',
          'faSyncAlt',
          'faTachometerAlt',
          'faTimes',
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
      target: 'https://io.fastybird.ovh',
      secure: true,
      changeOrigin: true,
    },
    '/ws-exchange': {
      target: 'wss://io.fastybird.ovh/sockets',
      pathRewrite: {
        '^/ws-exchange': '',
      },
      secure: false,
      ws: true,
      changeOrigin: true,
    },
  },

  recaptcha: {
    // hideBadge: true,
    language: 'en',
    siteKey: '6LedC7wUAAAAAOiHil05tomliroggdD1d0vCRz7Q',
    version: 3,
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
