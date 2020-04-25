import { Plugin } from '@nuxt/types'
import get from 'lodash/get'

import Device from '~/models/devices-node/Device'
import DeviceConfiguration from '~/models/devices-node/DeviceConfiguration'

import {
  IO_SOCKET_TOPIC_DEVICE,
} from '~/configuration'

declare module 'vue/types/vue' {
  interface Vue {
    $configureDevice(device_id: string, parameter_id: string, data: string | number): Promise<any>
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $configureDevice(device_id: string, parameter_id: string, data: string | number): Promise<any>
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $configureDevice(device_id: string, parameter_id: string, data: string | number): Promise<any>
  }
}

const configureDevicePlugin: Plugin = ({ app }, inject): void => {
  inject('configureDevice', (device_id: string, parameter_id: string, data: string | number): Promise<any> => {
    const device = Device
      .query()
      .where('id', device_id)
      .first()

    if (device === null) {
      return Promise.reject(new Error('device.not.found'))
    }

    const parameter = DeviceConfiguration
      .query()
      .where('id', parameter_id)
      .where('device_id', device.id)
      .first()

    if (parameter === null) {
      return Promise.reject(new Error('parameter.not.found'))
    }

    return new Promise((resolve, reject) => {
      let topic = IO_SOCKET_TOPIC_DEVICE
      topic = topic.replace('{device_id}', device.id)

      const payload = {}

      Object.defineProperty(payload, parameter.name, data)

      if (parameter.isSelect && typeof data === 'string') {
        Object.defineProperty(payload, parameter.name, parseInt(data, 10))
      }

      app.$wamp.call(topic, {
        action: 'device.configure',
        payload,
      })
        .then((result): void => {
          if (get(result, 'response') === 'accepted') {
            DeviceConfiguration.update({
              where: parameter.id,
              data: {
                value: data,
              },
            })
              .catch(() => {
                // Something went wrong
              })
          } else {
            // Something went wrong
          }

          resolve()
        })
        .catch(() => {
          reject(new Error('io-server.devices.sockets.failed'))
        })
    })
  })
}

export default configureDevicePlugin
