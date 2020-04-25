import { Plugin } from '@nuxt/types'
import get from 'lodash/get'

import Device, { DeviceInterface } from '~/models/devices-node/Device'
import Channel, { ChannelInterface } from '~/models/devices-node/Channel'
import ChannelProperty, { ChannelPropertyInterface } from '~/models/devices-node/ChannelProperty'

import {
  IO_SOCKET_TOPIC_DEVICE_CHANNEL_PROPERTY,
} from '~/configuration'

declare module 'vue/types/vue' {
  interface Vue {
    $controlChannel(property: ChannelPropertyInterface, value: string): Promise<any>
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $controlChannel(property: ChannelPropertyInterface, value: string): Promise<any>
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $controlChannel(property: ChannelPropertyInterface, value: string): Promise<any>
  }
}

function processCommandResult(device: DeviceInterface, channel: ChannelInterface, property: ChannelPropertyInterface, successful: boolean = true): void {
  if (successful) {
    ChannelProperty.update({
      where: property.id,
      data: {
        backup: null,
        command: 'ok',
      },
    })
  } else {
    ChannelProperty.update({
      where: property.id,
      data: {
        value: property.backup,
        command: 'err',
      },
    })
  }

  window.setTimeout(() => {
    ChannelProperty.update({
      where: property.id,
      data: {
        command: null,
      },
    })
  }, 1000)
}

const controlChannelPlugin: Plugin = ({ app }, inject): void => {
  inject('controlChannel', (property: ChannelPropertyInterface, value: string): Promise<any> => {
    const channel = Channel
      .query()
      .where('id', property?.channel_id)
      .first()

    if (channel === null) {
      return Promise.reject(new Error('channel.not.found'))
    }

    const device = Device
      .query()
      .where('id', channel.device_id)
      .first()

    if (device === null) {
      return Promise.reject(new Error('device.not.found'))
    }

    return new Promise((resolve, reject) => {
      ChannelProperty.update({
        where: property.id,
        data: {
          value,
          backup: property ? property.value : null,
          command: 'sending',
        },
      })
        .then((): void => {
          let topic = IO_SOCKET_TOPIC_DEVICE_CHANNEL_PROPERTY
          topic = topic.replace('{device_id}', device.id)
          topic = topic.replace('{channel_id}', channel.id)
          topic = topic.replace('{property_id}', property.id)

          app.$wamp.call(topic, {
            action: 'channel.property',
            device: device.identifier,
            channel: channel.channel,
            property: property.property,
            payload: value,
          })
            .then((result): void => {
              processCommandResult(device, channel, property, get(result, 'response') === 'accepted')

              if (get(result, 'response') === 'accepted') {
                resolve()
              } else {
                reject(new Error('io-server.devices.sockets.failed'))
              }
            })
            .catch((): void => {
              processCommandResult(device, channel, property, false)

              reject(new Error('io-server.devices.sockets.failed'))
            })
        })
        .catch((): void => {
          reject(new Error('io-server.devices.sockets.failed'))
        })
    })
  })
}

export default controlChannelPlugin
