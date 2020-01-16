import api from '@/node_modules/@fastybird-com/io-logic/api'

export default ({ app }) => {
  // Configure api
  api.setApiKey(process.env.NUXT_ENV_API_KEY)
  api.setBaseURL(Object.prototype.hasOwnProperty.call(app.context, 'ssrContext') ? process.env.NUXT_ENV_SERVER_API_ROOT : process.env.NUXT_ENV_CLIENT_API_ROOT)

  api.setSessionKey(process.env.NUXT_ENV_SESSION_KEY)
}
