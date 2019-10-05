import Vue from 'vue'
import get from 'lodash/get'

import { IO_SOCKET_TOPIC_THING } from './../../../config'

import ThingProperty from './ThingProperty'
import ThingConfiguration from './ThingConfiguration'
import ThingSocket from './ThingSocket'
import ChannelPropertyValue from './ChannelPropertyValue'
import ChannelConfigurationValue from './ChannelConfigurationValue'

/**
 * Build thing WS topic
 *
 * @param {String} thing_id
 * @param {(String|null)} channel_id
 *
 * @private
 */
function getTopic(thing_id, channel_id = null) {
  return IO_SOCKET_TOPIC_THING.replace('{thing_id}', thing_id).replace('{channel_id}', channel_id)
}

/**
 * Parse data about thing and channels received via WS
 *
 * @param {Object} thing
 * @param {Array} [channels]
 *
 * @private
 */
function parseThingExchangeData(thing, channels) {
  get(thing, 'properties', [])
    .forEach(property => {
      ThingProperty.update({
        where: property.id,
        data: {
          value: property.value,
        },
      })
        .catch(() => {
          // Nothing to do here
        })
    })

  get(thing, 'configuration', [])
    .forEach(configuration => {
      ThingConfiguration.update({
        where: configuration.id,
        data: {
          value: configuration.value,
        },
      })
        .catch(() => {
          // Nothing to do here
        })
    })

  channels
    .forEach(channel => {
      get(channel, 'properties', [])
        .forEach(property => {
          ChannelPropertyValue.insertOrUpdate({
            where: property.id + channel.id,
            data: {
              id: property.id + channel.id,
              value: property.value,

              channel_id: channel.id,
              property_id: property.id,
            },
          })
            .catch(() => {
              // Nothing to do here
            })
        })

      get(channel, 'configuration', [])
        .forEach(configuration => {
          ChannelConfigurationValue.insertOrUpdate({
            where: configuration.id + channel.id,
            data: {
              id: configuration.id + channel.id,
              value: configuration.value,

              channel_id: channel.id,
              configuration_id: configuration.id,
            },
          })
            .catch(() => {
              // Nothing to do here
            })
        })
    })
}

export default {

  getters: {

    isConnected: (getters) => (id) => {
      return getters.query().where('thing_id', id).first() !== null
    },

  },

  actions: {

    subscribe({}, { thing_id, channel_id = null }) {
      const topic = getTopic(thing_id, channel_id)

      return Vue.wamp
        .subscribe(topic, (data) => {
          const body = JSON.parse(data)

          if (body.hasOwnProperty('thing')) {
            ThingSocket.update({
              data: {
                id: body.thing.id,
                last_message: (new Date()).toISOString(),
              },
            })
              .catch(() => {
                // Nothing to do here
              })

            parseThingExchangeData(
              body.thing,
              body.hasOwnProperty('channels') ? body.channels : [],
            )
          }
        })
        .then(() => {
          ThingSocket.insertOrUpdate({
            data: {
              id: thing_id,
              connected_at: (new Date()).toISOString(),
            },
          })
            .catch(() => {
              // Nothing to do here
            })
        })
    },

    unsubscribe({}, { thing_id, channel_id = null }) {
      const topic = getTopic(thing_id, channel_id)

      return Vue.wamp
        .unsubscribe(topic)
        .then(() => {
          ThingSocket.delete(thing_id)
            .catch(() => {
              // Failed removing socket info
            })
        })
    },

  },

}
