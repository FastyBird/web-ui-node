import { Plugin } from '@nuxt/types'
import get from 'lodash/get'

import Device from '~/models/devices-node/Device'
import Channel from '~/models/devices-node/Channel'
import ChannelConfiguration from '~/models/devices-node/ChannelConfiguration'

import {
  IO_SOCKET_TOPIC_EXCHANGE,
  RABBIT_MQ_CHANNELS_CONFIGURATION_DATA_ROUTING_KEY,
} from '~/configuration'

declare module 'vue/types/vue' {
  interface Vue {
    $configureChannel(device_id: string, channel_id: string, parameter_id: string, data: string | number): Promise<any>
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $configureChannel(device_id: string, channel_id: string, parameter_id: string, data: string | number): Promise<any>
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $configureChannel(device_id: string, channel_id: string, parameter_id: string, data: string | number): Promise<any>
  }
}

const configureChannelPlugin: Plugin = ({ app }, inject): void => {
  inject('configureChannel', (device_id: string, channel_id: string, parameter_id: string, data: string | number): Promise<any> => {
    const device = Device
      .query()
      .where('id', device_id)
      .first()

    if (device === null) {
      return Promise.reject(new Error('device.not.found'))
    }

    const channel = Channel
      .query()
      .where('id', channel_id)
      .where('device_id', device.id)
      .first()

    if (channel === null) {
      return Promise.reject(new Error('channel.not.found'))
    }

    const parameter = ChannelConfiguration
      .query()
      .where('id', parameter_id)
      .where('channel_id', channel.id)
      .first()

    if (parameter === null) {
      return Promise.reject(new Error('parameter.not.found'))
    }

    return new Promise((resolve, reject) => {
      app.$wamp.call(IO_SOCKET_TOPIC_EXCHANGE, {
        routing_key: RABBIT_MQ_CHANNELS_CONFIGURATION_DATA_ROUTING_KEY,
        device: device.identifier,
        channel: channel.channel,
        property: parameter.name,
        expected: parameter.isSelect && typeof data === 'string' ? parseInt(data, 10) : data,
      })
        .then((result): void => {
          if (get(result, 'response') === 'accepted') {
            ChannelConfiguration.update({
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

export default configureChannelPlugin
