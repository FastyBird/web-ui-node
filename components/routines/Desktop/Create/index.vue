<template>
  <fb-modal-window
    :loader="showModalOverlay"
    @close="close"
  >
    <div
      slot="modal-content"
      class="fb-modal-window__content fb-routines-desktop-create__container"
    >
      <div class="fb-modal-window__header">
        <button
          type="button"
          class="fb-modal-window__close"
          @click.prevent="close"
        >
          <span aria-hidden="true">×</span>
          <span class="sr-only">{{ $t('application.buttons.close.title') }}</span>
        </button>

        <div>
          <template v-if="view.opened === view.items.type.name">
            <font-awesome-icon icon="project-diagram" />

            <h4>
              {{ $t('routines.headings.routineType') }}
            </h4>

            <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
          </template>

          <template v-else-if="view.opened === view.items.action.name || view.opened === view.items.condition.name">
            <font-awesome-icon icon="plug" />

            <h4>
              {{ $t('routines.headings.selectThing') }}
            </h4>

            <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
          </template>

          <template v-else-if="view.opened === view.items.conditionThing.name">
            <font-awesome-icon :icon="$thingIcon(view.items.conditionThing.thing)" />

            <h4>
              {{ $tThingChannel(view.items.conditionThing.thing) }}
            </h4>

            <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
          </template>

          <template v-else-if="view.opened === view.items.conditionThingEdit.name">
            <font-awesome-icon :icon="$thingIcon(view.items.conditionThingEdit.thing)" />

            <h4>
              {{ $tThingChannel(view.items.conditionThingEdit.thing) }}
            </h4>

            <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
          </template>

          <template v-else-if="view.opened === view.items.actionThing.name">
            <font-awesome-icon :icon="$thingIcon(view.items.actionThing.thing)" />

            <h4>
              {{ $tThingChannel(view.items.actionThing.thing) }}
            </h4>

            <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
          </template>

          <template v-else-if="view.opened === view.items.actionThingEdit.name">
            <font-awesome-icon :icon="$thingIcon(view.items.actionThingEdit.thing)" />

            <h4>
              {{ $tThingChannel(view.items.actionThingEdit.thing) }}
            </h4>

            <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
          </template>

          <template v-else-if="view.opened === view.items.schedule.name && view.items.schedule.item !== null">
            <font-awesome-icon icon="clock" />

            <h4>
              {{ $t('routines.headings.editSchedule') }}
            </h4>

            <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
          </template>

          <template v-else-if="view.opened === view.items.schedule.name && view.items.schedule.item === null">
            <font-awesome-icon icon="clock" />

            <h4>
              {{ $t('routines.headings.selectSchedule') }}
            </h4>

            <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
          </template>

          <template v-else-if="view.opened === view.items.create.name">
            <font-awesome-icon icon="project-diagram" />

            <h4>
              {{ $t('routines.headings.createRoutine') }}
            </h4>

            <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
          </template>
        </div>
      </div>

      <div class="fb-modal-window__body">
        <div
          v-if="view.opened === view.items.type.name"
          class="fb-routines-desktop-create__select-type"
        >
          <div>
            <fb-button
              block
              variant="outline-primary"
              name="scheduled"
              size="lg"
              @click.prevent="openView(view.items.create.name, view.items.type.types.scheduled)"
            >
              {{ $t('routines.buttons.addTypeTimeOfDay.title') }}
            </fb-button>
          </div>
          <div>
            <fb-button
              block
              variant="outline-primary"
              name="thing"
              size="lg"
              @click.prevent="openView(view.items.create.name, view.items.type.types.thing)"
            >
              {{ $t('routines.buttons.addTypeThingControlled.title') }}
            </fb-button>
          </div>
          <div>
            <fb-button
              block
              variant="outline-primary"
              name="sensor"
              size="lg"
              @click.prevent="openView(view.items.create.name, view.items.type.types.sensor)"
            >
              {{ $t('routines.buttons.addTypeSensorDetect.title') }}
            </fb-button>
          </div>
          <div>
            <fb-button
              block
              variant="outline-primary"
              name="scene"
              size="lg"
              @click.prevent="openView(view.items.create.name, view.items.type.types.manual)"
            >
              {{ $t('routines.buttons.addTypeManual.title') }}
            </fb-button>
          </div>
        </div>

        <create-routine
          v-show="view.opened === view.items.create.name"
          :type="view.items.create.type"
          :remote-submit.sync="submitForm"
          @view="openView"
          @editCondition="editCondition"
          @editSchedule="editSchedule"
          @editAction="editAction"
        />

        <select-thing
          v-if="view.opened === view.items.action.name || view.opened === view.items.condition.name"
          :items="view.items[view.opened].items"
          :type-actor="view.opened === view.items.action.name || (view.opened === view.items.condition.name && isThingCondition)"
          :type-sensor="view.opened === view.items.condition.name && isSensorCondition"
          :remote-submit.sync="submitSelect"
          @select="thingSelected"
          @close="openView(view.items.create.name)"
        />

        <edit-condition
          v-if="view.opened === view.items.conditionThing.name"
          :thing="view.items.conditionThing.thing"
          :type-thing="isThingCondition"
          :type-sensor="isSensorCondition"
          :remote-submit.sync="submitSelect"
          @add="addCondition"
          @remove="removeCondition"
          @back="openView(view.items.condition.name)"
          @close="openView(view.items.create.name)"
        />

        <edit-condition
          v-if="view.opened === view.items.conditionThingEdit.name"
          :thing="view.items.conditionThingEdit.thing"
          :condition="view.items.conditionThingEdit.item"
          :type-thing="isThingCondition"
          :type-sensor="isSensorCondition"
          :remote-submit.sync="submitSelect"
          @add="addCondition"
          @remove="removeCondition"
          @back="openView(view.items.create.name)"
          @close="openView(view.items.create.name)"
        />

        <edit-action
          v-if="view.opened === view.items.actionThing.name"
          :thing="view.items.actionThing.thing"
          :remote-submit.sync="submitSelect"
          @add="addAction"
          @remove="removeAction"
          @back="openView(view.items.action.name)"
          @close="openView(view.items.create.name)"
        />

        <edit-action
          v-if="view.opened === view.items.actionThingEdit.name"
          :thing="view.items.actionThingEdit.thing"
          :action="view.items.actionThingEdit.item"
          :remote-submit.sync="submitSelect"
          @add="addAction"
          @remove="removeAction"
          @back="openView(view.items.create.name)"
          @close="openView(view.items.create.name)"
        />

        <edit-schedule
          v-if="view.opened === view.items.schedule.name"
          :schedule="view.items.schedule.item"
          :remote-submit.sync="submitSelect"
          @add="addSchedule"
          @back="closeOrRedirect(view.items.schedule.name)"
          @close="closeOrRedirect(view.items.schedule.name)"
        />
      </div>

      <div class="fb-modal-window__footer">
        <template v-if="view.opened === view.items.schedule.name">
          <template v-if="view.items.schedule.item === null">
            <fb-button
              uppercase
              variant="link"
              size="lg"
              name="close"
              @click.prevent="close"
            >
              {{ $t('application.buttons.close.title') }}
            </fb-button>
          </template>

          <template v-else>
            <fb-button
              uppercase
              variant="link"
              size="lg"
              name="close"
              @click.prevent="openView(view.items.create.name)"
            >
              {{ $t('application.buttons.back.title') }}
            </fb-button>
          </template>

          <fb-button
            uppercase
            variant="outline-primary"
            size="lg"
            name="save"
            @click.prevent="submitSelection"
          >
            <template v-if="view.items.schedule.item === null">
              {{ $t('routines.buttons.addSchedule.title') }}
            </template>
            <template v-else>
              {{ $t('routines.buttons.updateSchedule.title') }}
            </template>
          </fb-button>
        </template>

        <template v-else-if="view.opened === view.items.action.name || view.opened === view.items.condition.name">
          <fb-button
            uppercase
            variant="link"
            size="lg"
            name="close"
            @click.prevent="openView(view.items.create.name)"
          >
            {{ $t('application.buttons.back.title') }}
          </fb-button>
        </template>

        <template v-else-if="view.opened === view.items.conditionThing.name || view.opened === view.items.conditionThingEdit.name || view.opened === view.items.actionThing.name || view.opened === view.items.actionThingEdit.name">
          <fb-button
            uppercase
            variant="link"
            size="lg"
            name="close"
            @click.prevent="openView(view.items.create.name)"
          >
            {{ $t('application.buttons.back.title') }}
          </fb-button>

          <fb-button
            uppercase
            variant="outline-primary"
            size="lg"
            name="save"
            @click.prevent="submitSelection"
          >
            <template v-if="view.opened === view.items.conditionThingEdit.name || view.opened === view.items.actionThingEdit.name">
              {{ $t('routines.buttons.updateThing.title') }}
            </template>
            <template v-else>
              {{ $t('routines.buttons.addThing.title') }}
            </template>
          </fb-button>
        </template>

        <template v-else-if="view.opened === view.items.type.name">
          <fb-button
            uppercase
            variant="link"
            size="lg"
            name="close"
            @click.prevent="close"
          >
            {{ $t('application.buttons.close.title') }}
          </fb-button>
        </template>

        <template v-else>
          <fb-button
            uppercase
            variant="link"
            size="lg"
            name="close"
            @click.prevent="close"
          >
            {{ $t('application.buttons.close.title') }}
          </fb-button>

          <fb-button
            uppercase
            variant="outline-primary"
            size="lg"
            name="save"
            @click.prevent="submit"
          >
            {{ $t('application.buttons.save.title') }}
          </fb-button>
        </template>
      </div>
    </div>
  </fb-modal-window>
</template>

<script>
import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import {
  ROUTINES_QUERY_TYPE_SCHEDULED,
  ROUTINES_QUERY_TYPE_THING,
  ROUTINES_QUERY_TYPE_SENSOR,
  ROUTINES_QUERY_TYPE_MANUAL,
} from '~/configuration/routes'

import Device from '~/models/devices-node/Device'
import Channel from '~/models/devices-node/Channel'
import Thing from '~/models/things/Thing'

import CreateRoutine from '~/components/routines/Create'
import SelectThing from '~/components/routines/Edit/SelectThing'
import EditCondition from '~/components/routines/Edit/EditCondition'
import EditAction from '~/components/routines/Edit/EditAction'

const EditSchedule = () => ({
  component: import('~/components/routines/Edit/EditSchedule'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})

const viewSettings = {
  opened: 'type',
  items: {
    type: {
      name: 'type',
      types: {
        scheduled: ROUTINES_QUERY_TYPE_SCHEDULED,
        thing: ROUTINES_QUERY_TYPE_THING,
        sensor: ROUTINES_QUERY_TYPE_SENSOR,
        manual: ROUTINES_QUERY_TYPE_MANUAL,
      },
    },
    create: {
      name: 'create',
      type: ROUTINES_QUERY_TYPE_THING,
    },
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
    schedule: {
      name: 'schedule',
      item: null,
    },
  },
}

export default {

  name: 'RoutinesDesktopCreate',

  components: {
    CreateRoutine,

    SelectThing,

    EditCondition,
    EditAction,
    EditSchedule,
  },

  data() {
    return {
      submitForm: false,
      submitSelect: false,
      view: Object.assign({}, viewSettings),
      showModalOverlay: false,
    }
  },

  computed: {

    isScheduled() {
      return this.view.items.create.type === ROUTINES_QUERY_TYPE_SCHEDULED
    },

    isThingCondition() {
      return this.view.items.create.type === ROUTINES_QUERY_TYPE_THING
    },

    isSensorCondition() {
      return this.view.items.create.type === ROUTINES_QUERY_TYPE_SENSOR
    },

    isManual() {
      return this.view.items.create.type === ROUTINES_QUERY_TYPE_MANUAL
    },

  },

  mounted() {
    this.$bus.$on('wait-modal_reloading', (status) => {
      this.showModalOverlay = status
    })
  },

  beforeDestroy() {
    this.$store.dispatch('routineCreate/clear', {}, {
      root: true,
    })

    this.$bus.$off('wait-modal_reloading')
  },

  methods: {

    /**
     * Pass submit call to child component
     */
    submitSelection() {
      this.submitSelect = true
    },

    /**
     * Pass submit call to child component
     */
    submit() {
      this.submitForm = true
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
      this.openView(this.view.items.create.name)

      this.$store.dispatch('routineCreate/addCondition', {
        data,
      }, {
        root: true,
      })
    },

    /**
     * Edit condition settings in collection
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
        this.openView(this.view.items.create.name)
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
      this.openView(this.view.items.create.name)

      this.$store.dispatch('routineCreate/addSchedule', {
        data,
      }, {
        root: true,
      })
    },

    /**
     * Edit condition settings in collection
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
      this.openView(this.view.items.create.name)

      this.$store.dispatch('routineCreate/addAction', {
        data,
      }, {
        root: true,
      })
    },

    /**
     * Edit action settings in collection
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
        this.openView(this.view.items.create.name)
      } else {
        this.openView(this.view.items.action.name)
      }
    },

    /**
     * Open selected view
     *
     * @param {String} view
     * @param {(Object|String)} [item]
     */
    openView(view, item) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        this.view.opened = view

        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'item') && typeof item !== 'undefined') {
          this.view.items[view].item = item
        }

        if (view === this.view.items.create.name && typeof item !== 'undefined') {
          this.view.items[view].type = item

          if (this.isScheduled && this.$store.state.routineCreate.conditions.schedules.length === 0) {
            this.openView(this.view.items.schedule.name)
          }
        } else if (view === this.view.items.action.name) {
          this.view.items[view].items = this.$store.getters['routineCreate/getActions']()
        } else if (view === this.view.items.condition.name) {
          this.view.items[view].items = this.$store.getters['routineCreate/getThingsConditions']()
        }
      }

      this.$el.focus()
    },

    /**
     * Close window
     */
    close() {
      // Reset to default values
      Object.assign(this.view, viewSettings)

      this.$emit('close')
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
