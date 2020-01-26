import BackendApi from '@/node_modules/@fastybird-com/io-logic/api'

export default ({ app }, inject) => {
  const baseUrl = Object.prototype.hasOwnProperty.call(app.context, 'ssrContext') ? process.env.NUXT_ENV_SERVER_API_ROOT : process.env.NUXT_ENV_CLIENT_API_ROOT

  const backendApi = new BackendApi(baseUrl, process.env.NUXT_ENV_API_KEY, process.env.NUXT_ENV_SESSION_KEY)
  // Initialize api
  backendApi.init()

  inject('backendApi', backendApi)
}
