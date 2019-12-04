import Thing from './Thing'

import {
  PROPERTY_TYPE_STATE,
} from '@/node_modules/@fastybird-com/io-logic/constants'

import { ModelError } from './errors'

import {
  STORE_BASE_SET_SEMAPHORE,
  STORE_BASE_CLEAR_SEMAPHORE,
  STORE_BASE_RESET_STATE,
} from '@/configuration/store'

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

export default {

  state: () => (initialState),

  getters: {

    isThingOnline: ({ rootGetters }) => (id) => {
      const thing = Thing
        .query()
        .with('device')
        .where('id', id)
        .first()

      if (thing === null) {
        return false
      }

      const property = rootGetters['entities/device_property/query']()
        .where('device_id', thing.device.id)
        .where('property', PROPERTY_TYPE_STATE)
        .first()

      return property !== null ? property.value === 'ready' : false
    },

    firstLoadFinished: (state) => () => {
      return !!state.firstLoad
    },

    getting: (state) => (id) => {
      return state.semaphore.fetching.item.indexOf(id) !== -1
    },

    fetching: (state) => () => {
      return !!state.semaphore.fetching.items
    },

  },

  actions: {

    get({ state, commit, dispatch, rootGetters }, { id }) {
      if (state.semaphore.fetching.item.indexOf(id) !== -1) {
        Promise.resolve(false)
      }

      return new Promise((resolve, reject) => {
        commit(STORE_BASE_SET_SEMAPHORE, {
          type: 'detail',
          id,
        })

        dispatch('entities/device/fetch', {
          include_channels: false,
        }, {
          root: true,
        })
          .then(() => {
            const device = rootGetters['entities/device/query']()
              .where('channel_ids', value => {
                const items = value.find(item => {
                  return item === id
                })

                return typeof items !== 'undefined'
              })
              .first()

            if (device) {
              dispatch('entities/device/get', {
                id: device.id,
              }, {
                root: true,
              })
                .then(() => {
                  const insertData = []

                  const channels = rootGetters['entities/channel/query']()
                    .where('device_id', device.id)
                    .all()

                  channels.forEach(channel => {
                    insertData.push({
                      id: channel.id,
                      device_id: device.id,
                      channel_id: channel.id,
                    })
                  })

                  Thing.insertOrUpdate({
                    data: insertData,
                  })
                    .then(() => {
                      commit(STORE_BASE_CLEAR_SEMAPHORE, {
                        type: 'detail',
                      })

                      resolve(true)
                    })
                    .catch(e => {
                      commit(STORE_BASE_CLEAR_SEMAPHORE, {
                        type: 'detail',
                      })

                      reject(new ModelError(
                        'things.fetch.failed',
                        e,
                        'Fetching things failed.',
                      ))
                    })
                })
                .catch(e => {
                  commit(STORE_BASE_CLEAR_SEMAPHORE, {
                    type: 'detail',
                    id,
                  })

                  reject(new ModelError(
                    'things.get.failed',
                    e,
                    'Fetching thing failed.',
                  ))
                })
            } else {
              resolve(true)
            }
          })
          .catch(e => {
            commit(STORE_BASE_CLEAR_SEMAPHORE, {
              type: 'detail',
              id,
            })

            reject(new ModelError(
              'things.get.failed',
              e,
              'Fetching thing failed.',
            ))
          })
      })
    },

    fetch({ state, commit, dispatch, rootGetters }) {
      if (state.semaphore.fetching.items) {
        Promise.resolve(false)
      }

      return new Promise((resolve, reject) => {
        commit(STORE_BASE_SET_SEMAPHORE, {
          type: 'list',
        })

        dispatch('entities/device/fetch', {
          include_channels: true,
        }, {
          root: true,
        })
          .then(() => {
            const devices = rootGetters['entities/device/query']()
              .all()

            const insertData = []

            devices.forEach(device => {
              const channels = rootGetters['entities/channel/query']()
                .where('device_id', device.id)
                .all()

              channels.forEach(channel => {
                insertData.push({
                  id: channel.id,
                  device_id: device.id,
                  channel_id: channel.id,
                })
              })
            })

            Thing.insertOrUpdate({
              data: insertData,
            })
              .then(() => {
                commit(STORE_BASE_CLEAR_SEMAPHORE, {
                  type: 'list',
                })

                resolve(true)
              })
              .catch(e => {
                commit(STORE_BASE_CLEAR_SEMAPHORE, {
                  type: 'list',
                })

                reject(new ModelError(
                  'things.fetch.failed',
                  e,
                  'Fetching things failed.',
                ))
              })
          })
          .catch(e => {
            commit(STORE_BASE_CLEAR_SEMAPHORE, {
              type: 'list',
            })

            reject(new ModelError(
              'things.fetch.failed',
              e,
              'Fetching things failed.',
            ))
          })
      })
    },

    reset({ commit, dispatch }) {
      commit(STORE_BASE_RESET_STATE)

      dispatch('entities/device/reset', {}, {
        root: true,
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
    [STORE_BASE_SET_SEMAPHORE](state, action) {
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
    [STORE_BASE_CLEAR_SEMAPHORE](state, action) {
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

    /**
     * Reset store to initial state
     *
     * @param {Object} state
     */
    [STORE_BASE_RESET_STATE](state) {
      Object.assign(state, initialState)
    },

  },

}
