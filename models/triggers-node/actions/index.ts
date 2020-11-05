import {
  ActionTree,
  MutationTree,
} from 'vuex'
import { Item } from '@vuex-orm/core'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import uniq from 'lodash/uniq'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Action from '~/models/triggers-node/actions/Action'
import {
  ActionInterface,
  ActionResponseInterface,
  ActionsResponseInterface,
  CreateChannelPropertyActionInterface,
  CreateDevicePropertyActionInterface,
  SemaphoreType,
  UpdateChannelPropertyActionInterface,
  UpdateDevicePropertyActionInterface,
} from '~/models/triggers-node/actions/types'

import {
  ApiError,
  OrmError,
} from '~/models/triggers-node/errors'
import {
  JsonApiModelPropertiesMapper,
  JsonApiPropertiesMapper,
} from '~/models/triggers-node/jsonapi'
import {
  ActionJsonModelInterface,
} from '~/models/triggers-node/types'

interface SemaphoreFetchingState {
  items: Array<string>
  item: Array<string>
}

interface SemaphoreState {
  fetching: SemaphoreFetchingState
  creating: Array<string>
  updating: Array<string>
  deleting: Array<string>
}

interface ActionState {
  semaphore: SemaphoreState
}

interface SemaphoreAction {
  type: SemaphoreType
  id: string
}

const jsonApiFormatter = new Jsona({
  modelPropertiesMapper: new JsonApiModelPropertiesMapper(),
  jsonPropertiesMapper: new JsonApiPropertiesMapper(),
})

const apiOptions = {
  dataTransformer: (result: AxiosResponse<ActionResponseInterface> | AxiosResponse<ActionsResponseInterface>): ActionJsonModelInterface | Array<ActionJsonModelInterface> => <ActionJsonModelInterface | Array<ActionJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const moduleState: ActionState = {

  semaphore: {
    fetching: {
      items: [],
      item: [],
    },
    creating: [],
    updating: [],
    deleting: [],
  },

}

const moduleActions: ActionTree<ActionState, any> = {
  async get({ state, commit }, payload: { trigger: TriggerInterface, id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.GETTING,
      id: payload.id,
    })

    try {
      await Action.api().get(
        `/triggers-node/v1/triggers/${payload.trigger.id}/actions/${payload.id}`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'triggers-node.actions.get.failed',
        e,
        'Fetching action failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.GETTING,
        id: payload.id,
      })
    }
  },

  async add({ commit }, payload: { trigger: TriggerInterface, id?: string | null, draft?: boolean, data: CreateDevicePropertyActionInterface | CreateChannelPropertyActionInterface }): Promise<Item<Action>> {
    const id = typeof payload.id !== 'undefined' && payload.id !== null && payload.id !== '' ? payload.id : uuid.v4().toString()
    const draft = typeof payload.draft !== 'undefined' ? payload.draft : false

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.CREATING,
      id,
    })

    try {
      await Action.insert({
        data: Object.assign({}, payload.data, { id, draft, triggerId: payload.trigger.id }),
      })
    } catch (e) {
      throw new OrmError(
        'triggers-node.actions.create.failed',
        e,
        'Create new action failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.CREATING,
        id,
      })
    }

    const createdEntity = Action.find(id)

    if (createdEntity === null) {
      await Action.delete(id)

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.CREATING,
        id,
      })

      throw new Error('triggers-node.actions.create.failed')
    }

    if (draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.CREATING,
        id,
      })

      return Action.find(id)
    } else {
      try {
        await Action.api().post(
          `/triggers-node/v1/triggers/${payload.trigger.id}/actions`,
          jsonApiFormatter.serialize({
            stuff: createdEntity,
          }),
          apiOptions,
        )

        return Action.find(id)
      } catch (e) {
        // Entity could not be created on api, we have to remove it from database
        await Action.delete(id)

        throw new ApiError(
          'triggers-node.actions.create.failed',
          e,
          'Create new action failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreType.CREATING,
          id,
        })
      }
    }
  },

  async edit({ state, commit }, payload: { action: ActionInterface, data: UpdateDevicePropertyActionInterface | UpdateChannelPropertyActionInterface }): Promise<Item<Action>> {
    if (state.semaphore.updating.includes(payload.action.id)) {
      throw new Error('triggers-node.actions.update.inProgress')
    }

    if (!Action.query().where('id', payload.action.id).exists()) {
      throw new Error('triggers-node.actions.update.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.UPDATING,
      id: payload.action.id,
    })

    try {
      await Action.update({
        where: payload.action.id,
        data: payload.data,
      })
    } catch (e) {
      throw new OrmError(
        'triggers-node.actions.update.failed',
        e,
        'Edit action failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.action.id,
      })
    }

    const updatedEntity = Action.find(payload.action.id)

    if (updatedEntity === null) {
      const trigger = Trigger.find(payload.action.triggerId)

      // Updated entity could not be loaded from database
      await Action.dispatch('get', {
        trigger,
        id: payload.action.id,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.action.id,
      })

      throw new Error('triggers-node.actions.update.failed')
    }

    if (updatedEntity.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.action.id,
      })

      return Action.find(payload.action.id)
    } else {
      try {
        await Action.api().patch(
          `/triggers-node/v1/triggers/${updatedEntity.triggerId}/actions/${updatedEntity.id}`,
          jsonApiFormatter.serialize({
            stuff: updatedEntity,
          }),
          apiOptions,
        )

        return Action.find(payload.action.id)
      } catch (e) {
        const trigger = Trigger.find(payload.action.triggerId)

        // Updating entity on api failed, we need to refresh entity
        await Action.dispatch('get', {
          trigger,
          id: payload.action.id,
        })

        throw new ApiError(
          'triggers-node.actions.update.failed',
          e,
          'Edit action failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreType.UPDATING,
          id: payload.action.id,
        })
      }
    }
  },

  async save({ state, commit }, payload: { action: ActionInterface }): Promise<Item<Action>> {
    if (state.semaphore.updating.includes(payload.action.id)) {
      throw new Error('triggers-node.actions.save.inProgress')
    }

    if (!Action.query().where('id', payload.action.id).where('draft', true).exists()) {
      throw new Error('triggers-node.actions.save.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.UPDATING,
      id: payload.action.id,
    })

    const entityToSave = Action.find(payload.action.id)

    if (entityToSave === null) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.action.id,
      })

      throw new Error('triggers-node.actions.save.failed')
    }

    try {
      await Action.api().post(
        `/triggers-node/v1/triggers/${entityToSave.triggerId}/actions`,
        jsonApiFormatter.serialize({
          stuff: entityToSave,
        }),
        apiOptions,
      )

      return Action.find(payload.action.id)
    } catch (e) {
      throw new ApiError(
        'triggers-node.actions.save.failed',
        e,
        'Save draft action failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.action.id,
      })
    }
  },

  async remove({ state, commit }, payload: { action: ActionInterface }): Promise<boolean> {
    if (state.semaphore.deleting.includes(payload.action.id)) {
      throw new Error('triggers-node.actions.delete.inProgress')
    }

    if (!Action.query().where('id', payload.action.id).exists()) {
      throw new Error('triggers-node.actions.delete.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.DELETING,
      id: payload.action.id,
    })

    try {
      await Action.delete(payload.action.id)
    } catch (e) {
      throw new OrmError(
        'triggers-node.actions.delete.failed',
        e,
        'Delete action failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.DELETING,
        id: payload.action.id,
      })
    }

    if (payload.action.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.DELETING,
        id: payload.action.id,
      })

      return true
    } else {
      try {
        await Action.api().delete(
          `/triggers-node/v1/triggers/${payload.action.triggerId}/actions/${payload.action.id}`,
          {
            save: false,
          },
        )

        return true
      } catch (e) {
        const trigger = await Trigger.find(payload.action.triggerId)

        // Replacing backup failed, we need to refresh whole list
        await Action.dispatch('get', {
          trigger,
          id: payload.action.id,
        })

        throw new ApiError(
          'triggers-node.actions.delete.failed',
          e,
          'Delete action failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreType.DELETING,
          id: payload.action.id,
        })
      }
    }
  },

  reset({ commit }): void {
    commit('RESET_STATE')
  },
}

const moduleMutations: MutationTree<ActionState> = {
  ['SET_SEMAPHORE'](state: ActionState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreType.FETCHING:
        state.semaphore.fetching.items.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.items = uniq(state.semaphore.fetching.items)
        break

      case SemaphoreType.GETTING:
        state.semaphore.fetching.item.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
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

  ['CLEAR_SEMAPHORE'](state: ActionState, action: SemaphoreAction): void {
    switch (action.type) {
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

  ['RESET_STATE'](state: ActionState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): ActionState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
