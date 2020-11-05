import {
  ActionTree,
  GetterTree,
  MutationTree,
} from 'vuex'
import { Item } from '@vuex-orm/core'
import Jsona from 'jsona'
// @ts-ignore
import Ajv from 'ajv'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import uniq from 'lodash/uniq'
import metadata from '@fastybird/node-metadata/resources/schemas/auth-node/entity.identity.json'
import {
  Entity,
  Type,
} from '@fastybird/node-metadata/types/auth-node.entity.identity'

import Account from '~/models/auth-node/accounts/Account'
import { AccountInterface } from '~/models/auth-node/accounts/types'
import Identity from '~/models/auth-node/identities/Identity'
import {
  IdentitiesResponseInterface,
  IdentityCreateInterface,
  IdentityEntityTypeType,
  IdentityInterface,
  IdentityResponseInterface,
  IdentityUpdateInterface,
  RoutingKeys,
  SemaphoreType,
} from '~/models/auth-node/identities/types'

import {
  ApiError,
  OrmError,
} from '~/models/auth-node/errors'
import {
  JsonApiModelPropertiesMapper,
  JsonApiPropertiesMapper,
} from '~/models/auth-node/jsonapi'
import {
  IdentityJsonModelInterface,
  ModuleOriginType,
} from '~/models/auth-node/types'

interface SemaphoreFetchingState {
  item: Array<string>
  items: Array<string>
}

interface SemaphoreState {
  fetching: SemaphoreFetchingState
  creating: Array<string>
  updating: Array<string>
  deleting: Array<string>
}

interface IdentityState {
  semaphore: SemaphoreState
  firstLoad: Array<string>
}

interface FirstLoadAction {
  id: string
}

interface SemaphoreAction {
  type: SemaphoreType
  id: string
}

const jsonApiFormatter = new Jsona({
  modelPropertiesMapper: new JsonApiModelPropertiesMapper(),
  jsonPropertiesMapper: new JsonApiPropertiesMapper(),
})

const jsonSchemaValidator = new Ajv()

const apiOptions = {
  dataTransformer: (result: AxiosResponse<IdentityResponseInterface> | AxiosResponse<IdentitiesResponseInterface>): IdentityJsonModelInterface | Array<IdentityJsonModelInterface> => <IdentityJsonModelInterface | Array<IdentityJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const moduleState: IdentityState = {

  semaphore: {
    fetching: {
      item: [],
      items: [],
    },
    creating: [],
    updating: [],
    deleting: [],
  },

  firstLoad: [],

}

const moduleGetters: GetterTree<IdentityState, any> = {
  firstLoadFinished: state => (accountId: string): boolean => {
    return state.firstLoad.includes(accountId)
  },

  getting: state => (identityId: string): boolean => {
    return state.semaphore.fetching.item.includes(identityId)
  },

  fetching: state => (accountId: string | null): boolean => {
    return accountId !== null ? state.semaphore.fetching.items.includes(accountId) : state.semaphore.fetching.items.length > 0
  },
}

const moduleActions: ActionTree<IdentityState, any> = {
  async get({ state, commit }, payload: { account: AccountInterface, id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.GETTING,
      id: payload.id,
    })

    try {
      await Identity.api().get(
        `/auth-node/v1/accounts/${payload.account.id}/identities/${payload.id}`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'auth-node.identities.get.failed',
        e,
        'Fetching identity failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.GETTING,
        id: payload.id,
      })
    }
  },

  async fetch({ state, commit }, payload: { account: AccountInterface }): Promise<boolean> {
    if (state.semaphore.fetching.items.includes(payload.account.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.FETCHING,
      id: payload.account.id,
    })

    try {
      await Identity.api().get(
        `/auth-node/v1/accounts/${payload.account.id}/identities`,
        apiOptions,
      )

      commit('SET_FIRST_LOAD', {
        id: payload.account.id,
      })

      return true
    } catch (e) {
      throw new ApiError(
        'auth-node.identities.fetch.failed',
        e,
        'Fetching identities failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.FETCHING,
        id: payload.account.id,
      })
    }
  },

  async add({ commit }, payload: { account: AccountInterface, id?: string | null, draft?: boolean, data: IdentityCreateInterface }): Promise<Item<Identity>> {
    const id = typeof payload.id !== 'undefined' && payload.id !== null && payload.id !== '' ? payload.id : uuid.v4().toString()
    const draft = typeof payload.draft !== 'undefined' ? payload.draft : false

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.CREATING,
      id,
    })

    try {
      await Identity.insert({
        data: Object.assign({}, payload.data, { id, draft, accountId: payload.account.id }),
      })
    } catch (e) {
      throw new OrmError(
        'auth-node.identities.create.failed',
        e,
        'Create new identity failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.CREATING,
        id,
      })
    }

    const createdEntity = Identity.find(id)

    if (createdEntity === null) {
      await Identity.delete(id)

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.CREATING,
        id,
      })

      throw new Error('auth-node.identities.create.failed')
    }

    if (draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.CREATING,
        id,
      })

      return Identity.find(id)
    } else {
      try {
        await Identity.api().post(
          `/auth-node/v1/accounts/${payload.account.id}/identities`,
          jsonApiFormatter.serialize({
            stuff: createdEntity,
          }),
          apiOptions,
        )

        return Identity.find(id)
      } catch (e) {
        await Identity.delete(id)

        throw new ApiError(
          'auth-node.identities.create.failed',
          e,
          'Create new identity failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreType.CREATING,
          id,
        })
      }
    }
  },

  async edit({ state, commit }, payload: { identity: IdentityInterface, data: IdentityUpdateInterface }): Promise<Item<Identity>> {
    if (state.semaphore.updating.includes(payload.identity.id)) {
      throw new Error('auth-node.identities.update.inProgress')
    }

    if (!Identity.query().where('id', payload.identity.id).exists()) {
      throw new Error('auth-node.identities.update.inProgress')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.UPDATING,
      id: payload.identity.id,
    })

    const updatedEntity = Identity.find(payload.identity.id)

    if (updatedEntity === null) {
      const account = Account.find(payload.identity.accountId)

      // Updated entity could not be loaded from database
      await Identity.dispatch('get', {
        account,
        id: payload.identity.id,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.identity.id,
      })

      throw new Error('auth-node.identities.update.failed')
    }

    if (updatedEntity.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.identity.id,
      })

      return Identity.find(payload.identity.id)
    } else {
      try {
        await Identity.api().patch(
          `/auth-node/v1/accounts/${payload.identity.accountId}/identities/${payload.identity.id}`,
          jsonApiFormatter.serialize({
            stuff: Object.assign({}, {
              type: payload.identity.type,
              id: payload.identity.id,
              password: {
                current: payload.data.password.current,
                new: payload.data.password.new,
              },
            }),
          }),
          {
            save: false,
          },
        )

        return Identity.find(payload.identity.id)
      } catch (e) {
        throw new ApiError(
          'auth-node.identities.update.failed',
          e,
          'Edit identity failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreType.UPDATING,
          id: payload.identity.id,
        })
      }
    }
  },

  async save({ state, commit }, payload: { identity: IdentityInterface }): Promise<Item<Identity>> {
    if (state.semaphore.updating.includes(payload.identity.id)) {
      throw new Error('auth-node.identities.save.inProgress')
    }

    if (!Identity.query().where('id', payload.identity.id).where('draft', true).exists()) {
      throw new Error('auth-node.identities.save.failed 1')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.UPDATING,
      id: payload.identity.id,
    })

    const entityToSave = Identity.find(payload.identity.id)

    if (entityToSave === null) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.identity.id,
      })

      throw new Error('auth-node.identities.save.failed 2')
    }

    try {
      await Identity.api().post(
        `/auth-node/v1/accounts/${entityToSave.accountId}/identities`,
        jsonApiFormatter.serialize({
          stuff: entityToSave,
        }),
        apiOptions,
      )

      return Identity.find(payload.identity.id)
    } catch (e) {
      throw new ApiError(
        'auth-node.identities.save.failed',
        e,
        'Save draft identity failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.identity.id,
      })
    }
  },

  async remove({ state, commit }, payload: { identity: IdentityInterface }): Promise<boolean> {
    if (state.semaphore.deleting.includes(payload.identity.id)) {
      throw new Error('auth-node.identities.delete.inProgress')
    }

    if (!Identity.query().where('id', payload.identity.id).exists()) {
      throw new Error('auth-node.identities.delete.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.DELETING,
      id: payload.identity.id,
    })

    try {
      await Identity.delete(payload.identity.id)
    } catch (e) {
      throw new OrmError(
        'auth-node.identities.delete.failed',
        e,
        'Delete identity failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.DELETING,
        id: payload.identity.id,
      })
    }

    if (payload.identity.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.DELETING,
        id: payload.identity.id,
      })

      return true
    } else {
      try {
        await Identity.api().delete(
          `/auth-node/v1/accounts/${payload.identity.accountId}/identities/${payload.identity.id}`,
          {
            save: false,
          },
        )

        return true
      } catch (e) {
        const account = await Account.find(payload.identity.accountId)

        // Replacing backup failed, we need to refresh whole list
        await Identity.dispatch('get', {
          account,
          id: payload.identity.id,
        })

        throw new ApiError(
          'auth-node.identities.delete.failed',
          e,
          'Delete identity failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreType.DELETING,
          id: payload.identity.id,
        })
      }
    }
  },

  async socketData({ commit }, payload: { origin: string, routingKey: string, data: string }): Promise<boolean> {
    if (payload.origin !== ModuleOriginType) {
      return false
    }

    if (!Object.values(RoutingKeys).includes(payload.routingKey as RoutingKeys)) {
      return false
    }

    const body: Entity = JSON.parse(payload.data)

    const isValid = jsonSchemaValidator.compile<Entity>(metadata)

    if (isValid(body)) {
      if (
        !Identity.query().where('id', body.id).exists() &&
        (payload.routingKey === RoutingKeys.UPDATED || payload.routingKey === RoutingKeys.DELETED)
      ) {
        throw new Error('auth-node.identities.update.failed')
      }

      if (payload.routingKey === RoutingKeys.DELETED) {
        commit('SET_SEMAPHORE', {
          type: SemaphoreType.DELETING,
          id: body.id,
        })

        try {
          await Identity.delete(body.id)
        } catch (e) {
          throw new OrmError(
            'auth-node.identities.delete.failed',
            e,
            'Delete identity failed.',
          )
        } finally {
          commit('CLEAR_SEMAPHORE', {
            type: SemaphoreType.DELETING,
            id: body.id,
          })
        }
      } else {
        commit('SET_SEMAPHORE', {
          type: payload.routingKey === RoutingKeys.UPDATED ? SemaphoreType.UPDATING : SemaphoreType.CREATING,
          id: body.id,
        })

        const entityData: { [index: string]: any } = {
          type: body.type === Type.USER ? IdentityEntityTypeType.USER : IdentityEntityTypeType.MACHINE,
        }

        Object.keys(body)
          .forEach((attrName) => {
            const kebabName = attrName.replace(/([a-z][A-Z0-9])/g, g => `${g[0]}_${g[1].toLowerCase()}`)

            if (kebabName === 'account') {
              entityData.accountId = body[attrName]
            } else {
              entityData[kebabName] = body[attrName]
            }
          })

        try {
          await Identity.insertOrUpdate({
            data: entityData,
          })
        } catch (e) {
          const account = Account.find(body.account)

          // Updating entity on api failed, we need to refresh entity
          await Identity.dispatch('get', {
            account,
            id: body.id,
          })

          throw new OrmError(
            'auth-node.identities.update.failed',
            e,
            'Edit identity failed.',
          )
        } finally {
          commit('CLEAR_SEMAPHORE', {
            type: payload.routingKey === RoutingKeys.UPDATED ? SemaphoreType.UPDATING : SemaphoreType.CREATING,
            id: body.id,
          })
        }
      }

      return true
    } else {
      return false
    }
  },

  reset({ commit }): void {
    commit('RESET_STATE')
  },
}

const moduleMutations: MutationTree<IdentityState> = {
  ['SET_FIRST_LOAD'](state: IdentityState, action: FirstLoadAction): void {
    state.firstLoad.push(action.id)

    // Make all keys uniq
    state.firstLoad = uniq(state.firstLoad)
  },

  ['SET_SEMAPHORE'](state: IdentityState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreType.GETTING:
        state.semaphore.fetching.item.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
        break

      case SemaphoreType.FETCHING:
        state.semaphore.fetching.items.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.items = uniq(state.semaphore.fetching.items)
        break

      case SemaphoreType.CREATING:
        state.semaphore.creating.push(action.id)

        // Make all keys uniq
        state.semaphore.creating = uniq(state.semaphore.creating)
        break

      case SemaphoreType.UPDATING:
        state.semaphore.updating.push(action.id)

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break

      case SemaphoreType.DELETING:
        state.semaphore.deleting.push(action.id)

        // Make all keys uniq
        state.semaphore.deleting = uniq(state.semaphore.deleting)
        break
    }
  },

  ['CLEAR_SEMAPHORE'](state: IdentityState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreType.GETTING:
        // Process all semaphore items
        state.semaphore.fetching.item
          .forEach((item: string, index: number): void => {
            // Find created item in reading one item semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.fetching.item.splice(index, 1)
            }
          })
        break

      case SemaphoreType.FETCHING:
        // Process all semaphore items
        state.semaphore.fetching.items
          .forEach((item: string, index: number): void => {
            // Find created item in reading one item semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.fetching.items.splice(index, 1)
            }
          })
        break

      case SemaphoreType.CREATING:
        // Process all semaphore items
        state.semaphore.creating
          .forEach((item: string, index: number): void => {
            // Find created item in creating semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.creating.splice(index, 1)
            }
          })
        break

      case SemaphoreType.UPDATING:
        // Process all semaphore items
        state.semaphore.updating
          .forEach((item: string, index: number): void => {
            // Find created item in creating semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.updating.splice(index, 1)
            }
          })
        break

      case SemaphoreType.DELETING:
        // Process all semaphore items
        state.semaphore.deleting
          .forEach((item: string, index: number): void => {
            // Find removed item in removing semaphore...
            if (item === action.id) {
              // ...and remove it
              state.semaphore.deleting.splice(index, 1)
            }
          })
        break
    }
  },

  ['RESET_STATE'](state: IdentityState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): IdentityState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
