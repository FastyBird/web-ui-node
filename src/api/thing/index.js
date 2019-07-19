import axios from 'axios'

import { API_DEFAULT_THING_ROOT, THING_DEFAULT_DEFAULT_AUTHORIZATION } from '../../config'

// Set basic headers
axios.interceptors.request.use((request) => {
  if (request.url.search(API_DEFAULT_THING_ROOT) !== -1) {
    request.headers['Content-Type'] = 'application/json'
    request.headers['Authorization'] = THING_DEFAULT_DEFAULT_AUTHORIZATION
  }

  return request
})

export default {

  getThingStatus(options) {
    return axios.get(`${API_DEFAULT_THING_ROOT }/api/status`, options)
  },

  configureThing(wifiName, wifiPassword, options) {
    const data = new FormData()

    data.append('wifi_name', wifiName)
    data.append('wifi_password', wifiPassword)

    return axios.put(`${API_DEFAULT_THING_ROOT }/api/initialize`, data, options)
  },

}
