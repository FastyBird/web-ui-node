import Vue from 'vue'
import get from 'lodash/get'

import { IO_SOCKET_TOPIC_THING } from './../../../config'

import { ApiError } from './../../../api/errors'

import ThingConfiguration from './ChannelConfigurationValue'

export default {

  actions: {

    edit({ rootGetters }, { thing_id, parameter_id, data }) {
      const thing = rootGetters['entities/thing/query']()
        .where('id', thing_id)
        .first()

      const parameter = rootGetters['entities/thing_configuration/query']()
        .where('id', parameter_id)
        .first()

      if (thing === null || parameter === null) {
        return Promise.reject()
      }

      return new Promise((resolve, reject) => {
        let topic = IO_SOCKET_TOPIC_THING
        topic = topic.replace('{thing_id}', thing.id)

        const payload = {}

        payload[parameter.name] = data

        if (parameter.isSelect && !isNaN(data)) {
          payload[parameter.name] = parseInt(data, 10)
        }

        Vue.wamp.call(topic, {
          action: 'thing.configure',
          payload,
        })
          .then(cmdResult => {
            if (get(cmdResult, 'response') === 'accepted') {
              ThingConfiguration.update({
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
          .catch(e => {
            reject(new ApiError(
              'io-server.things.sockets.failed',
              e,
              'Sending thing socket to configure failed.',
            ))
          })
      })
    },

  },

}
