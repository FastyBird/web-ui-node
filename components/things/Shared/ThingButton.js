import routinesMixin from '~/mixins/routines'

import {
  DEVICE_FASTYBIRD_BUTTON_PRESS,
  DEVICE_FASTYBIRD_BUTTON_CLICK,
  DEVICE_FASTYBIRD_BUTTON_DBL_CLICK,
} from '~/configuration/devices'

import Trigger from '~/models/triggers-node/Trigger'
import Action from '~/models/triggers-node/Action'
import ChannelProperty from '~/models/devices-node/ChannelProperty'

import {
  TRIGGERS_ACTION_CHANNEL_PROPERTY,
} from '~/models/triggers-node/types'

export default {

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  mixins: [routinesMixin],

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
        .where('channel_id', this.thing.channel_id)
        .first()

      if (property === null) {
        return []
      }

      return Trigger
        .query()
        .with('condition')
        .with('actions')
        .where('device', this.thing.device.identifier)
        .where('channel', this.thing.channel.channel)
        .where('property', property.property)
        .orderBy('operand', 'asc')
        .get()
    },

  },

  methods: {

    /**
     * Add action settings to collection
     *
     * @param {Object} data
     */
    addAction(data) {
      const errorMessage = this.$t('things.messages.triggerNotCreated')

      const trigger = this._getButtonActionTrigger(this.actionType)

      if (trigger) {
        const triggerAction = this.mapActions(trigger)
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
              }, {
                root: true,
              })
                .catch((e) => {
                  if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                    this.handleFormError(e.exception, errorMessage)
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
                  type: TRIGGERS_ACTION_CHANNEL_PROPERTY,
                  enabled: data.enabled,
                  device: data.device,
                  channel: data.channel,
                  property: row.property,
                  value: row.operation,
                },
              })
                .catch((e) => {
                  if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                    this.handleFormError(e.exception, errorMessage)
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
              type: TRIGGERS_ACTION_CHANNEL_PROPERTY,
              enabled: !!data.enabled,
              device: data.device,
              channel: data.channel,
              property: row.property,
              value: row.operation,
            })
          })

        const property = ChannelProperty
          .query()
          .where('channel_id', this.thing.channel_id)
          .first()

        // Create new trigger with remapped actions
        Trigger.dispatch('add', {
          channelProperty: true,
          data: {
            name: this.thing.device_id,
            comment: this.thing.channel_id,
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
              this.handleFormError(e.exception, errorMessage)
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

      const mappedActions = this.mapActions(trigger)

      const thingActions = this._.filter(mappedActions, action => (action.device === thing.device.identifier && action.channel === thing.channel.channel))

      if (mappedActions.length > 1) {
        thingActions.forEach((action) => {
          action.rows
            .forEach((row) => {
              Action.dispatch('remove', {
                id: row.action_id,
              })
                .catch((e) => {
                  const errorMessage = this.$t('triggers.messages.actionNotRemoved')

                  if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                    this.handleFormError(e.exception, errorMessage)
                  } else {
                    this.$flashMessage(errorMessage, 'error')
                  }
                })
            })
        })
      } else {
        Trigger.dispatch('remove', {
          id: trigger.id,
        })
          .catch((e) => {
            const errorMessage = this.$t('things.messages.actionNotRemoved')

            if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
              this.handleFormError(e.exception, errorMessage)
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
