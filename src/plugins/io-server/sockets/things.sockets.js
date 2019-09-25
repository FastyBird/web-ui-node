import get from 'lodash/get'

import Thing from './../store/modules/io-server/Thing'

import ThingProperty from './../store/modules/io-server/ThingProperty'
import ThingConfiguration from './../store/modules/io-server/ThingConfiguration'

import ChannelPropertyValue from './../store/modules/io-server/ChannelPropertyValue'
import ChannelConfigurationValue from './../store/modules/io-server/ChannelConfigurationValue'

import { IO_SOCKET_TOPIC_THING } from './../config'

export default {

  getTopic(id) {
    return IO_SOCKET_TOPIC_THING.replace('{thing_id}', id)
  },

  updated(message) {
    if (message.hasOwnProperty('thing')) {
      Thing.update({
        where: message.thing.id,
        data: {
          exchange_data_ok: true,
        },
      })
        .catch(() => {
          // Nothing to do here
        })

      this._parseThingExchangeData(
        message.thing,
        message.hasOwnProperty('channels') ? message.channels : [],
      )
    }
  },

  subscribed(id) {
    Thing.update({
      where: id,
      data: {
        exchange_subscribed: true,
      },
    })
      .catch(() => {
        // Nothing to do here
      })
  },

  unsubscribed(id) {
    Thing.update({
      where: id,
      data: {
        exchange_subscribed: false,
        exchange_data_ok: false,
      },
    })
      .catch(() => {
        // Nothing to do here
      })
  },

  /**
   * Parse data about thing and channels received via WS
   *
   * @param {Object} thing
   * @param {Array} [channels]
   *
   * @private
   */
  _parseThingExchangeData(thing, channels) {
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
  },

}
