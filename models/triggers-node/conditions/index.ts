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
import Condition from '~/models/triggers-node/conditions/Condition'
import {
  ConditionInterface,
  ConditionResponseInterface,
  ConditionsResponseInterface,
  CreateChannelPropertyConditionInterface,
  CreateDateConditionInterface,
  CreateDevicePropertyConditionInterface,
  CreateTimeConditionInterface,
  SemaphoreTypes,
  UpdateChannelPropertyConditionInterface,
  UpdateDateConditionInterface,
  UpdateDevicePropertyConditionInterface,
  UpdateTimeConditionInterface,
} from '~/models/triggers-node/conditions/types'

import {
  ApiError,
  OrmError,
} from '~/models/triggers-node/errors'
import {
  JsonApiModelPropertiesMapper,
  JsonApiPropertiesMapper,
} from '~/models/triggers-node/jsonapi'
import {
  ConditionJsonModelInterface,
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

interface ConditionState {
  semaphore: SemaphoreState
}

interface SemaphoreCondition {
  type: SemaphoreTypes
  id: string
}

const jsonApiFormatter = new Jsona({
  modelPropertiesMapper: new JsonApiModelPropertiesMapper(),
  jsonPropertiesMapper: new JsonApiPropertiesMapper(),
})

const apiOptions = {
  dataTransformer: (result: AxiosResponse<ConditionResponseInterface> | AxiosResponse<ConditionsResponseInterface>): ConditionJsonModelInterface | Array<ConditionJsonModelInterface> => <ConditionJsonModelInterface | Array<ConditionJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const moduleState: ConditionState = {

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

const moduleActions: ActionTree<ConditionState, any> = {
  async get({ state, commit }, payload: { trigger: TriggerInterface, id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.GETTING,
      id: payload.id,
    })

    try {
      await Condition.api().get(
        `/triggers-node/v1/triggers/${payload.trigger.id}/conditions/${payload.id}`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'triggers-node.conditions.get.failed',
        e,
        'Fetching condition failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.GETTING,
        id: payload.id,
      })
    }
  },

  async add({ commit }, payload: { trigger: TriggerInterface, id?: string | null, draft?: boolean, data: CreateDevicePropertyConditionInterface | CreateChannelPropertyConditionInterface | CreateDateConditionInterface | CreateTimeConditionInterface }): Promise<Item<Condition>> {
    const id = typeof payload.id !== 'undefined' && payload.id !== null && payload.id !== '' ? payload.id : uuid.v4().toString()
    const draft = typeof payload.draft !== 'undefined' ? payload.draft : false

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.CREATING,
      id,
    })

    try {
      await Condition.insert({
        data: Object.assign({}, payload.data, { id, draft, triggerId: payload.trigger.id }),
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      throw new OrmError(
        'triggers-node.conditions.create.failed',
        e,
        'Create new condition failed.',
      )
    }

    const createdEntity = Condition.find(id)

    if (createdEntity === null) {
      await Condition.delete(id)

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      throw new Error('triggers-node.conditions.create.failed')
    }

    if (draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      return Condition.find(id)
    } else {
      try {
        await Condition.api().post(
          `/triggers-node/v1/triggers/${payload.trigger.id}/conditions`,
          jsonApiFormatter.serialize({
            stuff: createdEntity,
          }),
          apiOptions,
        )

        return Condition.find(id)
      } catch (e) {
        // Entity could not be created on api, we have to remove it from database
        await Condition.delete(id)

        throw new ApiError(
          'triggers-node.conditions.create.failed',
          e,
          'Create new condition failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.CREATING,
          id,
        })
      }
    }
  },

  async edit({ state, commit }, payload: { condition: ConditionInterface, data: UpdateDevicePropertyConditionInterface | UpdateChannelPropertyConditionInterface | UpdateDateConditionInterface | UpdateTimeConditionInterface }): Promise<Item<Condition>> {
    if (state.semaphore.updating.includes(payload.condition.id)) {
      throw new Error('triggers-node.conditions.update.inProgress')
    }

    if (!Condition.query().where('id', payload.condition.id).exists()) {
      throw new Error('triggers-node.conditions.update.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.condition.id,
    })

    try {
      await Condition.update({
        where: payload.condition.id,
        data: payload.data,
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.condition.id,
      })

      throw new OrmError(
        'triggers-node.conditions.update.failed',
        e,
        'Edit condition failed.',
      )
    }

    const updatedEntity = Condition.find(payload.condition.id)

    if (updatedEntity === null) {
      const trigger = Trigger.find(payload.condition.triggerId)

      // Updated entity could not be loaded from database
      await Condition.dispatch('get', {
        trigger,
        id: payload.condition.id,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.condition.id,
      })

      throw new Error('triggers-node.conditions.update.failed')
    }

    if (updatedEntity.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.condition.id,
      })

      return Condition.find(payload.condition.id)
    } else {
      try {
        await Condition.api().patch(
          `/triggers-node/v1/triggers/${updatedEntity.triggerId}/conditions/${updatedEntity.id}`,
          jsonApiFormatter.serialize({
            stuff: updatedEntity,
          }),
          apiOptions,
        )

        return Condition.find(payload.condition.id)
      } catch (e) {
        const trigger = Trigger.find(payload.condition.triggerId)

        // Updating entity on api failed, we need to refresh entity
        await Condition.dispatch('get', {
          trigger,
          id: payload.condition.id,
        })

        throw new ApiError(
          'triggers-node.conditions.update.failed',
          e,
          'Edit condition failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.UPDATING,
          id: payload.condition.id,
        })
      }
    }
  },

  async save({ state, commit }, payload: { condition: ConditionInterface }): Promise<Item<Condition>> {
    if (state.semaphore.updating.includes(payload.condition.id)) {
      throw new Error('triggers-node.conditions.save.inProgress')
    }

    if (!Condition.query().where('id', payload.condition.id).where('draft', true).exists()) {
      throw new Error('triggers-node.conditions.save.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.condition.id,
    })

    const entityToSave = Condition.find(payload.condition.id)

    if (entityToSave === null) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.condition.id,
      })

      throw new Error('triggers-node.conditions.save.failed')
    }

    try {
      await Condition.api().post(
        `/triggers-node/v1/triggers/${entityToSave.triggerId}/conditions`,
        jsonApiFormatter.serialize({
          stuff: entityToSave,
        }),
        apiOptions,
      )

      return Condition.find(payload.condition.id)
    } catch (e) {
      throw new ApiError(
        'triggers-node.conditions.save.failed',
        e,
        'Save draft condition failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.condition.id,
      })
    }
  },

  async remove({ state, commit }, payload: { condition: ConditionInterface }): Promise<boolean> {
    if (state.semaphore.deleting.includes(payload.condition.id)) {
      throw new Error('triggers-node.conditions.delete.inProgress')
    }

    if (!Condition.query().where('id', payload.condition.id).exists()) {
      throw new Error('triggers-node.conditions.delete.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.DELETING,
      id: payload.condition.id,
    })

    try {
      await Condition.delete(payload.condition.id)
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.DELETING,
        id: payload.condition.id,
      })

      throw new OrmError(
        'triggers-node.conditions.delete.failed',
        e,
        'Delete condition failed.',
      )
    }

    if (payload.condition.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.DELETING,
        id: payload.condition.id,
      })

      return true
    } else {
      try {
        await Condition.api().delete(
          `/triggers-node/v1/triggers/${payload.condition.triggerId}/conditions/${payload.condition.id}`,
          {
            save: false,
          },
        )

        return true
      } catch (e) {
        const trigger = await Trigger.find(payload.condition.triggerId)

        // Replacing backup failed, we need to refresh whole list
        await Condition.dispatch('get', {
          trigger,
          id: payload.condition.id,
        })

        throw new ApiError(
          'triggers-node.conditions.delete.failed',
          e,
          'Delete condition failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.DELETING,
          id: payload.condition.id,
        })
      }
    }
  },

  reset({ commit }): void {
    commit('RESET_STATE')
  },
}

const moduleMutations: MutationTree<ConditionState> = {
  ['SET_SEMAPHORE'](state: ConditionState, action: SemaphoreCondition): void {
    switch (action.type) {
      case SemaphoreTypes.FETCHING:
        state.semaphore.fetching.items.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.items = uniq(state.semaphore.fetching.items)
        break

      case SemaphoreTypes.GETTING:
        state.semaphore.fetching.item.push(action.id)

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
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

  ['CLEAR_SEMAPHORE'](state: ConditionState, action: SemaphoreCondition): void {
    switch (action.type) {
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

  ['RESET_STATE'](state: ConditionState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): ConditionState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
