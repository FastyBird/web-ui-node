import Thing from '@/store/modules/io-server/Thing'
import ThingStat from '@/store/modules/io-server/ThingStat'
import ThingProperty from '@/store/modules/io-server/ThingProperty'
import ThingConfiguration from '@/store/modules/io-server/ThingConfiguration'
import ChannelPropertyValue from '@/store/modules/io-server/ChannelPropertyValue'
import ChannelConfigurationValue from '@/store/modules/io-server/ChannelConfigurationValue'

import { WAMP_TOPIC_THING } from '@/config'

const mixin = {

  methods: {

    /**
     * Connect thing to WS channels
     *
     * @param {String} id
     *
     * @private
     */
    subscribeToThingExchange(id) {
      const topic = WAMP_TOPIC_THING.replace('{thing_id}', id)

      return this.$wamp.subscribe(topic, (data) => {
        const body = JSON.parse(data)

        if (body.hasOwnProperty('thing')) {
          Thing.update({
            where: body.thing.id,
            data: {
              exchange_data_ok: true,
            },
          })

          this._parseThingExchangeData(
            body.thing,
            body.hasOwnProperty('channels') ? body.channels : [],
          )
        }
      })
        .then(() => {
          Thing.update({
            where: id,
            data: {
              exchange_subscribed: true,
            },
          })
        })
    },

    /**
     * Disconnect thing to WS channels
     *
     * @param {String} id
     *
     * @private
     */
    unsubscribeFromThingExchange(id) {
      const topic = WAMP_TOPIC_THING.replace('{thing_id}', id)

      return this.$wamp.unsubscribe(topic)
        .then(() => {
          Thing.update({
            where: id,
            data: {
              exchange_subscribed: false,
              exchange_data_ok: false,
            },
          })
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
      this._.get(thing, 'stats', [])
        .forEach(stat => {
          ThingStat.insertOrUpdate({
            where: stat.id,
            data: {
              value: stat.value,
            },
          })
        })

      this._.get(thing, 'properties', [])
        .forEach(property => {
          ThingProperty.insertOrUpdate({
            where: property.id,
            data: {
              value: property.value,
            },
          })
        })

      this._.get(thing, 'configuration', [])
        .forEach(configuration => {
          ThingConfiguration.insertOrUpdate({
            where: configuration.id,
            data: {
              value: configuration.value,
            },
          })
        })

      channels
        .forEach(channel => {
          this._.get(channel, 'properties', [])
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
            })

          this._.get(channel, 'configuration', [])
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
            })
        })
    },

  },

}

export default mixin
