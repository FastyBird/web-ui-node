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
import Notification from '~/models/triggers-node/notifications/Notification'
import {
  CreateEmailNotificationInterface,
  CreateSmsNotificationInterface,
  NotificationInterface,
  NotificationResponseInterface,
  NotificationsResponseInterface,
  SemaphoreTypes,
  UpdateEmailNotificationInterface,
  UpdateSmsNotificationInterface,
} from '~/models/triggers-node/notifications/types'

import {
  ApiError,
  OrmError,
} from '~/models/triggers-node/errors'
import {
  JsonApiModelPropertiesMapper,
  JsonApiPropertiesMapper,
} from '~/models/triggers-node/jsonapi'
import {
  NotificationJsonModelInterface,
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

interface NotificationState {
  semaphore: SemaphoreState
}

interface SemaphoreNotification {
  type: SemaphoreTypes
  id: string
}

const jsonApiFormatter = new Jsona({
  modelPropertiesMapper: new JsonApiModelPropertiesMapper(),
  jsonPropertiesMapper: new JsonApiPropertiesMapper(),
})

const apiOptions = {
  dataTransformer: (result: AxiosResponse<NotificationResponseInterface> | AxiosResponse<NotificationsResponseInterface>): NotificationJsonModelInterface | Array<NotificationJsonModelInterface> => <NotificationJsonModelInterface | Array<NotificationJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const moduleState: NotificationState = {

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

const moduleActions: ActionTree<NotificationState, any> = {
  async get({ state, commit }, payload: { trigger: TriggerInterface, id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.GETTING,
      id: payload.id,
    })

    try {
      await Notification.api().get(
        `/triggers-node/v1/triggers/${payload.trigger.id}/notifications/${payload.id}`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'triggers-node.notifications.get.failed',
        e,
        'Fetching notification failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.GETTING,
        id: payload.id,
      })
    }
  },

  async add({ commit }, payload: { trigger: TriggerInterface, id?: string | null, draft?: boolean, data: CreateSmsNotificationInterface | CreateEmailNotificationInterface }): Promise<Item<Notification>> {
    const id = typeof payload.id !== 'undefined' && payload.id !== null && payload.id !== '' ? payload.id : uuid.v4().toString()
    const draft = typeof payload.draft !== 'undefined' ? payload.draft : false

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.CREATING,
      id,
    })

    try {
      await Notification.insert({
        data: Object.assign({}, payload.data, { id, draft, triggerId: payload.trigger.id }),
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      throw new OrmError(
        'triggers-node.notifications.create.failed',
        e,
        'Create new notification failed.',
      )
    }

    const createdEntity = Notification.find(id)

    if (createdEntity === null) {
      await Notification.delete(id)

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      throw new Error('triggers-node.notifications.create.failed')
    }

    if (draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.CREATING,
        id,
      })

      return Notification.find(id)
    } else {
      try {
        await Notification.api().post(
          `/triggers-node/v1/triggers/${payload.trigger.id}/notifications`,
          jsonApiFormatter.serialize({
            stuff: createdEntity,
          }),
          apiOptions,
        )

        return Notification.find(id)
      } catch (e) {
        // Entity could not be created on api, we have to remove it from database
        await Notification.delete(id)

        throw new ApiError(
          'triggers-node.notifications.create.failed',
          e,
          'Create new notification failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.CREATING,
          id,
        })
      }
    }
  },

  async edit({ state, commit }, payload: { notification: NotificationInterface, data: UpdateSmsNotificationInterface | UpdateEmailNotificationInterface }): Promise<Item<Notification>> {
    if (state.semaphore.updating.includes(payload.notification.id)) {
      throw new Error('triggers-node.notifications.update.inProgress')
    }

    if (!Notification.query().where('id', payload.notification.id).exists()) {
      throw new Error('triggers-node.notifications.update.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.notification.id,
    })

    try {
      await Notification.update({
        where: payload.notification.id,
        data: payload.data,
      })
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.notification.id,
      })

      throw new OrmError(
        'triggers-node.notifications.update.failed',
        e,
        'Edit notification failed.',
      )
    }

    const updatedEntity = Notification.find(payload.notification.id)

    if (updatedEntity === null) {
      const trigger = Trigger.find(payload.notification.triggerId)

      // Updated entity could not be loaded from database
      await Notification.dispatch('get', {
        trigger,
        id: payload.notification.id,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.notification.id,
      })

      throw new Error('triggers-node.notifications.update.failed')
    }

    if (updatedEntity.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.notification.id,
      })

      return Notification.find(payload.notification.id)
    } else {
      try {
        await Notification.api().patch(
          `/triggers-node/v1/triggers/${updatedEntity.triggerId}/notifications/${updatedEntity.id}`,
          jsonApiFormatter.serialize({
            stuff: updatedEntity,
          }),
          apiOptions,
        )

        return Notification.find(payload.notification.id)
      } catch (e) {
        const trigger = Trigger.find(payload.notification.triggerId)

        // Updating entity on api failed, we need to refresh entity
        await Notification.dispatch('get', {
          trigger,
          id: payload.notification.id,
        })

        throw new ApiError(
          'triggers-node.notifications.update.failed',
          e,
          'Edit notification failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.UPDATING,
          id: payload.notification.id,
        })
      }
    }
  },

  async save({ state, commit }, payload: { notification: NotificationInterface }): Promise<Item<Notification>> {
    if (state.semaphore.updating.includes(payload.notification.id)) {
      throw new Error('triggers-node.notifications.save.inProgress')
    }

    if (!Notification.query().where('id', payload.notification.id).where('draft', true).exists()) {
      throw new Error('triggers-node.notifications.save.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.UPDATING,
      id: payload.notification.id,
    })

    const entityToSave = Notification.find(payload.notification.id)

    if (entityToSave === null) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.notification.id,
      })

      throw new Error('triggers-node.notifications.save.failed')
    }

    try {
      await Notification.api().patch(
        `/triggers-node/v1/triggers/${entityToSave.triggerId}/notifications`,
        jsonApiFormatter.serialize({
          stuff: entityToSave,
        }),
        apiOptions,
      )

      return Notification.find(payload.notification.id)
    } catch (e) {
      throw new ApiError(
        'triggers-node.notifications.save.failed',
        e,
        'Save draft notification failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.UPDATING,
        id: payload.notification.id,
      })
    }
  },

  async remove({ state, commit }, payload: { notification: NotificationInterface }): Promise<boolean> {
    if (state.semaphore.deleting.includes(payload.notification.id)) {
      throw new Error('triggers-node.notifications.delete.inProgress')
    }

    if (!Notification.query().where('id', payload.notification.id).exists()) {
      throw new Error('triggers-node.notifications.delete.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreTypes.DELETING,
      id: payload.notification.id,
    })

    try {
      await Notification.delete(payload.notification.id)
    } catch (e) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.DELETING,
        id: payload.notification.id,
      })

      throw new OrmError(
        'triggers-node.notifications.delete.failed',
        e,
        'Delete notification failed.',
      )
    }

    if (payload.notification.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreTypes.DELETING,
        id: payload.notification.id,
      })

      return true
    } else {
      try {
        await Notification.api().delete(
          `/triggers-node/v1/triggers/${payload.notification.triggerId}/notifications/${payload.notification.id}`,
          {
            save: false,
          },
        )

        return true
      } catch (e) {
        const trigger = await Trigger.find(payload.notification.triggerId)

        // Replacing backup failed, we need to refresh whole list
        await Notification.dispatch('get', {
          trigger,
          id: payload.notification.id,
        })

        throw new ApiError(
          'triggers-node.notifications.delete.failed',
          e,
          'Delete notification failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreTypes.DELETING,
          id: payload.notification.id,
        })
      }
    }
  },

  reset({ commit }): void {
    commit('RESET_STATE')
  },
}

const moduleMutations: MutationTree<NotificationState> = {
  ['SET_SEMAPHORE'](state: NotificationState, action: SemaphoreNotification): void {
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

  ['CLEAR_SEMAPHORE'](state: NotificationState, action: SemaphoreNotification): void {
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

  ['RESET_STATE'](state: NotificationState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): NotificationState => (moduleState),
  actions: moduleActions,
  mutations: moduleMutations,
}
