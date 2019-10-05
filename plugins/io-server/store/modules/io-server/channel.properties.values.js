import Vue from 'vue'
import get from 'lodash/get'

import {
  DATA_TYPE_BOOLEAN,
  DATA_TYPE_ENUM,
} from './../../../constants'

import { IO_SOCKET_TOPIC_THING_CHANNEL_PROPERTY } from './../../../config'

import { ApiError } from './../../../api/errors'

import ChannelPropertyValue from './ChannelPropertyValue'

function processCommandResult(thing, channel, property, successful = true) {
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
}

async function sendCommand(value, thing, channel, property) {
  const propertyValue = ChannelPropertyValue
    .query()
    .where('channel_id', channel.id)
    .where('property_id', property.id)
    .first()

  ChannelPropertyValue.update({
    where: property.id + channel.id,
    data: {
      value,
      backup: propertyValue ? propertyValue.value : null,
      command: 'sending',
    },
  })

  let topic = IO_SOCKET_TOPIC_THING_CHANNEL_PROPERTY
  topic = topic.replace('{thing_id}', thing.id)
  topic = topic.replace('{channel_id}', channel.id)
  topic = topic.replace('{property_id}', property.id)

  Vue.wamp.call(topic, {
    action: 'channel.property',
    thing: thing.id,
    channel: channel.id,
    property: property.id,
    payload: value,
  })
    .then(cmdResult => {
      processCommandResult(thing, channel, property, get(cmdResult, 'response') === 'accepted')

      if (get(cmdResult, 'response') === 'accepted') {
        Promise.resolve()
      } else {
        Promise.reject(new ApiError(
          'io-server.channels.sockets.failed',
          null,
          'Sending channel socket to property failed.',
        ))
      }
    })
    .catch(e => {
      processCommandResult(thing, channel, property, false)

      Promise.reject(new ApiError(
        'io-server.channels.sockets.failed',
        e,
        'Sending channel socket to property failed.',
      ))
    })
}

export default {

  actions: {

    togglePayload({ getters, rootGetters }, { thing_id, channel_id, property_id }) {
      const thing = rootGetters['entities/thing/query']()
        .where('id', thing_id)
        .first()

      const channel = rootGetters['entities/channel/query']()
        .where('id', channel_id)
        .where('thing_id', thing_id)
        .first()

      const property = rootGetters['entities/channel_property/query']()
        .where('id', property_id)
        .first()

      if (thing === null || channel === null || property === null) {
        return Promise.reject()
      }

      return new Promise(() => {
        const propertySocket = getters.query()
          .where('channel_id', channel.id)
          .where('property_id', property.id)
          .first()

        let actualValue = false

        if (propertySocket) {
          if (property.data_type === DATA_TYPE_BOOLEAN) {
            actualValue = !!propertySocket.value
          } else if (property.data_type === DATA_TYPE_ENUM) {
            actualValue = propertySocket.value === 'on'
          }
        }

        let newValue = ''

        if (property.data_type === DATA_TYPE_BOOLEAN) {
          newValue = !actualValue
        } else if (property.data_type === DATA_TYPE_ENUM) {
          newValue = actualValue ? 'off' : 'on'
        }

        sendCommand(newValue, thing, channel, property)
      })
    },

    setPayload({ rootGetters }, { value, thing_id, channel_id, property_id }) {
      const thing = rootGetters['entities/thing/query']()
        .where('id', thing_id)
        .first()

      const channel = rootGetters['entities/channel/query']()
        .where('id', channel_id)
        .where('thing_id', thing_id)
        .first()

      const property = rootGetters['entities/channel_property/query']()
        .where('id', property_id)
        .first()

      if (thing === null || channel === null || property === null) {
        return Promise.reject()
      }

      return new Promise((resolve, reject) => {
        if (sendCommand(value, thing, channel, property)) {
          resolve()
        } else {
          reject(new ApiError(
            'io-server.channels.sockets.failed',
            null,
            'Sending channel socket to property failed.',
          ))
        }
      })
    },

  },

}
