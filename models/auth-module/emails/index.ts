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
import metadata from '@fastybird/modules-metadata/resources/schemas/auth-module/entity.email.json'
import { Entity } from '@fastybird/modules-metadata/types/auth-module.entity.email'

import Account from '~/models/auth-module/accounts/Account'
import {
  AccountInterface,
} from '~/models/auth-module/accounts/types'
import Email from '~/models/auth-module/emails/Email'
import {
  EmailCreateInterface,
  EmailEntityTypes,
  EmailInterface,
  EmailResponseInterface,
  EmailsResponseInterface,
  EmailUpdateInterface,
  RoutingKeys,
  SemaphoreTypes,
} from '~/models/auth-module/emails/types'

import {
  ApiError,
  OrmError,
} from '~/models/auth-module/errors'
import {
  JsonApiModelPropertiesMapper,
  JsonApiPropertiesMapper,
} from '~/models/auth-module/jsonapi'
import {
  EmailJsonModelInterface,
  ModuleOriginType,
} from '~/models/auth-module/types'

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

interface EmailState {
  semaphore: SemaphoreState
  firstLoad: Array<string>
}

interface FirstLoadAction {
  id: string
}

interface SemaphoreAction {
  type: SemaphoreTypes
  id: string
}

const jsonApiFormatter = new Jsona({
  modelPropertiesMapper: new JsonApiModelPropertiesMapper(),
  jsonPropertiesMapper: new JsonApiPropertiesMapper(),
})

const jsonSchemaValidator = new Ajv()

const apiOptions = {
  dataTransformer: (result: AxiosResponse<EmailResponseInterface> | AxiosResponse<EmailsResponseInterface>): EmailJsonModelInterface | Array<EmailJsonModelInterface> => <EmailJsonModelInterface | Array<EmailJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const moduleState: EmailState = {

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

const moduleGetters: GetterTree<EmailState, any> = {
  firstLoadFinished: state => (accountId: string): boolean => {
    return state.firstLoad.includes(accountId)
  },

  getting: state => (emailId: string): boolean => {
    return state.semaphore.fetching.item.includes(emailId)
  },

  fetching: state => (accountId: string | null): boolean => {
    return accountId !== null ? state.semaphore.fetching.items.includes(accountId) : state.semaphore.fetching.items.length > 0
  },
}

const moduleActions: ActionTree<EmailState, any> = {
  async get({ state, commit }, payload: { account: AccountInterface, id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.GETTING,
      id: payload.id,
    })

    try {
      await Email.api().get(
        `/auth-module/v1/accounts/${payload.account.id}/emails/${payload.id}`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'auth-module.emails.get.failed',
        e,
        'Fetching email failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.GETTING,
        id: payload.id,
      })
    }
  },

  async fetch({ state, commit }, payload: { account: AccountInterface }): Promise<boolean> {
    if (state.semaphore.fetching.items.includes(payload.account.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.FETCHING,
      id: payload.account.id,
    })

    try {
      await Email.api().get(
        `/auth-module/v1/accounts/${payload.account.id}/emails`,
        apiOptions,
      )

      commit('SET_FIRST_LOAD', {
        id: payload.account.id,
      })

      return true
    } catch (e) {
      throw new ApiError(
        'auth-module.emails.fetch.failed',
        e,
        'Fetching emails failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.FETCHING,
        id: payload.account.id,
      })
    }
  },

  async add({ commit }, payload: { account: AccountInterface, id?: string | null, draft?: boolean, data: EmailCreateInterface }): Promise<Item<Email>> {
    const id = typeof payload.id !== 'undefined' && payload.id !== null && payload.id !== '' ? payload.id : uuid.v4().toString()
    const draft = typeof payload.draft !== 'undefined' ? payload.draft : false

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.CREATING,
      id,
    })

    try {
      await Email.insert({
        data: Object.assign({}, payload.data, { id, draft, accountId: payload.account.id }),
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      throw new OrmError(
        'auth-module.emails.create.failed',
        e,
        'Create new email failed.',
      )
    }

    const createdEntity = Email.find(id)

    if (createdEntity === null) {
      await Email.delete(id)

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      throw new Error('auth-module.emails.create.failed')
    }

    if (draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      return Email.find(id)
    } else {
      try {
        await Email.api().post(
          `/auth-module/v1/accounts/${payload.account.id}/emails`,
          jsonApiFormatter.serialize({
            stuff: createdEntity,
          }),
          apiOptions,
        )

        return Email.find(id)
      } catch (e) {
        // Entity could not be created on api, we have to remove it from database
        await Email.delete(id)

        throw new ApiError(
          'auth-module.emails.create.failed',
          e,
          'Create new email failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.CREATING,
          id,
        })
      }
    }
  },

  async edit({ state, commit }, payload: { email: EmailInterface, data: EmailUpdateInterface }): Promise<Item<Email>> {
    if (state.semaphore.updating.includes(payload.email.id)) {
      throw new Error('auth-module.emails.update.inProgress')
    }

    if (!Email.query().where('id', payload.email.id).exists()) {
      throw new Error('auth-module.emails.update.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.email.id,
    })

    try {
      await Email.update({
        where: payload.email.id,
        data: payload,
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.email.id,
      })

      throw new OrmError(
        'auth-module.emails.update.failed',
        e,
        'Edit email failed.',
      )
    }

    const updatedEntity = Email.find(payload.email.id)

    if (updatedEntity === null) {
      const account = Account.find(payload.email.accountId)

      // Updated entity could not be loaded from database
      await Email.dispatch('get', {
        account,
        id: payload.email.id,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.email.id,
      })

      throw new Error('auth-module.emails.update.failed')
    }

    if (updatedEntity.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.email.id,
      })

      return Email.find(payload.email.id)
    } else {
      try {
        await Email.api().patch(
          `/auth-module/v1/accounts/${updatedEntity.accountId}/emails/${updatedEntity.id}`,
          jsonApiFormatter.serialize({
            stuff: updatedEntity,
          }),
          apiOptions,
        )

        return Email.find(payload.email.id)
      } catch (e) {
        const account = Account.find(payload.email.accountId)

        // Updating entity on api failed, we need to refresh entity
        await Email.dispatch('get', {
          account,
          id: payload.email.id,
        })

        throw new ApiError(
          'auth-module.emails.update.failed',
          e,
          'Edit email failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.UPDATING,
          id: payload.email.id,
        })
      }
    }
  },

  async save({ state, commit }, payload: { email: EmailInterface }): Promise<Item<Email>> {
    if (state.semaphore.updating.includes(payload.email.id)) {
      throw new Error('auth-module.emails.save.inProgress')
    }

    if (!Email.query().where('id', payload.email.id).where('draft', true).exists()) {
      throw new Error('auth-module.emails.save.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.email.id,
    })

    const entityToSave = Email.find(payload.email.id)

    if (entityToSave === null) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.email.id,
      })

      throw new Error('auth-module.emails.save.failed')
    }

    try {
      await Email.api().post(
        `/auth-module/v1/accounts/${entityToSave.accountId}/emails`,
        jsonApiFormatter.serialize({
          stuff: entityToSave,
        }),
        apiOptions,
      )

      return Email.find(payload.email.id)
    } catch (e) {
      throw new ApiError(
        'auth-module.emails.save.failed',
        e,
        'Save draft email failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.email.id,
      })
    }
  },

  async remove({ state, commit }, payload: { email: EmailInterface }): Promise<boolean> {
    if (state.semaphore.deleting.includes(payload.email.id)) {
      throw new Error('auth-module.emails.delete.inProgress')
    }

    if (!Email.query().where('id', payload.email.id).exists()) {
      throw new Error('auth-module.emails.delete.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.DELETING,
      id: payload.email.id,
    })

    try {
      await Email.delete(payload.email.id)
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.DELETING,
        id: payload.email.id,
      })

      throw new OrmError(
        'auth-module.emails.delete.failed',
        e,
        'Delete email failed.',
      )
    }

    if (payload.email.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.DELETING,
        id: payload.email.id,
      })

      return true
    } else {
      try {
        await Email.api().delete(
          `/auth-module/v1/accounts/${payload.email.accountId}/emails/${payload.email.id}`,
          {
            save: false,
          },
        )

        return true
      } catch (e) {
        const account = await Account.find(payload.email.accountId)

        // Replacing backup failed, we need to refresh whole list
        await Email.dispatch('get', {
          account,
          id: payload.email.id,
        })

        throw new ApiError(
          'auth-module.emails.delete.failed',
          e,
          'Delete email failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.DELETING,
          id: payload.email.id,
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
        !Email.query().where('id', body.id).exists() &&
        (payload.routingKey === RoutingKeys.UPDATED || payload.routingKey === RoutingKeys.DELETED)
      ) {
        throw new Error('auth-module.emails.update.failed')
      }

      if (payload.routingKey === RoutingKeys.DELETED) {
        commit('SET_SEMAPHORE', {
          type: SemaphoreTypes.DELETING,
          id: body.id,
        })

        try {
          await Email.delete(body.id)
        } catch (e) {
          throw new OrmError(
            'auth-module.emails.delete.failed',
            e,
            'Delete email failed.',
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
          type: EmailEntityTypes.EMAIL,
        }

        Object.keys(body)
          .forEach((attrName) => {
            const kebabName = attrName.replace(/([a-z][A-Z0-9])/g, g => `${g[0]}_${g[1].toLowerCase()}`)

            if (kebabName === 'account') {
              entityData.accountId = body[attrName]
            } else if (kebabName !== 'type') {
              entityData[kebabName] = body[attrName]
            }
          })

        try {
          await Email.insertOrUpdate({
            data: entityData,
          })
        } catch (e) {
          const account = Account.find(body.account)

          // Updating entity on api failed, we need to refresh entity
          await Email.dispatch('get', {
            account,
            id: body.id,
          })

          throw new OrmError(
            'auth-module.emails.update.failed',
            e,
            'Edit email failed.',
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

const moduleMutations: MutationTree<EmailState> = {
  ['SET_FIRST_LOAD'](state: EmailState, action: FirstLoadAction): void {
    state.firstLoad.push(action.id)

    // Make all keys uniq
    state.firstLoad = uniq(state.firstLoad)
  },

  ['SET_SEMAPHORE'](state: EmailState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreTypes.GETTING:
        state.semaphore.fetching.item.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
        break

      case SemaphoreTypes.FETCHING:
        state.semaphore.fetching.items.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.items = uniq(state.semaphore.fetching.items)
        break

      case SemaphoreTypes.CREATING:
        state.semaphore.creating.push(action.id)

        // Make all keys uniq
        state.semaphore.creating = uniq(state.semaphore.creating)
        break

      case SemaphoreTypes.UPDATING:
        state.semaphore.updating.push(action.id)

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break

      case SemaphoreTypes.DELETING:
        state.semaphore.deleting.push(action.id)

        // Make all keys uniq
        state.semaphore.deleting = uniq(state.semaphore.deleting)
        break
    }
  },

  ['CLEAR_SEMAPHORE'](state: EmailState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreTypes.GETTING:
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

      case SemaphoreTypes.FETCHING:
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

      case SemaphoreTypes.CREATING:
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

      case SemaphoreTypes.UPDATING:
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

      case SemaphoreTypes.DELETING:
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

  ['RESET_STATE'](state: EmailState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): EmailState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
