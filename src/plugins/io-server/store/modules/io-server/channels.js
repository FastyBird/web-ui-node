// JSON:API formatter
import Jsona from 'jsona'
import cloneDeep from 'lodash/cloneDeep'

import api from './../../../api'

import { ApiError } from '@/plugins/io-server/api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,
} from './../../types'

import Channel from './Channel'

const dataFormatter = new Jsona()

const initialState = {
  semaphore: {
    fetching: {
      items: [],
      item: [],
    },
    updating: [],
  },
}

function mapChannelResponse(item) {
  const mapped = cloneDeep(item)

  if (item.thing) {
    mapped.thing_id = item.thing.id
  }

  mapped.property_ids = []

  if (item.hasOwnProperty('properties') && item.properties.length) {
    for (const property of item.properties) {
      mapped.property_ids.push(property.id)
    }
  }

  mapped.configuration_ids = []

  if (item.hasOwnProperty('configuration') && item.configuration.length) {
    for (const config of item.configuration) {
      mapped.configuration_ids.push(config.id)
    }
  }

  mapped.schedules = []

  if (item.hasOwnProperty('schedules') && item.schedules.length) {
    for (const schedule of item.schedules) {
      schedule.channel_id = item.id
      schedule.channel = {
        id: item.id,
        type: item.type,
      }

      mapped.schedules.push(schedule)
    }
  }

  return mapped
}

export default {

  state: initialState,

  actions: {

    get({ state, commit }, { thing, id }) {
      return new Promise((resolve, reject) => {
        if (state.semaphore.fetching.item.indexOf(id) !== -1) {
          resolve(false)
        } else {
          commit(IO_SERVER_SET_SEMAPHORE, {
            type: 'detail',
            id,
          })

          api.getThingChannel(id, thing)
            .then(result => {
              Channel.insertOrUpdate({
                data: mapChannelResponse(dataFormatter.deserialize(result.data)),
              })
                .then(() => {
                  commit(IO_SERVER_CLEAR_SEMAPHORE, {
                    type: 'detail',
                    id,
                  })
                })
                .catch(e => {
                  reject(new ApiError(
                    'io-server.channels.get.failed',
                    e,
                    'Fetching channel detail failed.',
                  ))
                })

              // Entity was successfully fetched from server
              resolve(true)
            })
            .catch(e => {
              commit(IO_SERVER_CLEAR_SEMAPHORE, {
                type: 'detail',
                id,
              })

              reject(new ApiError(
                'io-server.channels.get.failed',
                e,
                'Fetching channel detail failed.',
              ))
            })
        }
      })
    },

    fetch({ state, commit }, { thing }) {
      return new Promise((resolve, reject) => {
        if (state.semaphore.fetching.items.indexOf(thing) !== -1) {
          resolve(false)
        } else {
          commit(IO_SERVER_SET_SEMAPHORE, {
            type: 'list',
            thing,
          })

          api.getThingChannels(thing)
            .then(result => {
              const insertData = []

              for (const item of dataFormatter.deserialize(result.data)) {
                insertData.push(mapChannelResponse(item))
              }

              Channel.insertOrUpdate({
                data: insertData,
              })
                .then(() => {
                  commit(IO_SERVER_CLEAR_SEMAPHORE, {
                    type: 'list',
                    thing,
                  })
                })
                .catch(e => {
                  reject(new ApiError(
                    'io-server.channels.fetch.failed',
                    e,
                    'Fetching channels failed.',
                  ))
                })

              // Entities were successfully fetched from server
              resolve(true)
            })
            .catch(e => {
              commit(IO_SERVER_CLEAR_SEMAPHORE, {
                type: 'list',
                thing,
              })

              reject(new ApiError(
                'io-server.channels.fetch.failed',
                e,
                'Fetching channels failed.',
              ))
            })
        }
      })
    },

    edit({ commit }, { id, data }) {
      const channel = Channel.find(id)

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, channel)
        Object.assign(formattedData, data)

        delete formattedData.properties
        delete formattedData.configuration

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
        })

        Channel.insertOrUpdate({
          data: mapChannelResponse(dataFormatter.deserialize(jsonData)),
        })
          .catch(e => {
            reject(new ApiError(
              'io-server.channels.edit.failed',
              e,
              'Edit thing channel failed.',
            ))
          })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'edit',
          id,
        })

        api.editThingChannel(id, channel.thing_id, jsonData)
          .then(result => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
              id,
            })

            Channel.insertOrUpdate({
              data: mapChannelResponse(dataFormatter.deserialize(result.data)),
            })
              .then(() => {
                // Entity was successfully edited in database
                resolve()
              })
              .catch(e => {
                reject(new ApiError(
                  'io-server.channels.edit.failed',
                  e,
                  'Edit thing channel failed.',
                ))
              })
          })
          .catch(e => {
            Channel.insertOrUpdate({
              data: channel,
            })

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
              id,
            })

            reject(new ApiError(
              'io-server.channels.edit.failed',
              e,
              'Edit thing channel failed.',
            ))
          })
      })
    },

  },

  mutations: {

    /**
     * Set action processing semaphore
     *
     * @param {Object} state
     * @param {Object} state.semaphore
     * @param {Object} state.semaphore.fetching
     * @param {Boolean} state.semaphore.fetching.items
     * @param {Array} state.semaphore.fetching.item
     * @param {Array} state.semaphore.creating
     * @param {Array} state.semaphore.updating
     * @param {Array} state.semaphore.removing
     * @param {Object} action
     * @param {String} action.type
     * @param {String} action.id
     * @param {String} action.thing
     */
    [IO_SERVER_SET_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'list':
          state.semaphore.fetching.items.push(action.thing)
          break

        case 'detail':
          state.semaphore.fetching.item.push(action.id)
          break

        case 'create':
          state.semaphore.creating.push(action.id)
          break

        case 'edit':
          state.semaphore.updating.push(action.id)
          break

        case 'remove':
          state.semaphore.removing.push(action.id)
          break
      }
    },

    /**
     * Reset action processing semaphore
     *
     * @param {Object} state
     * @param {Object} state.semaphore
     * @param {Object} state.semaphore.fetching
     * @param {Boolean} state.semaphore.fetching.items
     * @param {Array} state.semaphore.fetching.item
     * @param {Array} state.semaphore.creating
     * @param {Array} state.semaphore.updating
     * @param {Array} state.semaphore.removing
     * @param {Object} action
     * @param {String} action.type
     * @param {String} action.id
     */
    [IO_SERVER_CLEAR_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'list':
          // Process all semaphore items
          for (let key in state.semaphore.fetching.items) {
            key = parseInt(key, 10)

            // Find fetched item in fetching semaphore...
            if (state.semaphore.fetching.items.hasOwnProperty(key) && state.semaphore.fetching.items[key] === action.thing) {
              // ...and remove it
              state.semaphore.fetching.items.splice(key, 1)
            }
          }
          break

        case 'detail':
          // Process all semaphore items
          for (let key in state.semaphore.fetching.item) {
            key = parseInt(key, 10)

            // Find fetched item in fetching semaphore...
            if (state.semaphore.fetching.item.hasOwnProperty(key) && state.semaphore.fetching.item[key] === action.id) {
              // ...and remove it
              state.semaphore.fetching.item.splice(key, 1)
            }
          }
          break

        case 'create':
          // Process all semaphore items
          for (let key in state.semaphore.creating) {
            key = parseInt(key, 10)

            // Find created item in creating semaphore...
            if (state.semaphore.creating.hasOwnProperty(key) && state.semaphore.creating[key] === action.id) {
              // ...and remove it
              state.semaphore.creating.splice(key, 1)
            }
          }
          break

        case 'edit':
          // Process all semaphore items
          for (let key in state.semaphore.updating) {
            key = parseInt(key, 10)

            // Find updated item in updating semaphore...
            if (state.semaphore.updating.hasOwnProperty(key) && state.semaphore.updating[key] === action.id) {
              // ...and remove it
              state.semaphore.updating.splice(key, 1)
            }
          }
          break

        case 'remove':
          // Process all semaphore items
          for (let key in state.semaphore.removing) {
            key = parseInt(key, 10)

            // Find removed item in removing semaphore...
            if (state.semaphore.removing.hasOwnProperty(key) && state.semaphore.removing[key] === action.id) {
              // ...and remove it
              state.semaphore.removing.splice(key, 1)
            }
          }
          break
      }
    },

  },

}
