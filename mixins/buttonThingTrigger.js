import routinesMixin from './routines'

import {
  DEVICE_FASTYBIRD_BUTTON_PRESS,
  DEVICE_FASTYBIRD_BUTTON_CLICK,
  DEVICE_FASTYBIRD_BUTTON_DBL_CLICK,
} from '@/configuration/devices'

export default {

  mixins: [routinesMixin],

  data() {
    return {
      actionType: null,
    }
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
            return item.thing === data.thing
          })

        this._.get(data, 'rows', [])
          .forEach((row) => {
            if (
              typeof triggerAction !== 'undefined' &&
              typeof this._.get(triggerAction, 'rows', []).find(({ property_id }) => property_id === row.property_id) !== 'undefined'
            ) {
              const triggerActionProperty = this._.get(triggerAction, 'rows', [])
                .find(({ property_id }) => property_id === row.property_id)

              // Update existing trigger action
              this.$store.dispatch('entities/action/edit', {
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
              this.$store.dispatch('entities/action/add', {
                trigger,
                data: {
                  type: 'channel_property',
                  enabled: data.enabled,
                  channel: data.thing,
                  property: row.property_id,
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
            }
          })
      } else {
        const mappedActions = []

        this._.get(data, 'rows', [])
          .forEach((row) => {
            mappedActions.push({
              type: 'channel_property',
              enabled: data.enabled,
              channel: data.thing,
              property: row.property_id,
              value: row.operation,
            })
          })

        // Create new trigger with remapped actions
        this.$store.dispatch('entities/trigger/add', {
          channelProperty: true,
          data: {
            name: this.thing.device_id,
            comment: this.thing.channel_id,
            channel: this.thing.channel_id,
            enabled: true,
            property: this._.first(this.thing.channel.properties).id,
            operator: 'eq',
            operand: this._mapActionToCode(this.actionType),
            actions: mappedActions,
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

      const thingActions = this._.filter(mappedActions, action => action.thing === thing.id)

      if (mappedActions.length > 1) {
        thingActions.forEach((action) => {
          this.removeTriggerAction(action)
        })
      } else {
        this.$store.dispatch('entities/trigger/remove', {
          id: trigger.id,
        }, {
          root: true,
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
