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
import get from 'lodash/get'
import uniq from 'lodash/uniq'
import metadata from '@fastybird/modules-metadata/resources/schemas/auth-module/entity.account.json'
import {
  Entity,
  Type,
} from '@fastybird/modules-metadata/types/auth-module.entity.account'

import Account from '~/models/auth-module/accounts/Account'
import Email from '~/models/auth-module/emails/Email'
import Identity from '~/models/auth-module/identities/Identity'
import {
  AccountCreateInterface,
  AccountEntityTypes,
  AccountInterface,
  AccountResponseInterface,
  AccountsResponseInterface,
  AccountUpdateInterface,
  RoutingKeys,
  SemaphoreTypes,
} from '~/models/auth-module/accounts/types'

import {
  ApiError,
  OrmError,
} from '~/models/auth-module/errors'
import {
  JsonApiModelPropertiesMapper,
  JsonApiPropertiesMapper,
} from '~/models/auth-module/jsonapi'
import {
  AccountJsonModelInterface,
  ModuleOriginType,
} from '~/models/auth-module/types'

interface SemaphoreFetchingState {
  items: boolean
  item: Array<string>
}

interface SemaphoreState {
  fetching: SemaphoreFetchingState
  creating: Array<string>
  updating: Array<string>
  deleting: Array<string>
}

interface AccountState {
  semaphore: SemaphoreState
  firstLoad: boolean
}

interface SemaphoreAction {
  type: SemaphoreTypes
  id?: string
}

const jsonApiFormatter = new Jsona({
  modelPropertiesMapper: new JsonApiModelPropertiesMapper(),
  jsonPropertiesMapper: new JsonApiPropertiesMapper(),
})

const apiOptions = {
  dataTransformer: (result: AxiosResponse<AccountResponseInterface> | AxiosResponse<AccountsResponseInterface>): AccountJsonModelInterface | Array<AccountJsonModelInterface> => <AccountJsonModelInterface | Array<AccountJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const jsonSchemaValidator = new Ajv()

const moduleState: AccountState = {

  semaphore: {
    fetching: {
      items: false,
      item: [],
    },
    creating: [],
    updating: [],
    deleting: [],
  },

  firstLoad: false,

}

const moduleGetters: GetterTree<AccountState, any> = {
  firstLoadFinished: state => (): boolean => {
    return !!state.firstLoad
  },

  getting: state => (id: string): boolean => {
    return state.semaphore.fetching.item.includes(id)
  },

  fetching: state => (): boolean => {
    return !!state.semaphore.fetching.items
  },
}

const moduleActions: ActionTree<AccountState, any> = {
  async get({ state, commit }, payload: { id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.GETTING,
      id: payload.id,
    })

    try {
      await Account.api().get(
        `/auth-module/v1/accounts/${payload.id}?include=emails,identities`,
        apiOptions,
      )
    } catch (e) {
      throw new ApiError(
        'auth-module.accounts.get.failed',
        e,
        'Fetching account failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.GETTING,
        id: payload.id,
      })
    }

    return true
  },

  async fetch({ state, commit }): Promise<boolean> {
    if (state.semaphore.fetching.items) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.FETCHING,
    })

    try {
      await Account.api().get(
        '/auth-module/v1/accounts?include=emails,identities',
        apiOptions,
      )

      commit('SET_FIRST_LOAD', true)

      return true
    } catch (e) {
      throw new ApiError(
        'auth-module.accounts.fetch.failed',
        e,
        'Fetching accounts failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.FETCHING,
      })
    }
  },

  async add({ commit }, payload: { id?: string | null, draft?: boolean, data: AccountCreateInterface }): Promise<Item<Account>> {
    const id = typeof payload.id !== 'undefined' && payload.id !== null && payload.id !== '' ? payload.id : uuid.v4().toString()
    const draft = typeof payload.draft !== 'undefined' ? payload.draft : false

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.CREATING,
      id,
    })

    try {
      await Account.insert({
        data: Object.assign({}, payload.data, { id, draft }),
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      throw new OrmError(
        'auth-module.accounts.create.failed',
        e,
        'Create new account failed.',
      )
    }

    const createdEntity = Account.find(id)

    if (createdEntity === null) {
      await Account.delete(id)

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      throw new Error('auth-module.accounts.create.failed')
    }

    if (draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      return Account.find(id)
    } else {
      try {
        await Account.api().post(
          '/auth-module/v1/accounts?include=emails,identities',
          jsonApiFormatter.serialize({
            stuff: createdEntity,
          }),
          apiOptions,
        )

        return Account.find(id)
      } catch (e) {
        // Entity could not be created on api, we have to remove it from database
        await Account.delete(id)

        throw new ApiError(
          'auth-module.accounts.create.failed',
          e,
          'Create new account failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.CREATING,
          id,
        })
      }
    }
  },

  async edit({ state, commit }, payload: { account: AccountInterface, data: AccountUpdateInterface }): Promise<Item<Account>> {
    if (state.semaphore.updating.includes(payload.account.id)) {
      throw new Error('auth-module.accounts.update.inProgress')
    }

    if (!Account.query().where('id', payload.account.id).exists()) {
      throw new Error('auth-module.accounts.update.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.account.id,
    })

    try {
      await Account.update({
        where: payload.account.id,
        data: payload.data,
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.account.id,
      })

      throw new OrmError(
        'auth-module.accounts.update.failed',
        e,
        'Edit account failed.',
      )
    }

    const updatedEntity = Account.find(payload.account.id)

    if (updatedEntity === null) {
      // Updated entity could not be loaded from database
      await Account.dispatch('get', {
        id: payload.account.id,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.account.id,
      })

      throw new Error('auth-module.accounts.update.failed')
    }

    if (updatedEntity.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.account.id,
      })

      return Account.find(payload.account.id)
    } else {
      try {
        await Account.api().patch(
          `/auth-module/v1/accounts/${updatedEntity.id}?include=emails,identities`,
          jsonApiFormatter.serialize({
            stuff: updatedEntity,
          }),
          apiOptions,
        )

        return Account.find(payload.account.id)
      } catch (e) {
        // Updating entity on api failed, we need to refresh entity
        await Account.dispatch('get', {
          id: payload.account.id,
        })

        throw new ApiError(
          'auth-module.accounts.update.failed',
          e,
          'Edit account failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.UPDATING,
          id: payload.account.id,
        })
      }
    }
  },

  async save({ state, commit }, payload: { account: AccountInterface }): Promise<Item<Account>> {
    if (state.semaphore.updating.includes(payload.account.id)) {
      throw new Error('auth-module.accounts.save.inProgress')
    }

    if (!Account.query().where('id', payload.account.id).where('draft', true).exists()) {
      throw new Error('auth-module.accounts.save.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.account.id,
    })

    const entityToSave = Account.find(payload.account.id)

    if (entityToSave === null) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.account.id,
      })

      throw new Error('auth-module.accounts.save.failed')
    }

    try {
      await Account.api().post(
        '/auth-module/v1/accounts?include=emails,identities',
        jsonApiFormatter.serialize({
          stuff: entityToSave,
        }),
        apiOptions,
      )

      return Account.find(payload.account.id)
    } catch (e) {
      throw new ApiError(
        'auth-module.accounts.save.failed',
        e,
        'Save draft account failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.account.id,
      })
    }
  },

  async remove({ state, commit }, payload: { account: AccountInterface }): Promise<boolean> {
    if (state.semaphore.deleting.includes(payload.account.id)) {
      throw new Error('auth-module.accounts.delete.inProgress')
    }

    if (!Account.query().where('id', payload.account.id).exists()) {
      return true
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.DELETING,
      id: payload.account.id,
    })

    try {
      await Account.delete(payload.account.id)
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.DELETING,
        id: payload.account.id,
      })

      throw new OrmError(
        'auth-module.accounts.delete.failed',
        e,
        'Delete account failed.',
      )
    }

    if (payload.account.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.DELETING,
        id: payload.account.id,
      })

      return true
    } else {
      try {
        await Account.api().delete(
          `/auth-module/v1/accounts${payload.account.id}`,
          {
            save: false,
          },
        )

        return true
      } catch (e) {
        // Deleting entity on api failed, we need to refresh entity
        await Account.dispatch('get', {
          id: payload.account.id,
          includeChannels: false,
        })

        throw new OrmError(
          'auth-module.accounts.delete.failed',
          e,
          'Delete account failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.DELETING,
          id: payload.account.id,
        })
      }
    }
  },

  async socketData({ state, commit }, payload: { origin: string, routingKey: string, data: string }): Promise<boolean> {
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
        !Account.query().where('id', body.id).exists() &&
        (payload.routingKey === RoutingKeys.UPDATED || payload.routingKey === RoutingKeys.DELETED)
      ) {
        throw new Error('auth-module.accounts.update.failed')
      }

      if (payload.routingKey === RoutingKeys.DELETED) {
        commit('SET_SEMAPHORE', {
          type: SemaphoreTypes.DELETING,
          id: body.id,
        })

        try {
          const account = Account.query().withAll().where('id', body.id).first()

          if (account) {
            account.emails
              .forEach((email) => {
                Email.delete(email.id)
              })

            account.identities
              .forEach((identity) => {
                Identity.delete(identity.id)
              })

            await Account.delete(body.id)
          }
        } catch (e) {
          throw new OrmError(
            'auth-module.accounts.delete.failed',
            e,
            'Delete account failed.',
          )
        } finally {
          commit('CLEAR_SEMAPHORE', {
            type: SemaphoreTypes.DELETING,
            id: body.id,
          })
        }
      } else {
        if (payload.routingKey === RoutingKeys.UPDATED && state.semaphore.updating.includes(body.id)) {
          return true
        }

        commit('SET_SEMAPHORE', {
          type: payload.routingKey === RoutingKeys.UPDATED ? SemaphoreTypes.UPDATING : SemaphoreTypes.CREATING,
          id: body.id,
        })

        const entityData: { [index: string]: any } = {
          type: body.type === Type.USER ? AccountEntityTypes.USER : AccountEntityTypes.MACHINE,
        }

        Object.keys(body)
          .forEach((attrName) => {
            const kebabName = attrName.replace(/([a-z][A-Z0-9])/g, g => `${g[0]}_${g[1].toLowerCase()}`)

            if (kebabName !== 'type') {
              entityData[kebabName] = body[attrName]
            }
          })

        try {
          await Account.insertOrUpdate({
            data: entityData,
          })
        } catch (e) {
          // Updating entity on api failed, we need to refresh entity
          await Account.dispatch('get', {
            id: body.id,
          })

          throw new OrmError(
            'auth-module.accounts.update.failed',
            e,
            'Edit account failed.',
          )
        } finally {
          commit('CLEAR_SEMAPHORE', {
            type: payload.routingKey === RoutingKeys.UPDATED ? SemaphoreTypes.UPDATING : SemaphoreTypes.CREATING,
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

const moduleMutations: MutationTree<AccountState> = {
  ['SET_FIRST_LOAD'](state: AccountState, action: boolean): void {
    state.firstLoad = action
  },

  ['SET_SEMAPHORE'](state: AccountState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreTypes.FETCHING:
        state.semaphore.fetching.items = true
        break

      case SemaphoreTypes.GETTING:
        state.semaphore.fetching.item.push(get(action, 'id', 'notValid'))

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
        break

      case SemaphoreTypes.CREATING:
        state.semaphore.creating.push(get(action, 'id', 'notValid'))

        // Make all keys uniq
        state.semaphore.creating = uniq(state.semaphore.creating)
        break

      case SemaphoreTypes.UPDATING:
        state.semaphore.updating.push(get(action, 'id', 'notValid'))

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break

      case SemaphoreTypes.DELETING:
        state.semaphore.deleting.push(get(action, 'id', 'notValid'))

        // Make all keys uniq
        state.semaphore.deleting = uniq(state.semaphore.deleting)
        break
    }
  },

  ['CLEAR_SEMAPHORE'](state: AccountState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreTypes.FETCHING:
        state.semaphore.fetching.items = false
        break

      case SemaphoreTypes.GETTING:
        // Process all semaphore items
        state.semaphore.fetching.item
          .forEach((item: string, index: number): void => {
            // Find created item in reading one item semaphore...
            if (item === get(action, 'id', 'notValid')) {
              // ...and remove it
              state.semaphore.fetching.item.splice(index, 1)
            }
          })
        break

      case SemaphoreTypes.CREATING:
        // Process all semaphore items
        state.semaphore.creating
          .forEach((item: string, index: number): void => {
            // Find created item in creating semaphore...
            if (item === get(action, 'id', 'notValid')) {
              // ...and remove it
              state.semaphore.creating.splice(index, 1)
            }
          })
        break

      case SemaphoreTypes.UPDATING:
        // Process all semaphore items
        state.semaphore.updating
          .forEach((item: string, index: number): void => {
            // Find created item in creating semaphore...
            if (item === get(action, 'id', 'notValid')) {
              // ...and remove it
              state.semaphore.updating.splice(index, 1)
            }
          })
        break

      case SemaphoreTypes.DELETING:
        // Process all semaphore items
        state.semaphore.deleting
          .forEach((item: string, index: number): void => {
            // Find created item in creating semaphore...
            if (item === get(action, 'id', 'notValid')) {
              // ...and remove it
              state.semaphore.deleting.splice(index, 1)
            }
          })
        break
    }
  },

  ['RESET_STATE'](state: AccountState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): AccountState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
