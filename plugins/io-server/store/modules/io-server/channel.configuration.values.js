import Vue from 'vue'
import get from 'lodash/get'

import { IO_SOCKET_TOPIC_THING_CHANNEL } from './../../../config'

import { ApiError } from './../../../api/errors'

import ChannelConfigurationValue from './ChannelConfigurationValue'

export default {

  actions: {

    edit({ rootGetters }, { thing_id, channel_id, parameter_id, data }) {
      const thing = rootGetters['entities/thing/query']()
        .where('id', thing_id)
        .first()

      const channel = rootGetters['entities/channel/query']()
        .where('id', channel_id)
        .where('thing_id', thing_id)
        .first()

      const parameter = rootGetters['entities/channel_configuration/query']()
        .where('id', parameter_id)
        .first()

      if (thing === null || channel === null || parameter === null) {
        return Promise.reject()
      }

      return new Promise((resolve, reject) => {
        let topic = IO_SOCKET_TOPIC_THING_CHANNEL
        topic = topic.replace('{thing_id}', thing.id)
        topic = topic.replace('{channel_id}', channel.id)

        const payload = {}

        payload[parameter.name] = data

        if (parameter.isSelect && !isNaN(data)) {
          payload[parameter.name] = parseInt(data, 10)
        }

        Vue.wamp.call(topic, {
          action: 'channel.configure',
          payload,
        })
          .then(cmdResult => {
            if (get(cmdResult, 'response') === 'accepted') {
              ChannelConfigurationValue.update({
                where: parameter.id + channel.id,
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
          .catch(e => {
            reject(new ApiError(
              'io-server.channels.sockets.failed',
              e,
              'Sending channel socket to configure failed.',
            ))
          })
      })
    },

  },

}
