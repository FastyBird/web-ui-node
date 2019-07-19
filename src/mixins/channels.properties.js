import { WAMP_TOPIC_THING_CHANNEL_PROPERTY } from '@/config'

import ChannelPropertyValue from '@/store/modules/io-server/ChannelPropertyValue'

const mixin = {

  methods: {

    sendCommand(thing, channel, property, payload) {
      return new Promise((resolve) => {
        const propertyValue = ChannelPropertyValue
          .query()
          .where('channel_id', channel.id)
          .where('property_id', property.id)
          .first()

        ChannelPropertyValue.update({
          where: property.id + channel.id,
          data: {
            value: payload,
            backup: propertyValue ? propertyValue.value : null,
            command: 'sending',
          },
        })

        let topic = WAMP_TOPIC_THING_CHANNEL_PROPERTY
        topic = topic.replace('{thing_id}', thing.id)
        topic = topic.replace('{channel_id}', channel.id)
        topic = topic.replace('{property_id}', property.id)

        const value = {
          action: 'channel.property',
          thing: thing.id,
          channel: channel.id,
          property: property.id,
          payload,
        }

        resolve({
          status: true,
          message: 'Command was prepared for sending',
          topic,
          value,
        })
      })
    },

    clearCommand(thing, channel, property, successful) {
      return new Promise((resolve) => {
        const propertyValue = ChannelPropertyValue
          .query()
          .where('channel_id', channel.id)
          .where('property_id', property.id)
          .first()

        if (propertyValue !== null) {
          if (successful) {
            ChannelPropertyValue.update({
              where: property.id + channel.id,
              data: {
                backup: null,
                command: 'ok',
              },
            })
          } else {
            ChannelPropertyValue.update({
              where: property.id + channel.id,
              data: {
                value: propertyValue.backup,
                command: 'err',
              },
            })
          }

          window.setTimeout(() => {
            ChannelPropertyValue.update({
              where: property.id + channel.id,
              data: {
                command: null,
              },
            })
          }, 1000)
        }

        resolve({
          status: true,
          message: 'Command was cleared',
        })
      })
    },

  },

}

export default mixin
