/* eslint-disable no-param-reassign */

import {
  computed,
} from '@vue/composition-api'

import uuid from 'uuid'

import Trigger from '~/models/triggers-module/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-module/triggers/types'
import Condition from '~/models/triggers-module/conditions/Condition'
import {
  ConditionEntityTypes,
  ConditionInterface,
} from '~/models/triggers-module/conditions/types'
import Action from '~/models/triggers-module/actions/Action'
import {
  ActionEntityTypes,
  ActionInterface,
} from '~/models/triggers-module/actions/types'
import { ConditionOperatorTypes } from '~/models/triggers-module/types'
import Notification from '~/models/triggers-module/notifications/Notification'

import { DeviceInterface } from '~/models/devices-module/devices/types'
import DeviceProperty from '~/models/devices-module/device-properties/DeviceProperty'
import ChannelProperty from '~/models/devices-module/channel-properties/ChannelProperty'

export enum TriggerTypes {
  TIME_SCHEDULED = 'timeScheduled',
  DATE_SCHEDULED = 'dateScheduled',
  DEVICE = 'device',
  SENSOR = 'sensor',
  MANUAL = 'manual',
}

enum ConditionItemType {
  DEVICE_CONDITION = 'deviceCondition',
  CHANNEL_CONDITION = 'channelCondition',
}

enum ActionItemType {
  DEVICE_ACTION = 'deviceAction',
  CHANNEL_ACTION = 'channelAction',
}

interface TriggersCreateFormModelConditionDeviceInterface {
  selected: boolean
  operator: ConditionOperatorTypes
  operand: string | boolean | null
  type: ConditionItemType
  condition: string | null
}

interface TriggersCreateFormModelActionDeviceInterface {
  selected: boolean
  operation: string | boolean | null
  type: ActionItemType
  action: string | null
}

interface TriggersCreateFormModelTimeInterface {
  selected: boolean
  time: string
  days: Array<number>
  condition: string | null
}

interface TriggersCreateFormModelDateInterface {
  selected: boolean
  date: string
  condition: string | null
}

export interface TriggersCreateFormInterface {
  model: {
    conditions?: { [key: string]: TriggersCreateFormModelConditionDeviceInterface }
    actions?: { [key: string]: TriggersCreateFormModelActionDeviceInterface }
    time?: TriggersCreateFormModelTimeInterface
    date?: TriggersCreateFormModelDateInterface
  }
}

export default function(type: TriggerTypes, form: TriggersCreateFormInterface) {
  const triggerId = uuid.v4().toString()

  const conditions = computed<Array<ConditionInterface>>((): Array<ConditionInterface> => {
    return Condition
      .query()
      .where('triggerId', triggerId)
      .all()
  })

  const actions = computed<Array<ActionInterface>>((): Array<ActionInterface> => {
    return Action
      .query()
      .where('triggerId', triggerId)
      .all()
  })

  const trigger = computed<TriggerInterface | null>((): TriggerInterface | null => {
    return Trigger
      .query()
      .with('conditions')
      .with('actions')
      .with('notifications')
      .where('id', triggerId)
      .first()
  })

  function configureDate(): TriggersCreateFormModelDateInterface {
    const condition = Condition
      .query()
      .where('triggerId', triggerId)
      .where('type', ConditionEntityTypes.DATE)
      .first()

    if (condition !== null) {
      return {
        selected: true,
        date: (new Date(condition.date)).toISOString(),
        condition: condition.id,
      }
    } else {
      const today = new Date()

      return {
        selected: false,
        date: today.toISOString(),
        condition: null,
      }
    }
  }

  function configureTime(): TriggersCreateFormModelTimeInterface {
    const condition = Condition
      .query()
      .where('triggerId', triggerId)
      .where('type', ConditionEntityTypes.TIME)
      .first()

    if (condition !== null) {
      return {
        selected: true,
        time: (new Date(condition.time)).toISOString(),
        days: condition.days,
        condition: condition.id,
      }
    } else {
      const today = new Date()

      return {
        selected: false,
        time: today.toISOString(),
        days: [1, 2, 3, 4, 5, 6, 7],
        condition: null,
      }
    }
  }

  function configureDeviceCondition(device: DeviceInterface): { [key: string]: TriggersCreateFormModelConditionDeviceInterface } {
    const data: { [key: string]: TriggersCreateFormModelConditionDeviceInterface } = {}

    device.channels
      .forEach((channel): void => {
        channel.properties
          .forEach((property): void => {
            if (typeof data !== 'undefined') {
              data[property.id] = {
                selected: false,
                type: ConditionItemType.CHANNEL_CONDITION,
                operator: ConditionOperatorTypes.STATE_VALUE_EQUAL,
                operand: null,
                condition: null,
              }
            }
          })
      })

    device.properties
      .forEach((property): void => {
        if (typeof data !== 'undefined') {
          data[property.id] = {
            selected: false,
            type: ConditionItemType.DEVICE_CONDITION,
            operator: ConditionOperatorTypes.STATE_VALUE_EQUAL,
            operand: null,
            condition: null,
          }
        }
      })

    Condition
      .query()
      .where('triggerId', triggerId)
      .all()
      .forEach((condition): void => {
        let property = null

        if (condition.isDeviceProperty && condition.device === device.identifier) {
          property = DeviceProperty
            .query()
            .where('property', condition.property)
            .whereHas('deviceBackward', (query): void => {
              query.where('identifier', condition.device)
            })
            .first()
        } else if (condition.isChannelProperty && condition.device === device.identifier) {
          property = ChannelProperty
            .query()
            .where('property', condition.property)
            .whereHas('channelBackward', (query): void => {
              query
                .where('channel', condition.channel)
                .with('deviceBackward', (subQuery): void => {
                  subQuery.where('identifier', condition.device)
                })
            })
            .first()
        }

        if (
          property !== null &&
          Object.prototype.hasOwnProperty.call(data, property.id) &&
          typeof data !== 'undefined'
        ) {
          Object.assign(data[property.id], {
            selected: true,
            operator: condition.operator,
            operand: condition.operand,
            condition: condition.id,
          })
        }
      })

    return data
  }

  function configureDeviceAction(device: DeviceInterface): { [key: string]: TriggersCreateFormModelActionDeviceInterface } {
    const data: { [key: string]: TriggersCreateFormModelActionDeviceInterface } = {}

    device.channels
      .forEach((channel): void => {
        channel.properties
          .forEach((property): void => {
            if (typeof data !== 'undefined') {
              data[property.id] = {
                selected: false,
                operation: null,
                type: ActionItemType.CHANNEL_ACTION,
                action: null,
              }
            }
          })
      })

    device.properties
      .forEach((property): void => {
        if (typeof data !== 'undefined') {
          data[property.id] = {
            selected: false,
            operation: null,
            type: ActionItemType.DEVICE_ACTION,
            action: null,
          }
        }
      })

    Action
      .query()
      .where('triggerId', triggerId)
      .all()
      .forEach((action): void => {
        let property = null

        if (action.isDeviceProperty && action.device === device.identifier) {
          property = DeviceProperty
            .query()
            .where('property', action.property)
            .whereHas('deviceBackward', (query): void => {
              query.where('identifier', action.device)
            })
            .first()
        } else if (action.isChannelProperty && action.device === device.identifier) {
          property = ChannelProperty
            .query()
            .where('property', action.property)
            .whereHas('channelBackward', (query): void => {
              query
                .where('channel', action.channel)
                .with('deviceBackward', (subQuery): void => {
                  subQuery.where('identifier', action.device)
                })
            })
            .first()
        }

        if (
          property !== null &&
          Object.prototype.hasOwnProperty.call(data, property.id) &&
          typeof data !== 'undefined'
        ) {
          Object.assign(data[property.id], {
            selected: true,
            operation: action.value,
            action: action.id,
          })
        }
      })

    return data
  }

  function submitConditionDevice(): boolean {
    if (typeof form.model.conditions !== 'undefined') {
      let isValid = false

      Object.keys(form.model.conditions)
        .forEach((key): void => {
          if (
            typeof form.model.conditions !== 'undefined' &&
            form.model.conditions[key].selected &&
            form.model.conditions[key].operand !== null
          ) {
            isValid = true
          }
        })

      if (!isValid) {
        return false
      }

      Object.keys(form.model.conditions)
        .forEach(async(key): Promise<void> => {
          if (typeof form.model.conditions !== 'undefined') {
            const conditionId = form.model.conditions[key].condition

            let condition = null

            if (conditionId !== null) {
              condition = Condition.find(conditionId)

              if (condition === null) {
                throw new Error('Unknown condition')
              }
            }

            if (form.model.conditions[key].type === ConditionItemType.DEVICE_CONDITION) {
              if (form.model.conditions[key].selected) {
                if (condition !== null) {
                  await Condition.update({
                    where: condition.id,
                    data: {
                      operator: form.model.conditions[key].operator,
                      operand: form.model.conditions[key].operand,
                    },
                  })
                } else {
                  const property = DeviceProperty
                    .query()
                    .with('deviceBackward')
                    .where('id', key)
                    .has('deviceBackward')
                    .first()

                  if (property !== null) {
                    await Condition.insert({
                      data: {
                        id: uuid.v4().toString(),
                        trigger: trigger.value,
                        triggerId,
                        draft: true,
                        type: ConditionEntityTypes.DEVICE_PROPERTY,
                        enabled: true,
                        operator: form.model.conditions[key].operator,
                        operand: form.model.conditions[key].operand,
                        device: property.deviceBackward?.identifier,
                        property: property.property,
                      },
                    })
                  } else {
                    throw new Error('Unknown device property')
                  }
                }
              } else if (condition !== null) {
                await Condition.delete(condition.id)
              }
            } else if (form.model.conditions[key].type === ConditionItemType.CHANNEL_CONDITION) {
              if (form.model.conditions[key].selected) {
                if (condition !== null) {
                  await Condition.update({
                    where: condition.id,
                    data: {
                      operator: form.model.conditions[key].operator,
                      operand: form.model.conditions[key].operand,
                    },
                  })
                } else {
                  const property = ChannelProperty
                    .query()
                    .with('channelBackward')
                    .with('channelBackward.deviceBackward')
                    .has('channelBackward')
                    .where('id', key)
                    .first()

                  if (property !== null) {
                    await Condition.insert({
                      data: {
                        id: uuid.v4().toString(),
                        trigger: trigger.value,
                        triggerId,
                        draft: true,
                        type: ConditionEntityTypes.CHANNEL_PROPERTY,
                        enabled: true,
                        operator: form.model.conditions[key].operator,
                        operand: form.model.conditions[key].operand,
                        device: property.channelBackward?.deviceBackward?.identifier,
                        channel: property.channelBackward?.channel,
                        property: property.property,
                      },
                    })
                  } else {
                    throw new Error('Unknown device property')
                  }
                }
              } else if (condition !== null) {
                await Condition.delete(condition.id)
              }
            }
          }
        })
    } else {
      throw new TypeError('Unknown condition')
    }

    return true
  }

  function submitActionDevice(): boolean {
    if (typeof form.model.actions !== 'undefined') {
      let isValid = false

      Object.keys(form.model.actions)
        .forEach((key): void => {
          if (
            typeof form.model.actions !== 'undefined' &&
            form.model.actions[key].selected &&
            form.model.actions[key].operation !== null
          ) {
            isValid = true
          }
        })

      if (!isValid) {
        return false
      }

      Object.keys(form.model.actions)
        .forEach(async(key): Promise<void> => {
          if (typeof form.model.actions !== 'undefined') {
            const actionId = form.model.actions[key].action

            let action = null

            if (actionId !== null) {
              action = Action.find(actionId)

              if (action === null) {
                throw new Error('Unknown action')
              }
            }

            if (form.model.actions[key].type === ActionItemType.DEVICE_ACTION) {
              if (form.model.actions[key].selected) {
                if (action !== null) {
                  await Action.update({
                    where: action.id,
                    data: {
                      value: form.model.actions[key].operation,
                    },
                  })
                } else {
                  const property = DeviceProperty
                    .query()
                    .with('deviceBackward')
                    .where('id', key)
                    .has('deviceBackward')
                    .first()

                  if (property !== null) {
                    await Action.insert({
                      data: {
                        id: uuid.v4().toString(),
                        trigger: trigger.value,
                        triggerId,
                        draft: true,
                        type: ActionEntityTypes.DEVICE_PROPERTY,
                        enabled: true,
                        value: form.model.actions[key].operation,
                        device: property.deviceBackward?.identifier,
                        property: property.property,
                      },
                    })
                  } else {
                    throw new Error('Unknown device property')
                  }
                }
              } else {
                await Action.dispatch('remove', {
                  action,
                })
              }
            } else if (form.model.actions[key].type === ActionItemType.CHANNEL_ACTION) {
              if (form.model.actions[key].selected) {
                if (action !== null) {
                  await Action.update({
                    where: action.id,
                    data: {
                      value: form.model.actions[key].operation,
                    },
                  })
                } else {
                  const property = ChannelProperty
                    .query()
                    .with('channelBackward')
                    .with('channelBackward.deviceBackward')
                    .has('channelBackward')
                    .where('id', key)
                    .first()

                  if (property !== null) {
                    await Action.insert({
                      data: {
                        id: uuid.v4().toString(),
                        trigger: trigger.value,
                        triggerId,
                        draft: true,
                        type: ActionEntityTypes.CHANNEL_PROPERTY,
                        enabled: true,
                        value: form.model.actions[key].operation,
                        device: property.channelBackward?.deviceBackward?.identifier,
                        channel: property.channelBackward?.channel,
                        property: property.property,
                      },
                    })
                  } else {
                    throw new Error('Unknown device property')
                  }
                }
              } else {
                await Action.dispatch('remove', {
                  action,
                })
              }
            }
          }
        })
    } else {
      throw new TypeError('Unknown action')
    }

    return true
  }

  async function submitDate(): Promise<boolean> {
    if (typeof form.model.date !== 'undefined') {
      if (form.model.date.condition !== null) {
        const condition = Condition.find(form.model.date.condition)

        if (condition !== null) {
          await Condition.update({
            where: condition.id,
            data: {
              date: form.model.date.date,
            },
          })
        } else {
          throw new Error('Unknown condition')
        }
      } else {
        await Condition.insert({
          data: {
            id: uuid.v4().toString(),
            trigger: trigger.value,
            triggerId,
            draft: true,
            type: ConditionEntityTypes.DATE,
            enabled: true,
            date: form.model.date.date,
          },
        })
      }
    }

    return true
  }

  async function submitTime(): Promise<boolean> {
    if (typeof form.model.time !== 'undefined') {
      if (form.model.time.condition !== null) {
        const condition = Condition.find(form.model.time.condition)

        if (condition !== null) {
          await Condition.update({
            where: condition.id,
            data: {
              time: form.model.time.time,
              days: form.model.time.days,
            },
          })
        } else {
          throw new Error('Unknown condition')
        }
      } else {
        await Condition.insert({
          data: {
            id: uuid.v4().toString(),
            trigger: trigger.value,
            triggerId,
            draft: true,
            type: ConditionEntityTypes.TIME,
            enabled: true,
            time: form.model.time.time,
            days: form.model.time.days,
          },
        })
      }
    }

    return true
  }

  function destroy(): void {
    if (trigger.value !== null) {
      trigger.value.conditions.forEach((condition): void => {
        if (condition.draft) {
          Condition.delete(condition.id)
        }
      })

      trigger.value.actions.forEach((action): void => {
        if (action.draft) {
          Action.delete(action.id)
        }
      })

      trigger.value.notifications.forEach((notification): void => {
        if (notification.draft) {
          Notification.delete(notification.id)
        }
      })
    }

    if (trigger.value !== null && trigger.value.draft) {
      Trigger.dispatch('remove', {
        trigger: trigger.value,
      })
    }
  }

  return {
    triggerId,
    conditions,
    actions,
    trigger,
    configureDate,
    configureTime,
    configureDeviceCondition,
    configureDeviceAction,
    submitConditionDevice,
    submitActionDevice,
    submitDate,
    submitTime,
    destroy,
  }
}
