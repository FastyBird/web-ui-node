<template>
  <div class="fb-iot-things-phone-detail-button__container">
    <button-thing
      v-if="view.opened === null || view.opened === view.items.type.name"
      :thing="thing"
      @view="openView"
    />

    <select-thing
      v-if="view.opened === view.items.selectThing.name"
      :items="view.items[view.opened].items"
      :type-actor="true"
      @select="thingSelected"
      @close="closeView"
    />

    <edit-action
      v-if="view.opened === view.items.actionThing.name"
      :thing="view.items.actionThing.thing"
      :action="view.items.actionThing.item"
      @add="addThingAction"
      @remove="removeThingAction"
      @back="openView(view.items.selectThing.name, actionType)"
      @close="closeView"
    />

    <phone-bottom-menu
      :show-header="true"
      :show="view.opened === view.items.type.name"
      :heading="$t('things.headings.newAction')"
      @close="closeView"
    >
      <template slot="items">
        <fb-button
          block
          variant="link"
          name="press"
          @click.prevent="openView(view.items.selectThing.name, 'press')"
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
          @click.prevent="openView(view.items.selectThing.name, 'click')"
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
          @click.prevent="openView(view.items.selectThing.name, 'dblClick')"
        >
          {{ $t('things.buttons.dblClick.title') }}
        </fb-button>
      </template>
    </phone-bottom-menu>
  </div>
</template>

<script>
import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import {
  THINGS_HASH_SETTINGS,
} from '@/configuration/routes'

import buttonThingTriggerMixin from '@/mixins/buttonThingTrigger'

import ButtonThing from '@/components/things/Detail/Things/Button'

import ChannelProperty from '~/models/devices-node/ChannelProperty'
import Trigger from '~/models/triggers-node/Trigger'

const SelectThing = () => ({
  component: import('@/components/routines/Phone/SelectThing'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const EditAction = () => ({
  component: import('@/components/routines/Phone/EditAction'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})

const viewSettings = {
  opened: null,
  items: {
    type: {
      name: 'type',
    },
    selectThing: {
      name: 'selectThing',
      items: [],
      item: null,
    },
    actionThing: {
      name: 'actionThing',
      thing: null,
      item: null,
    },
  },
}

export default {

  name: 'ThingsPhoneDetailButton',

  components: {
    ButtonThing,

    SelectThing,
    EditAction,
  },

  mixins: [buttonThingTriggerMixin],

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      view: Object.assign({}, viewSettings),
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

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked')
    this.$bus.$off('heading_right_button-clicked')
    this.$bus.$off('heading_action_button-clicked')
  },

  methods: {

    /**
     * Action thing is selected, opening properties select
     *
     * @param {Thing} thing
     */
    thingSelected(thing) {
      if (this.view.opened === this.view.items.selectThing.name) {
        this.view.items.actionThing.thing = thing

        this.openView(this.view.items.actionThing.name)
      } else {
        this.closeView()
      }
    },

    /**
     * Add thing action to button trigger
     *
     * @param {Object} data
     */
    addThingAction(data) {
      this.closeView()

      this.addAction(data)
    },

    /**
     * Remove thing action from button trigger
     *
     * @param {Thing} thing
     */
    removeThingAction(thing) {
      this.closeView()

      this.removeAction(thing)
    },

    /**
     * Open selected view
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
          const storedAction = this.mapActions(this._getButtonActionTrigger(this.actionType))
            .find(({ channel_id }) => channel_id === this.view.items.actionThing.thing.id)

          if (typeof storedAction !== 'undefined') {
            this.view.items[view].item = storedAction
          }
        }

        // Open things select window
        if (view === this.view.items.selectThing.name) {
          this.actionType = type

          this.view.items[view].items = this._getButtonActionTrigger(type) ? this.mapActions(this._getButtonActionTrigger(type)) : []
        }

        this._configureNavigation()
      }
    },

    /**
     * Close opened view
     */
    closeView() {
      // Reset to default values
      Object.assign(this.view, viewSettings)

      this._configureNavigation()
    },

    /**
     * Configure page header for small devices
     *
     * @private
     */
    _configureNavigation() {
      this.$store.dispatch('template/resetStore', null, {
        root: true,
      })

      this.$store.dispatch('template/setLeftButton', {
        name: this.$t('application.buttons.back.title'),
        icon: 'arrow-left',
      }, {
        root: true,
      })

      if (this.$route.hash.includes(THINGS_HASH_SETTINGS)) {
        this.$store.dispatch('template/setRightButton', {
          name: this.$t('application.buttons.close.title'),
        }, {
          root: true,
        })
      } else {
        this.$store.dispatch('template/setRightButton', {
          name: this.$t('application.buttons.edit.title'),
        }, {
          root: true,
        })
      }

      this.$store.dispatch('template/setFullRowHeading', null, {
        root: true,
      })

      this.$store.dispatch('template/setHeading', {
        heading: this.$tThingChannel(this.thing),
        subHeading: this.$tThingDevice(this.thing),
      }, {
        root: true,
      })

      this.$store.dispatch('template/setHeadingIcon', {
        icon: this.$thingIcon(this.thing),
      }, {
        root: true,
      })

      if (this.triggers.length) {
        this.$store.dispatch('template/setActionButton', {
          name: this.$t('application.buttons.add.title'),
        }, {
          root: true,
        })
      }

      this.$store.dispatch('app/bottomMenuCollapse', null, {
        root: true,
      })

      this.$bus.$on('heading_left_button-clicked', () => {
        this.$router.push(this.localePath(this.$routes.things.list))
      })

      this.$bus.$on('heading_right_button-clicked', () => {
        if (this.$route.hash.includes(THINGS_HASH_SETTINGS)) {
          this.$router.push(this.localePath({
            name: this.$routes.things.detail,
            params: {
              id: this.thing.id,
            },
          }))
        } else {
          this.$router.push(this.localePath({
            name: this.$routes.things.detail,
            params: {
              id: this.thing.id,
            },
            hash: THINGS_HASH_SETTINGS,
          }))
        }
      })

      this.$bus.$on('heading_action_button-clicked', () => {
        this.openView(this.view.items.type.name)
      })
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
