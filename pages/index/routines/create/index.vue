<template>
  <div class="fb-routines-create-view__container">
    <div v-show="view.opened === null">
      <create-routine
        :type="type"
        :remote-submit.sync="submitForm"
        @view="openView"
        @editCondition="editCondition"
        @editSchedule="editSchedule"
        @editAction="editAction"
      />

      <fb-button
        ref="submit-button"
        variant="primary"
        size="lg"
        block
        mobile
        @click="submit"
      >
        {{ $t('routines.buttons.save.title') }}
        <font-awesome-icon icon="plus" />
      </fb-button>
    </div>

    <select-thing
      v-if="view.opened === view.items.action.name || view.opened === view.items.condition.name"
      :items="view.items[view.opened].items"
      :only-settable="view.opened === view.items.action.name"
      :type-thing="view.opened === view.items.condition.name && isThingCondition"
      :type-sensor="view.opened === view.items.condition.name && isSensorCondition"
      @select="thingSelected"
      @close="closeView"
    />

    <edit-condition
      v-if="view.opened === view.items.conditionThing.name"
      :thing="view.items.conditionThing.thing"
      :type-thing="isThingCondition"
      :type-sensor="isSensorCondition"
      @add="addCondition"
      @remove="removeCondition"
      @back="openView(view.items.condition.name)"
      @close="closeView"
    />

    <edit-condition
      v-if="view.opened === view.items.conditionThingEdit.name"
      :thing="view.items.conditionThingEdit.thing"
      :condition="view.items.conditionThingEdit.item"
      :type-thing="isThingCondition"
      :type-sensor="isSensorCondition"
      @add="addCondition"
      @remove="removeCondition"
      @back="closeView"
      @close="closeView"
    />

    <edit-action
      v-if="view.opened === view.items.actionThing.name"
      :thing="view.items.actionThing.thing"
      @add="addAction"
      @remove="removeAction"
      @back="openView(view.items.action.name)"
      @close="closeView"
    />

    <edit-action
      v-if="view.opened === view.items.actionThingEdit.name"
      :thing="view.items.actionThingEdit.thing"
      :action="view.items.actionThingEdit.item"
      @add="addAction"
      @remove="removeAction"
      @back="closeView"
      @close="closeView"
    />

    <edit-schedule
      v-if="view.opened === view.items.schedule.name"
      :schedule="view.items.schedule.item"
      @add="addSchedule"
      @back="closeOrRedirect(view.items.schedule.name)"
      @close="closeOrRedirect(view.items.schedule.name)"
    />
  </div>
</template>

<script>
import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import {
  ROUTINES_HASH_CREATE,

  ROUTINES_QUERY_TYPE_SCHEDULED,
  ROUTINES_QUERY_TYPE_THING,
  ROUTINES_QUERY_TYPE_SENSOR,
  ROUTINES_QUERY_TYPE_MANUAL,
} from '@/configuration/routes'

import CreateRoutine from '@/components/routines/Create'

import Device from '~/models/devices-node/Device'
import Channel from '~/models/devices-node/Channel'
import Thing from '~/models/Thing'

const SelectThing = () => ({
  component: import('@/components/routines/Phone/SelectThing'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})

const EditCondition = () => ({
  component: import('@/components/routines/Phone/EditCondition'),
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
const EditSchedule = () => ({
  component: import('@/components/routines/Phone/EditSchedule'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})

const viewSettings = {
  opened: null,
  items: {
    condition: {
      name: 'condition',
      items: [],
    },
    conditionThing: {
      name: 'conditionThing',
      thing: null,
    },
    conditionThingEdit: {
      name: 'conditionThingEdit',
      thing: null,
      item: null,
    },
    action: {
      name: 'action',
      items: [],
    },
    actionThing: {
      name: 'actionThing',
      thing: null,
    },
    actionThingEdit: {
      name: 'actionThingEdit',
      thing: null,
      item: null,
    },
    notification: {
      name: 'notification',
    },
    schedule: {
      name: 'schedule',
      item: null,
    },
  },
}

export default {

  name: 'RoutineCreatePage',

  components: {
    CreateRoutine,

    SelectThing,

    EditCondition,
    EditAction,
    EditSchedule,
  },

  transition: 'fade',

  data() {
    return {
      type: this.$route.query.type,
      submitForm: false,
      isScheduled: this.$route.query.type === ROUTINES_QUERY_TYPE_SCHEDULED,
      isThingCondition: this.$route.query.type === ROUTINES_QUERY_TYPE_THING,
      isSensorCondition: this.$route.query.type === ROUTINES_QUERY_TYPE_SENSOR,
      isManual: this.$route.query.type === ROUTINES_QUERY_TYPE_MANUAL,
      view: Object.assign({}, viewSettings),
    }
  },

  computed: {

    /**
     * @returns {String}
     */
    windowSize() {
      return this.$store.state.template.windowSize
    },

  },

  watch: {

    windowSize(val) {
      if (val !== 'xs') {
        this.$router.push(this.localePath({
          name: this.$routes.routines.list,
          hash: `${ROUTINES_HASH_CREATE}-${this.type}`,
        }))
      }
    },

  },

  fetch({ app, store }) {
    store.dispatch('template/resetHeadings', null, {
      root: true,
    })

    store.dispatch('template/resetButtons', null, {
      root: true,
    })

    store.dispatch('template/setLeftButton', {
      name: app.i18n.t('application.buttons.back.title'),
      icon: 'arrow-left',
    }, {
      root: true,
    })

    store.dispatch('template/setRightButton', {
      name: app.i18n.t('application.buttons.cancel.title'),
    }, {
      root: true,
    })

    store.dispatch('template/setFullRowHeading', null, {
      root: true,
    })

    store.dispatch('template/setHeading', {
      heading: app.i18n.t('routines.headings.createRoutine'),
      subHeading: '',
    }, {
      root: true,
    })

    store.dispatch('template/setHeadingIcon', {
      icon: 'project-diagram',
    }, {
      root: true,
    })

    store.dispatch('template/setHeadingInfoText', {
      text: '',
    }, {
      root: true,
    })

    store.dispatch('app/bottomMenuCollapse', null, {
      root: true,
    })
  },

  created() {
    if (
      !this.isScheduled &&
      !this.isThingCondition &&
      !this.isSensorCondition &&
      !this.isManual
    ) {
      this.$router.push(this.localePath(this.$routes.routines.list))
    }
  },

  beforeMount() {
    if (this.windowSize !== null && this.windowSize !== 'xs') {
      this.$router.push(this.localePath({
        name: this.$routes.routines.list,
        hash: `${ROUTINES_HASH_CREATE}-${this.type}`,
      }))

      return
    }

    this._configureNavigation()
  },

  mounted() {
    if (this.isScheduled && this.$store.state.routineCreate.conditions.schedules.length === 0) {
      this.openView(this.view.items.schedule.name)
    }

    this._adjustBodyMargins()
  },

  updated() {
    if (this.view.opened === null) {
      this._adjustBodyMargins()
    }
  },

  beforeDestroy() {
    this.$store.dispatch('routineCreate/clear', {}, {
      root: true,
    })

    this.$store.dispatch('template/setBodyMargin', {
      key: 'custom',
      position: 'bottom',
      margin: 0,
    }, {
      root: true,
    })

    this.$bus.$off('heading_left_button-clicked', this.leftButtonAction)
    this.$bus.$off('heading_right_button-clicked', this.rightButtonAction)
  },

  methods: {

    /**
     * Pass submit call to child component
     */
    submit() {
      this.submitForm = true
    },

    /**
     * Schedule select close action
     *
     * @param {String} view
     */
    closeOrRedirect(view) {
      if (view === this.view.items.schedule.name) {
        if (this.$store.state.routineCreate.conditions.schedules.length === 0) {
          this.$router.push(this.localePath(this.$routes.routines.list))
        } else {
          this.closeView()
        }
      }
    },

    /**
     * Condition or action thing is selected, opening properties select
     *
     * @param {Thing} thing
     */
    thingSelected(thing) {
      if (this.view.opened === this.view.items.action.name) {
        this.view.items.actionThing.thing = thing

        this.openView(this.view.items.actionThing.name)
      } else if (this.view.opened === this.view.items.condition.name) {
        this.view.items.conditionThing.thing = thing

        this.openView(this.view.items.conditionThing.name)
      }
    },

    /**
     * CONDITIONS
     */

    /**
     * CONDITIONS - THINGS
     */

    /**
     * Add condition settings to collection
     *
     * @param {Object} data
     */
    addCondition(data) {
      this.closeView()

      this.$store.dispatch('routineCreate/addCondition', {
        data,
      }, {
        root: true,
      })
    },

    /**
     * Open edit routine action window
     *
     * @param {Object} condition
     */
    editCondition(condition) {
      this.view.items.conditionThingEdit.item = condition

      const device = Device
        .query()
        .where('identifier', condition.device)
        .first()

      if (device === null) {
        return
      }

      const channel = Channel
        .query()
        .where('device_id', device.id)
        .where('channel', condition.channel)
        .first()

      if (channel === null) {
        return
      }

      this.view.items.conditionThingEdit.thing = Thing
        .query()
        .with('device')
        .with('channel')
        .where('channel_id', channel.id)
        .first()

      this.openView(this.view.items.conditionThingEdit.name)
    },

    /**
     * Remove condition settings from collection
     *
     * @param {Thing} thing
     */
    removeCondition(thing) {
      this.$store.dispatch('routineCreate/removeCondition', {
        device: thing.device.identifier,
        channel: thing.channel.channel,
      }, {
        root: true,
      })

      if (this.view.opened === this.view.items.conditionThingEdit.name) {
        this.closeView()
      } else {
        this.openView(this.view.items.condition.name)
      }
    },

    /**
     * CONDITIONS - SCHEDULES
     */

    /**
     * Add condition settings to collection
     *
     * @param {Object} data
     */
    addSchedule(data) {
      this.closeView()

      this.$store.dispatch('routineCreate/addSchedule', {
        data,
      }, {
        root: true,
      })
    },

    /**
     * Open edit routine action window
     *
     * @param {Object} condition
     */
    editSchedule(condition) {
      this.view.items.schedule.item = condition

      this.openView(this.view.items.schedule.name)
    },

    /**
     * ACTIONS
     */

    /**
     * Add action settings to collection
     *
     * @param {Object} data
     */
    addAction(data) {
      this.closeView()

      this.$store.dispatch('routineCreate/addAction', {
        data,
      }, {
        root: true,
      })
    },

    /**
     * Open edit routine action window
     *
     * @param {Object} action
     */
    editAction(action) {
      this.view.items.actionThingEdit.item = action

      const device = Device
        .query()
        .where('identifier', action.device)
        .first()

      if (device === null) {
        return
      }

      const channel = Channel
        .query()
        .where('device_id', device.id)
        .where('channel', action.channel)
        .first()

      if (channel === null) {
        return
      }

      this.view.items.actionThingEdit.thing = Thing
        .query()
        .with('device')
        .with('channel')
        .where('channel_id', channel.id)
        .first()

      this.openView(this.view.items.actionThingEdit.name)
    },

    /**
     * Remove action settings from collection
     *
     * @param {Thing} thing
     */
    removeAction(thing) {
      this.$store.dispatch('routineCreate/removeAction', {
        device: thing.device.identifier,
        channel: thing.channel.channel,
      }, {
        root: true,
      })

      if (this.view.opened === this.view.items.actionThingEdit.name) {
        this.closeView()
      } else {
        this.openView(this.view.items.action.name)
      }
    },

    /**
     * Open selected view
     *
     * @param {String} view
     * @param {Object} [item]
     */
    openView(view, item) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        this.view.opened = view

        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'item') && typeof item !== 'undefined') {
          this.view.items[view].item = item
        }

        if (view === this.view.items.action.name) {
          this.view.items[view].items = this.$store.getters['routineCreate/getActions']()
        } else if (view === this.view.items.condition.name) {
          this.view.items[view].items = this.$store.getters['routineCreate/getThingsConditions']()
        }
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
     * Header left button action event
     */
    leftButtonAction() {
      this.$router.push(this.localePath(this.$routes.routines.list))
    },

    /**
     * Header right button action event
     */
    rightButtonAction() {
      this.$router.push(this.localePath(this.$routes.routines.list))
    },

    /**
     * Configure page header for small devices
     *
     * @private
     */
    _configureNavigation() {
      this.$store.dispatch('template/resetHeadings', null, {
        root: true,
      })

      this.$store.dispatch('template/resetButtons', null, {
        root: true,
      })

      this.$store.dispatch('template/setLeftButton', {
        name: this.$t('application.buttons.back.title'),
        icon: 'arrow-left',
      }, {
        root: true,
      })

      this.$store.dispatch('template/setRightButton', {
        name: this.$t('application.buttons.cancel.title'),
      }, {
        root: true,
      })

      this.$store.dispatch('template/setFullRowHeading', null, {
        root: true,
      })

      let subHeading = ''

      if (this.isScheduled) {
        subHeading = this.$t('routines.subHeadings.createScheduledRoutine')
      } else if (this.isThingCondition) {
        subHeading = this.$t('routines.subHeadings.createThingControlRoutine')
      } else if (this.isSensorCondition) {
        subHeading = this.$t('routines.subHeadings.createSensorRoutine')
      } else if (this.isManual) {
        subHeading = this.$t('routines.subHeadings.createManualRoutine')
      }

      this.$store.dispatch('template/setHeading', {
        heading: this.$t('routines.headings.createRoutine'),
        subHeading,
      }, {
        root: true,
      })

      this.$store.dispatch('template/setHeadingIcon', {
        icon: 'project-diagram',
      }, {
        root: true,
      })

      let infoText = ''

      if (this.isScheduled) {
        infoText = this.$t('routines.texts.createScheduledRoutine')
      } else if (this.isThingCondition) {
        infoText = this.$t('routines.texts.createThingControlRoutine')
      } else if (this.isSensorCondition) {
        infoText = this.$t('routines.texts.createSensorRoutine')
      } else if (this.isManual) {
        infoText = this.$t('routines.texts.createManualRoutine')
      }

      this.$store.dispatch('template/setHeadingInfoText', {
        text: infoText,
      }, {
        root: true,
      })

      this.$store.dispatch('app/bottomMenuCollapse', null, {
        root: true,
      })

      this.$bus.$off('heading_left_button-clicked')
      this.$bus.$off('heading_right_button-clicked')

      this.$bus.$on('heading_left_button-clicked', this.leftButtonAction)
      this.$bus.$on('heading_right_button-clicked', this.rightButtonAction)
    },

    /**
     * Calculate body margins adjust
     *
     * @private
     */
    _adjustBodyMargins() {
      const submitButton = this._.get(this.$refs, 'submit-button')

      if (submitButton) {
        const elementHeight = this._.get(submitButton, '$el.clientHeight')

        this.$store.dispatch('template/setBodyMargin', {
          key: 'custom',
          position: 'bottom',
          margin: elementHeight,
        }, {
          root: true,
        })
      }
    },

  },

  validate({ query }) {
    return [ROUTINES_QUERY_TYPE_SCHEDULED, ROUTINES_QUERY_TYPE_THING, ROUTINES_QUERY_TYPE_SENSOR, ROUTINES_QUERY_TYPE_MANUAL].includes(query.type)
  },

  head() {
    return {
      title: this.$t('meta.routines.create.title'),
    }
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
