<template>
  <div class="fb-modal-window__content fb-routines-create__container">
    <div class="fb-modal-window__header">
      <button
        type="button"
        class="fb-modal-window__close"
        @click.prevent="$emit('close')"
      >
        <span aria-hidden="true">×</span>
        <span class="sr-only">{{ $t('application.buttons.close.title') }}</span>
      </button>

      <div>
        <font-awesome-icon icon="clock" />

        <h4 v-if="view.opened === view.items.action.name || view.opened === view.items.condition.name">
          {{ $t('routines.headings.selectThing') }}
        </h4>
        <h4 v-if="view.opened === view.items.conditionThing.name">
          {{ $tThing(view.items.conditionThing.thing) }}
        </h4>
        <h4 v-if="view.opened === view.items.conditionThingEdit.name">
          {{ $tThing(view.items.conditionThingEdit.thing) }}
        </h4>
        <h4 v-if="view.opened === view.items.actionThing.name">
          {{ $tThing(view.items.actionThing.thing) }}
        </h4>
        <h4 v-if="view.opened === view.items.actionThingEdit.name">
          {{ $tThing(view.items.actionThingEdit.thing) }}
        </h4>
        <h4 v-if="view.opened === view.items.schedule.name && view.items.schedule.item !== null">
          {{ $t('routines.headings.editSchedule') }}
        </h4>
        <h4 v-if="view.opened === view.items.schedule.name && view.items.schedule.item === null">
          {{ $t('routines.headings.selectSchedule') }}
        </h4>
        <h4 v-if="view.opened === null">
          {{ $t('routines.headings.createRoutine') }}
        </h4>

        <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
      </div>
    </div>

    <div class="fb-modal-window__body">
      <create-routine
        v-show="view.opened === null"
        :type="type"
        :remote-submit.sync="submitForm"
        @view="openView"
        @editCondition="editCondition"
        @editSchedule="editSchedule"
        @editAction="editAction"
      />

      <select-thing
        v-if="view.opened === view.items.action.name || view.opened === view.items.condition.name"
        :items="view.items[view.opened].items"
        :only-settable="view.opened === view.items.action.name"
        :type-thing="view.opened === view.items.condition.name && isThingCondition"
        :type-sensor="view.opened === view.items.condition.name && isSensorCondition"
        :remote-submit.sync="submitSelect"
        @select="thingSelected"
        @close="closeView(view.opened)"
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
        @close="closeView(view.items.conditionThing.name)"
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
        @back="closeView(view.items.conditionThingEdit.name)"
        @close="closeView(view.items.conditionThingEdit.name)"
      />

      <edit-action
        v-if="view.opened === view.items.actionThing.name"
        :thing="view.items.actionThing.thing"
        :remote-submit.sync="submitSelect"
        @add="addAction"
        @remove="removeAction"
        @back="openView(view.items.action.name)"
        @close="closeView(view.items.actionThing.name)"
      />

      <edit-action
        v-if="view.opened === view.items.actionThingEdit.name"
        :thing="view.items.actionThingEdit.thing"
        :action="view.items.actionThingEdit.item"
        :remote-submit.sync="submitSelect"
        @add="addAction"
        @remove="removeAction"
        @back="closeView(view.items.actionThingEdit.name)"
        @close="closeView(view.items.actionThingEdit.name)"
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
            @click.prevent="$emit('close')"
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
            @click.prevent="closeView(view.opened)"
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
          @click.prevent="closeView(view.opened)"
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
          @click.prevent="closeView(view.opened)"
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

      <template v-else>
        <fb-button
          uppercase
          variant="link"
          size="lg"
          name="close"
          @click.prevent="$emit('close')"
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
</template>

<script>
import {
  ROUTINES_QUERY_TYPE_SCHEDULED,
  ROUTINES_QUERY_TYPE_THING,
  ROUTINES_QUERY_TYPE_SENSOR,
  ROUTINES_QUERY_TYPE_MANUAL,
} from '@/configuration/routes'

const CreateRoutine = () => import('@/components/routines/Create')

const SelectThing = () => import('@/components/routines/Edit/SelectThing')

const EditCondition = () => import('@/components/routines/Edit/EditCondition')
const EditAction = () => import('@/components/routines/Edit/EditAction')
const EditSchedule = () => import('@/components/routines/Edit/EditSchedule')

export default {

  name: 'RoutinesDesktopCreate',

  components: {
    CreateRoutine,

    SelectThing,

    EditCondition,
    EditAction,
    EditSchedule,
  },

  props: {

    type: {
      type: String,
      required: true,
    },

  },

  data() {
    return {
      submitForm: false,
      submitSelect: false,
      isScheduled: this.type === ROUTINES_QUERY_TYPE_SCHEDULED,
      isThingCondition: this.type === ROUTINES_QUERY_TYPE_THING,
      isSensorCondition: this.type === ROUTINES_QUERY_TYPE_SENSOR,
      isManual: this.type === ROUTINES_QUERY_TYPE_MANUAL,
      view: {
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
      },
    }
  },

  mounted() {
    if (this.isScheduled && this.$store.state.routineCreate.conditions.schedules.length === 0) {
      this.openView(this.view.items.schedule.name)
    }
  },

  beforeDestroy() {
    this.$store.dispatch('routineCreate/clear', {}, {
      root: true,
    })
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
      this.closeView(this.view.items.conditionThing.name)

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
      this.view.items.conditionThingEdit.thing = this.$store.getters['entities/thing/query']()
        .with('device')
        .with('channel')
        .with('channel.properties')
        .where('id', condition.thing)
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
        thing,
      }, {
        root: true,
      })

      if (this.view.opened === this.view.items.conditionThingEdit.name) {
        this.closeView(this.view.items.conditionThingEdit.name)
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
      this.closeView(this.view.items.schedule.name)

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
      this.closeView(this.view.items.actionThing.name)

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
      this.view.items.actionThingEdit.thing = this.$store.getters['entities/thing/query']()
        .with('device')
        .with('channel')
        .with('channel.properties')
        .where('id', action.thing)
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
        thing,
      }, {
        root: true,
      })

      if (this.view.opened === this.view.items.actionThingEdit.name) {
        this.closeView(this.view.items.actionThingEdit.name)
      } else {
        this.openView(this.view.items.action.name)
      }
    },

    /**
     * Open routines view
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

      this.$el.focus()
    },

    /**
     * Close routines view window
     *
     * @param {String} view
     */
    closeView(view) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        this.view.opened = null

        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'item')) {
          this.view.items[view].item = null
        }
      }

      this.$el.focus()
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
