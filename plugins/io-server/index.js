import api from './api'

export default ({ app }) => {
  // Configure api
  api.setApiKey(process.env.NUXT_ENV_API_KEY)
  api.setBaseURL(app.context.hasOwnProperty('ssrContext') ? process.env.NUXT_ENV_SERVER_API_ROOT : process.env.NUXT_ENV_CLIENT_API_ROOT)

  api.setSessionKey(process.env.NUXT_ENV_SESSION_KEY)
}
