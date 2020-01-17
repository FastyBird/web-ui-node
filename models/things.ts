import { GetterTree, ActionTree, MutationTree } from 'vuex'
import Thing from './Thing'

import { ModelError } from './errors'

import Device from '@/node_modules/@fastybird-com/io-logic/store/modules/io-server/Device'
// @ts-ignore
import Channel from '@/node_modules/@fastybird-com/io-logic/store/modules/io-server/Channel'

import {
  PROPERTY_TYPE_STATE,
} from '@/node_modules/@fastybird-com/io-logic/constants'

import {
  STORE_BASE_SET_SEMAPHORE,
  STORE_BASE_CLEAR_SEMAPHORE,
  STORE_BASE_RESET_STATE,
} from '@/configuration/store'

interface ThingSemaphoreState {
  fetching: {
    items: boolean,
    item: Array<string>
  }
  creating: Array<string>
  updating: Array<string>
  removing: Array<string>
}

interface ThingQueueState {
  update: Array<string>
}

interface ThingState {
  semaphore: ThingSemaphoreState;
  firstLoad: boolean;
  queue: ThingQueueState;
}

const moduleState: ThingState = {
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
};

const moduleGetters: GetterTree<ThingState, any> = {
  isThingOnline: (state, { rootGetters }) => (id: string): boolean => {
    const thing = Thing
      .query()
      .with('device')
      .where('id', id)
      .first();

    if (thing === null) {
      return false;
    }

    const property = rootGetters['entities/device_property/query']()
      .where('device_id', thing.device.id)
      .where('property', PROPERTY_TYPE_STATE)
      .first();

    return property !== null ? property.value === 'ready' : false;
  },

  firstLoadFinished: state => ():boolean => {
    return state.firstLoad
  },

  getting: state => (id:string):boolean => {
    return state.semaphore.fetching.item.includes(id)
  },

  fetching: state => ():boolean => {
    return state.semaphore.fetching.items
  },
};

const moduleActions: ActionTree<ThingState, any> = {
  get({ state, commit, dispatch, rootGetters }, payload: { id: string }):Promise<any> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      commit(STORE_BASE_SET_SEMAPHORE, {
        type: 'detail',
        id: payload.id,
      });

      dispatch('entities/device/fetch', {
        include_channels: false,
      }, {
        root: true,
      })
        .then(() => {
          const device = rootGetters['entities/device/query']()
            .where('channel_ids', (value:Array<string>) => {
              const items = value.find((item:string) => {
                return item === payload.id
              });

              return typeof items !== 'undefined'
            })
            .first();

          if (device) {
            dispatch('entities/device/get', {
              id: device.id,
            }, {
              root: true,
            })
              .then(() => {
                const insertData:any = [];

                const channels = rootGetters['entities/channel/query']()
                  .where('device_id', device.id)
                  .all();

                channels.forEach((channel:Channel) => {
                  insertData.push({
                    id: channel.id,
                    device_id: device.id,
                    channel_id: channel.id,
                  })
                });

                Thing.insertOrUpdate({
                  data: insertData,
                })
                  .then(() => {
                    commit(STORE_BASE_CLEAR_SEMAPHORE, {
                      type: 'detail',
                    });

                    resolve(true);
                  })
                  .catch((e) => {
                    commit(STORE_BASE_CLEAR_SEMAPHORE, {
                      type: 'detail',
                    });

                    reject(new ModelError(
                      'things.fetch.failed',
                      e,
                      'Fetching things failed.',
                    ));
                  })
              })
              .catch((e) => {
                commit(STORE_BASE_CLEAR_SEMAPHORE, {
                  type: 'detail',
                  id: payload.id,
                });

                reject(new ModelError(
                  'things.get.failed',
                  e,
                  'Fetching thing failed.',
                ));
              })
          } else {
            resolve(true);
          }
        })
        .catch((e) => {
          commit(STORE_BASE_CLEAR_SEMAPHORE, {
            type: 'detail',
            id: payload.id,
          });

          reject(new ModelError(
            'things.get.failed',
            e,
            'Fetching thing failed.',
          ));
        })
    })
  },

  fetch({ state, commit, dispatch, rootGetters }):Promise<any> {
    if (state.semaphore.fetching.items) {
      return Promise.resolve(false)
    }

    return new Promise((resolve, reject) => {
      commit(STORE_BASE_SET_SEMAPHORE, {
        type: 'list',
      });

      dispatch('entities/device/fetch', {
        include_channels: true,
      }, {
        root: true,
      })
        .then(() => {
          const devices = rootGetters['entities/device/query']()
            .all();

          const insertData:any = [];

          devices.forEach((device:Device) => {
            const channels = rootGetters['entities/channel/query']()
              .where('device_id', device.id)
              .all();

            channels.forEach((channel:Channel) => {
              insertData.push({
                id: channel.id,
                device_id: device.id,
                channel_id: channel.id,
              })
            })
          });

          Thing.insertOrUpdate({
            data: insertData,
          })
            .then(() => {
              commit(STORE_BASE_CLEAR_SEMAPHORE, {
                type: 'list',
              });

              resolve(true);
            })
            .catch((e) => {
              commit(STORE_BASE_CLEAR_SEMAPHORE, {
                type: 'list',
              });

              reject(new ModelError(
                'things.fetch.failed',
                e,
                'Fetching things failed.',
              ));
            })
        })
        .catch((e) => {
          commit(STORE_BASE_CLEAR_SEMAPHORE, {
            type: 'list',
          });

          reject(new ModelError(
            'things.fetch.failed',
            e,
            'Fetching things failed.',
          ));
        })
    })
  },

  reset({ commit, dispatch }):void {
    commit(STORE_BASE_RESET_STATE);

    dispatch('entities/device/reset', {}, {
      root: true,
    })
  },
};

const moduleMutations: MutationTree<ThingState> = {
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
  [STORE_BASE_SET_SEMAPHORE](state:ThingState, action:any):void {
    switch (action.type) {
      case 'list':
        state.semaphore.fetching.items = true;

        state.firstLoad = true;
        break;

      case 'detail':
        state.semaphore.fetching.item.push(action.id);
        break;

      case 'create':
        state.semaphore.creating.push(action.id);
        break;

      case 'edit':
        state.semaphore.updating.push(action.id);
        break;

      case 'remove':
        state.semaphore.removing.push(action.id);
        break;
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
  [STORE_BASE_CLEAR_SEMAPHORE](state:ThingState, action:any):void {
    switch (action.type) {
      case 'list':
        state.semaphore.fetching.items = false;
        break;

      case 'detail':
        // Process all semaphore items
        for (const key in state.semaphore.fetching.item) {
          const position = parseInt(key, 10);

          // Find fetched item in fetching semaphore...
          if (
            Object.prototype.hasOwnProperty.call(state.semaphore.fetching.item, position) &&
            state.semaphore.fetching.item[position] === action.id
          ) {
            // ...and remove it
            state.semaphore.fetching.item.splice(position, 1);
          }
        }
        break;

      case 'create':
        // Process all semaphore items
        for (const key in state.semaphore.creating) {
          const position = parseInt(key, 10);

          // Find created item in creating semaphore...
          if (
            Object.prototype.hasOwnProperty.call(state.semaphore.creating, position) &&
            state.semaphore.creating[position] === action.id
          ) {
            // ...and remove it
            state.semaphore.creating.splice(position, 1);
          }
        }
        break;

      case 'edit':
        // Process all semaphore items
        for (const key in state.semaphore.updating) {
          const position = parseInt(key, 10);

          // Find updated item in updating semaphore...
          if (
            Object.prototype.hasOwnProperty.call(state.semaphore.updating, position) &&
            state.semaphore.updating[position] === action.id
          ) {
            // ...and remove it
            state.semaphore.updating.splice(position, 1);
          }
        }
        break;

      case 'remove':
        // Process all semaphore items
        for (const key in state.semaphore.removing) {
          const position = parseInt(key, 10);

          // Find removed item in removing semaphore...
          if (
            Object.prototype.hasOwnProperty.call(state.semaphore.removing, position) &&
            state.semaphore.removing[position] === action.id
          ) {
            // ...and remove it
            state.semaphore.removing.splice(position, 1);
          }
        }
        break;
    }
  },

  /**
   * Reset store to initial state
   *
   * @param {Object} state
   */
  [STORE_BASE_RESET_STATE](state) {
    Object.assign(state, moduleState)
  },
};

export default {
  state: () => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
