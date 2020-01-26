<template>
  <div class="fb-iot-pages-things-detail-button__container">
    <button-thing
      v-if="view.opened === null || view.opened === view.items.type.name"
      :thing="thing"
      @view="openView"
    />

    <select-thing
      v-if="view.opened === view.items.action.name"
      :items="view.items[view.opened].items"
      :only-settable="true"
      @select="thingSelected"
      @close="closeView(view.opened)"
    />

    <edit-action
      v-if="view.opened === view.items.actionThing.name"
      :thing="view.items.actionThing.thing"
      :action="view.items.actionThing.item"
      @add="addTriggerAction"
      @remove="removeTriggerAction"
      @back="openView(view.items.action.name, view.actionType)"
      @close="closeView(view.items.actionThing.name)"
    />

    <mobile-bottom-menu
      :show-header="true"
      :show="view.opened === view.items.type.name"
      :heading="$t('things.headings.newAction')"
      @close="closeView(view.items.type.name)"
    >
      <template slot="items">
        <fb-button
          block
          variant="link"
          name="press"
          @click.prevent="openView(view.items.action.name, 'press')"
        >
          {{ $t('things.buttons.press.title') }}
        </fb-button>

        <fb-divider
          text="OR"
          type="horizontal"
        />

        <fb-button
          block
          variant="link"
          name="click"
          @click.prevent="openView(view.items.action.name, 'click')"
        >
          {{ $t('things.buttons.click.title') }}
        </fb-button>

        <fb-divider
          text="OR"
          type="horizontal"
        />

        <fb-button
          block
          variant="link"
          name="dblClick"
          @click.prevent="openView(view.items.action.name, 'dblClick')"
        >
          {{ $t('things.buttons.dblClick.title') }}
        </fb-button>
      </template>
    </mobile-bottom-menu>
  </div>
</template>

<script>
import {
  DEVICE_FASTYBIRD_BUTTON_PRESS,
  DEVICE_FASTYBIRD_BUTTON_CLICK,
  DEVICE_FASTYBIRD_BUTTON_DBL_CLICK,
} from '@/configuration/devices'

import {
  THINGS_HASH_SETTINGS,
} from '@/configuration/routes'

import triggersMixin from '@/mixins/triggers'

import ButtonThing from '@/components/things/Detail/Things/Button'

const SelectThing = () => import('@/components/routines/Phone/SelectThing')
const EditAction = () => import('@/components/routines/Phone/EditAction')

export default {

  name: 'PagesThingsDetailButton',

  components: {
    ButtonThing,

    SelectThing,
    EditAction,
  },

  mixins: [triggersMixin],

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      view: {
        opened: null,
        actionType: null,
        items: {
          type: {
            name: 'type',
          },
          action: {
            name: 'action',
            items: [],
            item: null,
          },
          actionThing: {
            name: 'actionThing',
            thing: null,
            item: null,
          },
        },
      },
    }
  },

  computed: {

    /**
     * Thing direct triggers
     *
     * @returns {Array}
     */
    triggers() {
      if (typeof this._.first(this.thing.channel.properties) === 'undefined') {
        return []
      }

      return this.$store.getters['entities/trigger/query']()
        .with('condition')
        .with('actions')
        .where('channel_id', this.thing.channel_id)
        .where('property_id', this._.first(this.thing.channel.properties).id)
        .orderBy('operand', 'asc')
        .all()
    },

  },

  watch: {

    '$route'() {
      this._configureNavigation()
    },

    triggers() {
      this._configureNavigation()
    },

  },

  created() {
    this._configureNavigation()
  },

  methods: {

    /**
     * Action thing is selected, opening properties select
     *
     * @param {Thing} thing
     */
    thingSelected(thing) {
      if (this.view.opened === this.view.items.action.name) {
        this.view.items.actionThing.thing = thing

        this.openView(this.view.items.actionThing.name)
      } else {
        this.closeView()
      }
    },

    /**
     * Add action settings to collection
     *
     * @param {Object} data
     */
    addTriggerAction(data) {
      this.closeView(this.view.items.actionThing.name)

      const errorMessage = this.$t('things.messages.triggerNotCreated')

      const trigger = this._getButtonActionTrigger(this.view.actionType)

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
            operand: this._mapActionToCode(this.view.actionType),
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
    removeTriggerAction(thing) {
      const trigger = this._getButtonActionTrigger(this.view.actionType)

      this.closeView(this.view.items.actionThing.name)

      const mappedActions = this.mapActions(trigger)

      const thingActions = this._.filter(mappedActions, action => action.thing === thing.id)

      if (mappedActions.length > 1) {
        thingActions.forEach((action) => {
          this.removeAction(action)
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
     * Open triggers view
     *
     * @param {String} view
     * @param {String} [type]
     */
    openView(view, type) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        this.view.opened = view

        // Open thing detail window
        if (view === this.view.items.actionThing.name) {
          this.view.items[view].item = null

          // Try to find existing action via thing identifier
          const storedAction = this.mapActions(this._getButtonActionTrigger(this.view.actionType))
            .find(({ channel_id }) => channel_id === this.view.items.actionThing.thing.id)

          if (typeof storedAction !== 'undefined') {
            this.view.items[view].item = storedAction
          }
        }

        // Open things select window
        if (view === this.view.items.action.name) {
          this.view.actionType = type

          this.view.items[view].items = this._getButtonActionTrigger(type) ? this.mapActions(this._getButtonActionTrigger(type)) : []
        }

        this._configureNavigation()
      }
    },

    /**
     * Close triggers view window
     *
     * @param {String} view
     */
    closeView(view) {
      this.view.opened = null

      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'item')) {
          this.view.items[view].item = null
        }
      }

      this._configureNavigation()
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

    /**
     * Configure page header for small devices
     *
     * @private
     */
    _configureNavigation() {
      this.$store.dispatch('header/resetStore', null, {
        root: true,
      })

      this.$store.dispatch('header/setLeftButton', {
        name: this.$t('application.buttons.back.title'),
        link: this.localePath(this.$routes.things.list),
        icon: 'arrow-left',
      }, {
        root: true,
      })

      if (this.$route.hash.includes(THINGS_HASH_SETTINGS)) {
        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.close.title'),
          callback: () => {
            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: this.thing.id,
              },
            }))
          },
        }, {
          root: true,
        })
      } else {
        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.edit.title'),
          callback: () => {
            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: this.thing.id,
              },
              hash: THINGS_HASH_SETTINGS,
            }))
          },
        }, {
          root: true,
        })
      }

      this.$store.dispatch('header/setFullRowHeading', null, {
        root: true,
      })

      this.$store.dispatch('header/setHeading', {
        heading: this.$tThing(this.thing),
        subHeading: this.$tThingDevice(this.thing),
      }, {
        root: true,
      })

      this.$store.dispatch('header/setHeadingIcon', {
        icon: this.$thingIcon(this.thing),
      }, {
        root: true,
      })

      if (this.triggers.length) {
        this.$store.dispatch('header/setAddButton', {
          name: this.$t('application.buttons.add.title'),
          callback: () => {
            this.openView(this.view.items.type.name)
          },
        }, {
          root: true,
        })
      }

      this.$store.dispatch('bottomNavigation/resetStore', null, {
        root: true,
      })

      this.$store.dispatch('bottomNavigation/hideNavigation', null, {
        root: true,
      })
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
