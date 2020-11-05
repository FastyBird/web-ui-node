import filter from 'lodash/filter'

import {
  DEVICE_FASTYBIRD_BUTTON_PRESS,
  DEVICE_FASTYBIRD_BUTTON_CLICK,
  DEVICE_FASTYBIRD_BUTTON_DBL_CLICK,
} from '~/configuration/devices'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import Action from '~/models/triggers-node/actions/Action'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'

import { ActionEntityTypeType } from '~/models/triggers-node/actions/types'

export default {

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      actionType: null,
    }
  },

  computed: {

    /**
     * Thing direct triggers
     *
     * @returns {Array}
     */
    triggers() {
      const property = ChannelProperty
        .query()
        .where('channelId', this.thing.channelId)
        .first()

      if (property === null) {
        return []
      }

      return Trigger
        .query()
        .with('actions')
        .where('device', this.thing.device.identifier)
        .where('channel', this.thing.channel.channel)
        .where('property', property.property)
        .orderBy('operand', 'asc')
        .get()
    },

  },

  methods: {

    mapActions() {
      const trigger = this._getButtonActionTrigger(this.actionType)

      const actions = []

      if (trigger) {
        trigger.actions
          .forEach((action) => {
            if (typeof actions.find(storedAction => (storedAction.device === action.device && storedAction.channel === action.channel)) === 'undefined') {
              if (action.channel !== null) {
                actions.push({
                  enabled: action.enabled,
                  device: action.device,
                  channel: action.channel,
                  rows: [],
                })
              }
            }
          })

        for (const i in actions) {
          if (Object.prototype.hasOwnProperty.call(actions, i)) {
            filter(trigger.actions, { device: actions[i].device, channel: actions[i].channel })
              .forEach((action) => {
                actions[i].rows.push({
                  action_id: action.id,
                  property: action.property,
                  operation: action.value,
                })
              })
          }
        }
      }

      return actions
    },

    /**
     * Add action settings to collection
     *
     * @param {Object} data
     */
    addAction(data) {
      const errorMessage = this.$t('things.messages.triggerNotCreated')

      const trigger = this._getButtonActionTrigger(this.actionType)

      if (trigger) {
        const triggerAction = this.mapActions()
          .find((item) => {
            return (item.device === data.device && item.channel === data.channel)
          })

        this._.get(data, 'rows', [])
          .forEach((row) => {
            if (
              typeof triggerAction !== 'undefined' &&
              typeof this._.get(triggerAction, 'rows', []).find(({ property }) => property === row.property) !== 'undefined'
            ) {
              const triggerActionProperty = this._.get(triggerAction, 'rows', [])
                .find(({ property }) => property === row.property)

              // Update existing trigger action
              Action.dispatch('edit', {
                id: triggerActionProperty.action_id,
                data: {
                  enabled: data.enabled,
                  value: row.operation,
                },
              })
                .catch((e) => {
                  if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                    this.handleException(e.exception, errorMessage)
                  } else {
                    this.$flashMessage(errorMessage, 'error')
                  }
                })
            } else {
              // Create existing trigger action
              Action.dispatch('add', {
                trigger,
                data: {
                  id: null,
                  type: ActionEntityTypeType.CHANNEL_PROPERTY,
                  enabled: data.enabled,
                  device: data.device,
                  channel: data.channel,
                  property: row.property,
                  value: row.operation,
                },
              })
                .catch((e) => {
                  if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                    this.handleException(e.exception, errorMessage)
                  } else {
                    this.$flashMessage(errorMessage, 'error')
                  }
                })
            }
          })
      } else {
        const mappedActions = []

        this._.get(data, 'rows', [])
          .forEach((row) => {
            mappedActions.push({
              type: ActionEntityTypeType.CHANNEL_PROPERTY,
              enabled: !!data.enabled,
              device: data.device,
              channel: data.channel,
              property: row.property,
              value: row.operation,
            })
          })

        const property = ChannelProperty
          .query()
          .where('channelId', this.thing.channelId)
          .first()

        // Create new trigger with remapped actions
        Trigger.dispatch('add', {
          channelProperty: true,
          data: {
            name: this.thing.deviceId,
            comment: this.thing.channelId,
            device: this.thing.device.identifier,
            channel: this.thing.channel.channel,
            enabled: true,
            property: property.property,
            operator: 'eq',
            operand: this._mapActionToCode(this.actionType),
            actions: mappedActions,
          },
        })
          .catch((e) => {
            if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
              this.handleException(e.exception, errorMessage)
            } else {
              this.$flashMessage(errorMessage, 'error')
            }
          })
      }
    },

    /**
     * Remove thing from opened action edit
     *
     * @param {Thing} thing
     */
    removeAction(thing) {
      const trigger = this._getButtonActionTrigger(this.actionType)

      const actions = Action
        .query()
        .where('trigger_id', trigger.id)
        .where('device', thing.device.identifier)
        .where('channel', thing.channel.channel)
        .get()

      if (actions.length > 1) {
        actions
          .forEach((action) => {
            Action.dispatch('remove', {
              id: action.id,
            })
              .catch((e) => {
                const errorMessage = this.$t('triggers.messages.actionNotRemoved')

                if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                  this.handleException(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })
          })
      } else {
        Trigger.dispatch('remove', {
          id: trigger.id,
        })
          .catch((e) => {
            const errorMessage = this.$t('things.messages.actionNotRemoved')

            if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
              this.handleException(e.exception, errorMessage)
            } else {
              this.$flashMessage(errorMessage, 'error')
            }
          })
      }
    },

    /**
     * Find thing trigger for given action type (press, click, dblClick, etc.)
     *
     * @param {String} type
     *
     * @private
     */
    _getButtonActionTrigger(type) {
      const trigger = this.triggers.find(({ operand }) => operand === this._mapActionToCode(type))

      if (typeof trigger !== 'undefined') {
        return trigger
      }

      return null
    },

    /**
     * Map action to device trigger code
     *
     * @param {String} action
     *
     * @private
     */
    _mapActionToCode(action) {
      switch (action) {
        case 'press':
          return DEVICE_FASTYBIRD_BUTTON_PRESS

        case 'click':
          return DEVICE_FASTYBIRD_BUTTON_CLICK

        case 'dblClick':
          return DEVICE_FASTYBIRD_BUTTON_DBL_CLICK

        default:
          return null
      }
    },

  },

}
