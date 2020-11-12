import {
  ActionTree,
  GetterTree,
  MutationTree,
} from 'vuex'
import { Item } from '@vuex-orm/core'
import Jsona from 'jsona'
import uuid from 'uuid'
import { AxiosResponse } from 'axios'
import get from 'lodash/get'
import uniq from 'lodash/uniq'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import {
  CreateAutomaticTriggerInterface,
  CreateChannelPropertyTriggerInterface,
  CreateManualTriggerInterface,
  SemaphoreType,
  TriggerEntityTypeType,
  TriggerInterface,
  TriggerResponseInterface,
  TriggersResponseInterface,
  TriggerUpdateInterface,
} from '~/models/triggers-node/triggers/types'
import Action from '~/models/triggers-node/actions/Action'
import {
  ActionCreateInterface,
  ActionEntityTypeType,
  ActionInterface,
  CreateChannelPropertyActionInterface,
  CreateDevicePropertyActionInterface,
} from '~/models/triggers-node/actions/types'
import Condition from '~/models/triggers-node/conditions/Condition'
import {
  ConditionCreateInterface,
  ConditionEntityTypeType,
  ConditionInterface,
  CreateChannelPropertyConditionInterface,
  CreateDateConditionInterface,
  CreateDevicePropertyConditionInterface,
  CreateTimeConditionInterface,
} from '~/models/triggers-node/conditions/types'
import Notification from '~/models/triggers-node/notifications/Notification'
import {
  CreateEmailNotificationInterface,
  CreateSmsNotificationInterface,
  NotificationCreateInterface,
  NotificationEntityTypeType,
  NotificationInterface,
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
  TriggerJsonModelInterface,
} from '~/models/triggers-node/types'

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

interface TriggerState {
  semaphore: SemaphoreState
  firstLoad: boolean
}

interface SemaphoreAction {
  type: SemaphoreType
  id?: string;
}

const jsonApiFormatter = new Jsona({
  modelPropertiesMapper: new JsonApiModelPropertiesMapper(),
  jsonPropertiesMapper: new JsonApiPropertiesMapper(),
})

const apiOptions = {
  dataTransformer: (result: AxiosResponse<TriggerResponseInterface> | AxiosResponse<TriggersResponseInterface>): TriggerJsonModelInterface | Array<TriggerJsonModelInterface> => <TriggerJsonModelInterface | Array<TriggerJsonModelInterface>>jsonApiFormatter.deserialize(result.data),
}

const moduleState: TriggerState = {

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

function buildCreateDevicePropertyAction(data: any): CreateDevicePropertyActionInterface {
  return {
    type: data.type,
    enabled: data.enabled,

    device: data.device,
    property: data.property,
    value: data.value,
  }
}

function buildCreateChannelPropertyAction(data: any): CreateChannelPropertyActionInterface {
  return {
    type: data.type,
    enabled: data.enabled,

    device: data.device,
    channel: data.channel,
    property: data.property,
    value: data.value,
  }
}

function buildCreateDevicePropertyCondition(data: any): CreateDevicePropertyConditionInterface {
  return {
    type: data.type,
    enabled: data.enabled,

    operator: data.operator,
    operand: data.operand,
    device: data.device,
    property: data.property,
  }
}

function buildCreateChannelPropertyCondition(data: any): CreateChannelPropertyConditionInterface {
  return {
    type: data.type,
    enabled: data.enabled,

    operator: data.operator,
    operand: data.operand,
    device: data.device,
    channel: data.channel,
    property: data.property,
  }
}

function buildCreateDateCondition(data: any): CreateDateConditionInterface {
  return {
    type: data.type,
    enabled: data.enabled,

    date: data.date,
  }
}

function buildCreateTimeCondition(data: any): CreateTimeConditionInterface {
  return {
    type: data.type,
    enabled: data.enabled,

    time: data.time,
    days: data.days,
  }
}

function buildCreateSmsNotification(data: any): CreateSmsNotificationInterface {
  return {
    type: data.type,
    enabled: data.enabled,

    phone: data.phone,
  }
}

function buildCreateEmailNotification(data: any): CreateEmailNotificationInterface {
  return {
    type: data.type,
    enabled: data.enabled,

    email: data.email,
  }
}

const moduleGetters: GetterTree<TriggerState, any> = {
  firstLoadFinished: state => (): boolean => {
    return !!state.firstLoad
  },

  getting: state => (id: string): boolean => {
    return state.semaphore.fetching.item.includes(id)
  },

  fetching: state => (): boolean => {
    return state.semaphore.fetching.items
  },
}

const moduleActions: ActionTree<TriggerState, any> = {
  async get({ state, commit }, payload: { id: string }): Promise<boolean> {
    if (state.semaphore.fetching.item.includes(payload.id)) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.GETTING,
      id: payload.id,
    })

    try {
      await Trigger.api().get(
        `/triggers-node/v1/triggers/${payload.id}?include=conditions,actions,notifications`,
        apiOptions,
      )

      return true
    } catch (e) {
      throw new ApiError(
        'triggers-node.triggers.fetch.failed',
        e,
        'Fetching triggers failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.GETTING,
        id: payload.id,
      })
    }
  },

  async fetch({ state, commit }): Promise<boolean> {
    if (state.semaphore.fetching.items) {
      return false
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.FETCHING,
    })

    try {
      await Trigger.api().get(
        '/triggers-node/v1/triggers?include=conditions,actions,notifications',
        apiOptions,
      )

      commit('SET_FIRST_LOAD', true)

      return true
    } catch (e) {
      throw new ApiError(
        'triggers-node.triggers.fetch.failed',
        e,
        'Fetching triggers failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.FETCHING,
      })
    }
  },

  async add({ commit }, payload: { id?: string | null, draft?: boolean, data: CreateChannelPropertyTriggerInterface | CreateManualTriggerInterface | CreateAutomaticTriggerInterface }): Promise<Item<Trigger>> {
    const actions: Array<ActionCreateInterface> = []
    const conditions: Array<ConditionCreateInterface> = []
    const notifications: Array<NotificationCreateInterface> = []

    for (const actionData of payload.data.actions) {
      if (actionData.type === ActionEntityTypeType.DEVICE_PROPERTY) {
        actions.push(buildCreateDevicePropertyAction(actionData))
      } else if (actionData.type === ActionEntityTypeType.CHANNEL_PROPERTY) {
        actions.push(buildCreateChannelPropertyAction(actionData))
      }
    }

    if (payload.data.type === TriggerEntityTypeType.AUTOMATIC) {
      if (Object.prototype.hasOwnProperty.call(payload.data, 'conditions')) {
        // @ts-ignore
        for (const conditionData of payload.data.conditions) {
          if (conditionData.type === ConditionEntityTypeType.DEVICE_PROPERTY) {
            conditions.push(buildCreateDevicePropertyCondition(conditionData))
          } else if (conditionData.type === ConditionEntityTypeType.CHANNEL_PROPERTY) {
            conditions.push(buildCreateChannelPropertyCondition(conditionData))
          } else if (conditionData.type === ConditionEntityTypeType.DATE) {
            conditions.push(buildCreateDateCondition(conditionData))
          } else if (conditionData.type === ConditionEntityTypeType.TIME) {
            conditions.push(buildCreateTimeCondition(conditionData))
          }
        }
      }
    }

    if (payload.data.type !== TriggerEntityTypeType.CHANNEL_PROPERTY) {
      for (const notificationData of payload.data.notifications) {
        if (notificationData.type === NotificationEntityTypeType.SMS) {
          notifications.push(buildCreateSmsNotification(notificationData))
        } else if (notificationData.type === NotificationEntityTypeType.EMAIL) {
          notifications.push(buildCreateEmailNotification(notificationData))
        }
      }
    }

    const id = typeof payload.id !== 'undefined' && payload.id !== null && payload.id !== '' ? payload.id : uuid.v4().toString()
    const draft = typeof payload.draft !== 'undefined' ? payload.draft : false

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.CREATING,
      id,
    })

    try {
      await Trigger.insert({
        data: Object.assign({}, payload.data, { id, draft }),
      })
    } catch (e) {
      throw new OrmError(
        'triggers-node.triggers.create.failed',
        e,
        'Create new trigger failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.CREATING,
        id,
      })
    }

    const createdEntity = Trigger.find(id)

    if (createdEntity === null) {
      await Trigger.delete(id)

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.CREATING,
        id,
      })

      throw new Error('triggers-node.triggers.create.failed')
    }

    if (draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.CREATING,
        id,
      })

      return Trigger.find(id)
    } else {
      try {
        await Trigger.api().post(
          '/triggers-node/v1/triggers',
          jsonApiFormatter.serialize({
            stuff: createdEntity,
          }),
          apiOptions,
        )

        const createdTrigger = Trigger.find(id)

        const promises: Array<Promise<any>> = []

        actions
          .forEach((action: ActionCreateInterface): void => {
            promises.push(
              Action.dispatch('add', {
                trigger: createdTrigger,
                data: action,
              }),
            )
          })

        conditions
          .forEach((condition: ConditionCreateInterface): void => {
            promises.push(
              Condition.dispatch('add', {
                trigger: createdTrigger,
                data: condition,
              }),
            )
          })

        notifications
          .forEach((notification: NotificationCreateInterface): void => {
            promises.push(
              Notification.dispatch('add', {
                trigger: createdTrigger,
                data: notification,
              }),
            )
          })

        await Promise.all(promises)

        return createdTrigger
      } catch (e) {
        // Entity could not be created on api, we have to remove it from database
        await Trigger.delete(id)

        throw new ApiError(
          'triggers-node.triggers.create.failed',
          e,
          'Create new trigger failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreType.CREATING,
          id,
        })
      }
    }
  },

  async edit({ state, commit }, payload: { trigger: TriggerInterface, data: TriggerUpdateInterface }): Promise<Item<Trigger>> {
    if (state.semaphore.updating.includes(payload.trigger.id)) {
      throw new Error('triggers-node.triggers.update.inProgress')
    }

    if (!Trigger.query().where('id', payload.trigger.id).exists()) {
      throw new Error('triggers-node.triggers.update.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.UPDATING,
      id: payload.trigger.id,
    })

    try {
      await Trigger.update({
        where: payload.trigger.id,
        data: payload.data,
      })
    } catch (e) {
      throw new OrmError(
        'triggers-node.triggers.update.failed',
        e,
        'Edit trigger failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.trigger.id,
      })
    }

    const updatedEntity = Trigger.find(payload.trigger.id)

    if (updatedEntity === null) {
      // Updated entity could not be loaded from database
      await Trigger.dispatch('get', {
        id: payload.trigger.id,
        includeChannels: false,
      })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.trigger.id,
      })

      throw new Error('triggers-node.triggers.update.failed')
    }

    if (updatedEntity.draft) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.trigger.id,
      })

      return Trigger.find(payload.trigger.id)
    } else {
      try {
        await Trigger.api().patch(
          `/triggers-node/v1/triggers/${updatedEntity.id}`,
          jsonApiFormatter.serialize({
            stuff: updatedEntity,
          }),
          apiOptions,
        )

        return Trigger.find(payload.trigger.id)
      } catch (e) {
        // Updating entity on api failed, we need to refresh entity
        await Trigger.dispatch('get', {
          id: payload.trigger.id,
          includeChannels: false,
        })

        throw new ApiError(
          'triggers-node.triggers.update.failed',
          e,
          'Edit trigger failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreType.UPDATING,
          id: payload.trigger.id,
        })
      }
    }
  },

  async save({ state, commit }, payload: { trigger: TriggerInterface }): Promise<Item<Trigger>> {
    if (state.semaphore.updating.includes(payload.trigger.id)) {
      throw new Error('triggers-node.triggers.save.inProgress')
    }

    if (!Trigger.query().where('id', payload.trigger.id).where('draft', true).exists()) {
      throw new Error('triggers-node.triggers.save.failed')
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.UPDATING,
      id: payload.trigger.id,
    })

    const entityToSave = Trigger.find(payload.trigger.id)

    if (entityToSave === null) {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.trigger.id,
      })

      throw new Error('triggers-node.triggers.save.failed')
    }

    try {
      await Trigger.api().post(
        '/triggers-node/v1/triggers',
        jsonApiFormatter.serialize({
          stuff: entityToSave,
        }),
        apiOptions,
      )

      const createdTrigger = Trigger
        .query()
        .with('actions')
        .with('conditions')
        .with('notifications')
        .where('id', payload.trigger.id)
        .first()

      if (createdTrigger !== null) {
        const promises: Array<Promise<any>> = []

        createdTrigger.actions
          .forEach((action: ActionCreateInterface): void => {
            promises.push(
              Action.dispatch('save', {
                action,
              }),
            )
          })

        createdTrigger.conditions
          .forEach((condition: ConditionCreateInterface): void => {
            promises.push(
              Condition.dispatch('save', {
                condition,
              }),
            )
          })

        createdTrigger.notifications
          .forEach((notification: NotificationCreateInterface): void => {
            promises.push(
              Notification.dispatch('save', {
                notification,
              }),
            )
          })

        await Promise.all(promises)
      }

      return createdTrigger
    } catch (e) {
      throw new ApiError(
        'triggers-node.triggers.save.failed',
        e,
        'Save draft trigger failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.UPDATING,
        id: payload.trigger.id,
      })
    }
  },

  async remove({ state, commit }, payload: { trigger: TriggerInterface }): Promise<boolean> {
    if (state.semaphore.deleting.includes(payload.trigger.id)) {
      throw new Error('triggers-node.triggers.delete.inProgress')
    }

    const trigger = Trigger
      .query()
      .with('actions')
      .with('conditions')
      .with('notifications')
      .where('id', payload.trigger.id)
      .first()

    if (trigger === null) {
      return true
    }

    commit('SET_SEMAPHORE', {
      type: SemaphoreType.DELETING,
      id: payload.trigger.id,
    })

    try {
      await Trigger.delete(payload.trigger.id)
    } catch (e) {
      throw new OrmError(
        'triggers-node.triggers.delete.failed',
        e,
        'Delete trigger failed.',
      )
    } finally {
      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.DELETING,
        id: payload.trigger.id,
      })
    }

    if (payload.trigger.draft) {
      trigger.actions
        .forEach((action: ActionInterface): void => {
          Action.dispatch('remove', {
            action,
          })
        })

      trigger.conditions
        .forEach((condition: ConditionInterface): void => {
          Condition.dispatch('remove', {
            condition,
          })
        })

      trigger.notifications
        .forEach((notification: NotificationInterface): void => {
          Notification.dispatch('remove', {
            notification,
          })
        })

      commit('CLEAR_SEMAPHORE', {
        type: SemaphoreType.DELETING,
        id: payload.trigger.id,
      })

      return true
    } else {
      try {
        await Trigger.api().delete(
          `/triggers-node/v1/triggers/${payload.trigger.id}`,
          {
            save: false,
          },
        )

        trigger.actions
          .forEach((action: ActionInterface): void => {
            Action.delete(action.id)
          })

        trigger.conditions
          .forEach((condition: ConditionInterface): void => {
            Condition.delete(condition.id)
          })

        trigger.notifications
          .forEach((notification: NotificationInterface): void => {
            Notification.delete(notification.id)
          })

        return true
      } catch (e) {
        // Deleting entity on api failed, we need to refresh entity
        await Trigger.dispatch('get', {
          id: payload.trigger.id,
          includeChannels: false,
        })

        throw new OrmError(
          'triggers-node.triggers.delete.failed',
          e,
          'Delete trigger failed.',
        )
      } finally {
        commit('CLEAR_SEMAPHORE', {
          type: SemaphoreType.DELETING,
          id: payload.trigger.id,
        })
      }
    }
  },

  reset({ commit }): void {
    commit('RESET_STATE')

    Action.dispatch('reset')
    Condition.dispatch('reset')
    Notification.dispatch('reset')
  },
}

const moduleMutations: MutationTree<TriggerState> = {
  ['SET_FIRST_LOAD'](state: TriggerState, action: boolean): void {
    state.firstLoad = action
  },

  ['SET_SEMAPHORE'](state: TriggerState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreType.FETCHING:
        state.semaphore.fetching.items = true
        break

      case SemaphoreType.GETTING:
        state.semaphore.fetching.item.push(get(action, 'id', 'notValid'))

        // Make all keys uniq
        state.semaphore.fetching.item = uniq(state.semaphore.fetching.item)
        break

      case SemaphoreType.CREATING:
        state.semaphore.creating.push(get(action, 'id', 'notValid'))

        // Make all keys uniq
        state.semaphore.creating = uniq(state.semaphore.creating)
        break

      case SemaphoreType.UPDATING:
        state.semaphore.updating.push(get(action, 'id', 'notValid'))

        // Make all keys uniq
        state.semaphore.updating = uniq(state.semaphore.updating)
        break

      case SemaphoreType.DELETING:
        state.semaphore.deleting.push(get(action, 'id', 'notValid'))

        // Make all keys uniq
        state.semaphore.deleting = uniq(state.semaphore.deleting)
        break
    }
  },

  ['CLEAR_SEMAPHORE'](state: TriggerState, action: SemaphoreAction): void {
    switch (action.type) {
      case SemaphoreType.FETCHING:
        state.semaphore.fetching.items = false
        break

      case SemaphoreType.GETTING:
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

      case SemaphoreType.CREATING:
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

      case SemaphoreType.UPDATING:
        // Process all semaphore items
        state.semaphore.updating
          .forEach((item: string, index: number): void => {
            // Find created item in updating semaphore...
            if (item === get(action, 'id', 'notValid')) {
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
            if (item === get(action, 'id', 'notValid')) {
              // ...and remove it
              state.semaphore.deleting.splice(index, 1)
            }
          })
        break
    }
  },

  ['RESET_STATE'](state: TriggerState): void {
    Object.assign(state, moduleState)
  },
}

export default {
  state: (): TriggerState => (moduleState),
  getters: moduleGetters,
  actions: moduleActions,
  mutations: moduleMutations,
}
