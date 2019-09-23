// JSON:API formatter
import Jsona from 'jsona'
import cloneDeep from 'lodash/cloneDeep'
import uuid from 'uuid'

import api from './../../../api'
import { IO_SERVER_THING_MACHINE } from './../../../api/types'

import { ApiError } from '@/plugins/io-server/api/errors'

import {
  IO_SERVER_CLEAR_SEMAPHORE,
  IO_SERVER_SET_SEMAPHORE,
} from './../../types'

import Thing from './Thing'
import Credentials from './Credentials'
import ThingProperty from './ThingProperty'

import {
  PROPERTY_TYPE_STATE,
} from '@/constants'

const dataFormatter = new Jsona()

const initialState = {
  semaphore: {
    fetching: {
      items: false,
      item: [],
    },
    creating: [],
    updating: [],
    removing: [],
  },

  firstLoad: false,

  queue: {
    update: [],
  },
}

function mapThingResponse(item) {
  const mapped = cloneDeep(item)

  if (item.hasOwnProperty('credentials') && item.credentials !== null) {
    mapped.credentials.thing_id = item.id
    mapped.credentials.thing = {
      id: item.id,
      type: item.type,
    }
  }

  if (item.hasOwnProperty('hardware') && item.hardware !== null) {
    mapped.hardware.thing_id = item.id
    mapped.hardware.thing = {
      id: item.id,
      type: item.type,
    }
  }

  if (item.hasOwnProperty('firmware') && item.firmware !== null) {
    mapped.firmware.thing_id = item.id
    mapped.firmware.thing = {
      id: item.id,
      type: item.type,
    }
  }

  mapped.properties = []

  if (item.hasOwnProperty('properties') && item.properties.length) {
    for (const property of item.properties) {
      property.thing_id = item.id
      property.thing = {
        id: item.id,
        type: item.type,
      }

      mapped.properties.push(property)
    }
  }

  mapped.stats = []

  if (item.hasOwnProperty('stats') && item.stats.length) {
    for (const stat of item.stats) {
      stat.thing_id = item.id
      stat.thing = {
        id: item.id,
        type: item.type,
      }

      mapped.stats.push(stat)
    }
  }

  mapped.configuration = []

  if (item.hasOwnProperty('configuration') && item.configuration.length) {
    for (const config of item.configuration) {
      config.thing_id = item.id
      config.thing = {
        id: item.id,
        type: item.type,
      }

      mapped.configuration.push(config)
    }
  }

  mapped.children = []

  if (item.hasOwnProperty('children') && item.children.length) {
    for (const child of item.children) {
      child.parent_id = item.id
      child.parent = {
        id: item.id,
        type: item.type,
      }

      mapped.children.push(child)
    }
  }

  mapped.channel_ids = []

  if (item.hasOwnProperty('channels') && item.channels.length) {
    for (const channel of item.channels) {
      mapped.channel_ids.push(channel.id)
    }
  }

  return mapped
}

export default {

  state: initialState,

  getters: {

    isThingOnline: () => (id) => {
      const property = ThingProperty
        .query()
        .where('thing_id', id)
        .where('property', PROPERTY_TYPE_STATE)
        .first()

      return property !== null ? property.value === 'ready' : false
    },

  },

  actions: {

    get({ state, commit, dispatch }, { id }) {
      return new Promise((resolve, reject) => {
        if (state.semaphore.fetching.item.indexOf(id) !== -1) {
          resolve(false)
        } else {
          commit(IO_SERVER_SET_SEMAPHORE, {
            type: 'detail',
            id,
          })

          api.getThing(id)
            .then(result => {
              Thing.insertOrUpdate({
                data: mapThingResponse(dataFormatter.deserialize(result.data)),
              })
                .then(() => {
                  // Refresh emails
                  dispatch('entities/channel/fetch', {
                    thing: id,
                  }, {
                    root: true,
                  })
                    .then(() => {
                      commit(IO_SERVER_CLEAR_SEMAPHORE, {
                        type: 'detail',
                        id,
                      })
                    })
                    .catch(e => {
                      reject(new ApiError(
                        'io-server.things.fetch.failed',
                        e,
                        'Fetching things failed.',
                      ))
                    })
                })
                .catch(e => {
                  reject(new ApiError(
                    'io-server.things.get.failed',
                    e,
                    'Fetching thing detail failed.',
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
                'io-server.things.get.failed',
                e,
                'Fetching thing detail failed.',
              ))
            })
        }
      })
    },

    fetch({ state, commit, dispatch }) {
      return new Promise((resolve, reject) => {
        if (state.semaphore.fetching.items) {
          resolve(false)
        } else {
          commit(IO_SERVER_SET_SEMAPHORE, {
            type: 'list',
          })

          api.getThings()
            .then(result => {
              const insertData = []

              for (const item of dataFormatter.deserialize(result.data)) {
                insertData.push(mapThingResponse(item))
              }

              Thing.insertOrUpdate({
                data: insertData,
              })
                .then((entities) => {
                  entities.thing
                    .forEach(thing => {
                      // Refresh emails
                      dispatch('entities/channel/fetch', {
                        thing: thing.id,
                      }, {
                        root: true,
                      })
                        .catch(e => {
                          reject(new ApiError(
                            'io-server.things.fetch.failed',
                            e,
                            'Fetching things failed.',
                          ))
                        })
                    })

                  commit(IO_SERVER_CLEAR_SEMAPHORE, {
                    type: 'list',
                  })
                })
                .catch(e => {
                  reject(new ApiError(
                    'io-server.things.fetch.failed',
                    e,
                    'Fetching things failed.',
                  ))
                })

              // Entities were successfully fetched from server
              resolve(true)
            })
            .catch(e => {
              commit(IO_SERVER_CLEAR_SEMAPHORE, {
                type: 'list',
              })

              reject(new ApiError(
                'io-server.things.fetch.failed',
                e,
                'Fetching things failed.',
              ))
            })
        }
      })
    },

    add({ commit }, { data }) {
      return new Promise((resolve, reject) => {
        const id = uuid.v4()

        const jsonData = {
          data: {
            type: IO_SERVER_THING_MACHINE,
            id,
            attributes: data,
          },
        }

        Thing.insertOrUpdate({
          data: mapThingResponse(dataFormatter.deserialize(jsonData)),
        })
          .catch(e => {
            reject(new ApiError(
              'io-server.things.create.failed',
              e,
              'Create new thing failed.',
            ))
          })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'create',
          id,
        })

        api.createThing(jsonData)
          .then(result => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'create',
              id,
            })

            Thing.insertOrUpdate({
              data: mapThingResponse(dataFormatter.deserialize(result.data)),
            })
              .then(() => {
                // Entity was successfully created in database
                resolve()
              })
              .catch(e => {
                reject(new ApiError(
                  'io-server.things.create.failed',
                  e,
                  'Create new thing failed.',
                ))
              })
          })
          .catch(e => {
            Thing.delete(id)

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'create',
              id,
            })

            reject(new ApiError(
              'io-server.things.create.failed',
              e,
              'Create new thing failed.',
            ))
          })
      })
    },

    edit({ commit }, { id, data }) {
      const thing = Thing.find(id)
      const credentials = Credentials
        .query()
        .where('thing_id', thing.id)
        .first()

      return new Promise((resolve, reject) => {
        const formattedData = {}

        Object.assign(formattedData, thing)
        Object.assign(formattedData, data)

        if (data.hasOwnProperty('credentials')) {
          Object.assign(formattedData.credentials, credentials)
          Object.assign(formattedData.credentials, data.credentials)
        }

        delete formattedData.channels
        delete formattedData.parent_id
        delete formattedData.hardware
        delete formattedData.firmware
        delete formattedData.properties
        delete formattedData.stats
        delete formattedData.configuration

        const jsonData = dataFormatter.serialize({
          stuff: formattedData,
          includeNames: ['credentials', 'parent', 'children'],
        })

        Thing.insertOrUpdate({
          data: mapThingResponse(dataFormatter.deserialize(jsonData)),
        })
          .catch(e => {
            reject(new ApiError(
              'io-server.things.edit.failed',
              e,
              'Edit thing failed.',
            ))
          })

        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'edit',
          id,
        })

        api.editThing(id, jsonData)
          .then(result => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
              id,
            })

            Thing.insertOrUpdate({
              data: mapThingResponse(dataFormatter.deserialize(result.data)),
            })
              .then(() => {
                // Entity was successfully edited in database
                resolve()
              })
              .catch(e => {
                reject(new ApiError(
                  'io-server.things.edit.failed',
                  e,
                  'Edit account email failed.',
                ))
              })
          })
          .catch(e => {
            Thing.insertOrUpdate({
              data: thing,
            })

            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'edit',
              id,
            })

            reject(new ApiError(
              'io-server.things.edit.failed',
              e,
              'Edit thing failed.',
            ))
          })
      })
    },

    remove({ commit, dispatch }, { id }) {
      const thing = Thing.find(id)

      return new Promise((resolve, reject) => {
        commit(IO_SERVER_SET_SEMAPHORE, {
          type: 'delete',
          id,
        })

        Thing.delete(id)
          .catch(() => {
            reject(new Error('io-server.things.delete.failed'))
          })

        api.removeThing(id)
          .then(() => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'delete',
              id,
            })

            // Entity was successfully deleted from database
            resolve()
          })
          .catch(e => {
            commit(IO_SERVER_CLEAR_SEMAPHORE, {
              type: 'delete',
              id,
            })

            Thing.insertOrUpdate({
              data: thing,
            })
              .catch(() => {
                // Replacing backup failed, we need to refresh whole list
                dispatch('entities/thing/fetch', null, {
                  root: true,
                })
                  .catch(() => {
                    // Refreshing failed
                  })
              })

            reject(new ApiError(
              'io-server.things.delete.failed',
              e,
              'Delete thing failed.',
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
     * @param {Boolean} state.firstLoad
     * @param {Object} action
     * @param {String} action.type
     * @param {String} action.id
     */
    [IO_SERVER_SET_SEMAPHORE](state, action) {
      switch (action.type) {
        case 'list':
          state.semaphore.fetching.items = true

          state.firstLoad = true
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
          state.semaphore.fetching.items = false
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
