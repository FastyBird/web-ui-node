<template>
  <div class="fb-routines-detail__container">
    <list-items-container
      v-if="routine.isAutomatic && schedule === null"
      :heading="$t('routines.headings.conditions')"
    >
      <list-condition
        v-for="(condition, index) in conditions"
        :key="`c-${index}`"
        :condition="condition"
        class="fb-routines-detail__conditions-container"
        @toggle="toggleConditionState(index)"
        @remove="confirmRemoveCondition(index)"
      />

      <template v-if="conditions.length === 0">
        <no-results
          :message="$t('routines.texts.noConditions')"
          icon="project-diagram"
          second-icon="plus"
        />

        <div class="fb-routines-detail__new-condition">
          <fb-button
            variant="outline-primary"
            name="press"
            @click.prevent="$emit('view', 'conditionThing')"
          >
            {{ $t('routines.buttons.addCondition.title') }}
          </fb-button>
        </div>
      </template>
    </list-items-container>

    <list-items-container :heading="$t('routines.headings.actions')">
      <list-action
        v-for="(action, index) in actions"
        :key="`a-${index}`"
        :action="action"
        class="fb-routines-detail__actions-container"
        @toggle="toggleActionState(index)"
        @remove="confirmRemoveAction(index)"
      />

      <template v-if="actions.length === 0">
        <no-results
          :message="$t('routines.texts.noActions')"
          icon="project-diagram"
          second-icon="plus"
        />

        <div class="fb-routines-detail__new-action">
          <fb-button
            variant="outline-primary"
            name="press"
            @click.prevent="$emit('view', 'actionThing')"
          >
            {{ $t('routines.buttons.addAction.title') }}
          </fb-button>
        </div>
      </template>
    </list-items-container>

    <fb-confirmation-window
      v-if="remove.show"
      :transparent-bg="transparentModal"
      icon="trash"
      @confirmed="removeItem"
      @close="resetRemoveConfirmation"
    >
      <template v-if="remove.type === 'condition'">
        <template slot="header">
          {{ $t('routines.headings.removeCondition') }}
        </template>

        <template slot="question">
          <i18n
            path="routines.messages.confirmRemoveCondition"
            tag="p"
          >
            <strong slot="thing">{{ $tThingChannel(remove.thing) }}</strong>
          </i18n>
        </template>
      </template>

      <template v-if="remove.type === 'action'">
        <template slot="header">
          {{ $t('routines.headings.removeAction') }}
        </template>

        <template slot="question">
          <i18n
            path="routines.messages.confirmRemoveAction"
            tag="p"
          >
            <strong slot="thing">{{ $tThingChannel(remove.thing) }}</strong>
          </i18n>
        </template>
      </template>
    </fb-confirmation-window>
  </div>
</template>

<script>
import routineUpdateMixin from '@/mixins/routineUpdate'

import Device from '~/models/devices-node/Device'
import Channel from '~/models/devices-node/Channel'
import Thing from '~/models/Thing'

const ListAction = () => import('./ListAction')
const ListCondition = () => import('./ListCondition')

export default {

  name: 'RoutinesDetail',

  components: {
    ListAction,
    ListCondition,
  },

  mixins: [routineUpdateMixin],

  props: {

    routine: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      transparentModal: false,
      remove: {
        show: false,
        type: null,
        index: null,
        thing: null,
      },
    }
  },

  computed: {

    /**
     * Remap trigger conditions to routine conditions
     *
     * @returns {Array}
     */
    conditions() {
      return this.mapConditions(this.routine)
    },

    /**
     * Remap trigger actions to routine actions
     *
     * @returns {Array}
     */
    actions() {
      return this.mapActions(this.routine)
    },

    /**
     * Routine schedule condition
     *
     * @returns {(Condition|null)}
     */
    schedule() {
      const condition = this.routine.conditions.find(item => item.isTime)

      if (typeof condition === 'undefined') {
        return null
      }

      return condition
    },

  },

  created() {
    this.transparentModal = this.$parent.$options.name !== 'Layout'
  },

  beforeMount() {
    if (!Thing.getters('firstLoadFinished')()) {
      Thing.dispatch('fetch')
        .catch(() => {
          this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        })
    }
  },

  methods: {

    /**
     * Change condition state
     *
     * @param {Number} index
     */
    toggleConditionState(index) {
      if (Object.prototype.hasOwnProperty.call(this.conditions, index)) {
        this.changeConditionState(this.conditions[index], !this.conditions[index].enabled)
      }
    },

    /**
     * Change action state
     *
     * @param {Number} index
     */
    toggleActionState(index) {
      if (Object.prototype.hasOwnProperty.call(this.actions, index)) {
        this.changeActionState(this.actions[index], !this.actions[index].enabled)
      }
    },

    /**
     * Show remove confirmation window for condition
     *
     * @param {Number} index
     */
    confirmRemoveCondition(index) {
      const device = Device
        .query()
        .where('identifier', this.conditions[index].device)
        .first()

      if (device === null) {
        return
      }

      const channel = Channel
        .query()
        .where('device_id', device.id)
        .where('channel', this.conditions[index].channel)
        .first()

      if (channel === null) {
        return
      }

      const thing = Thing
        .query()
        .with('device')
        .with('channel')
        .where('channel_id', channel.id)
        .first()

      this.remove.show = true
      this.remove.type = 'condition'
      this.remove.index = index
      this.remove.thing = thing
    },

    /**
     * Show remove confirmation window for action
     *
     * @param {Number} index
     */
    confirmRemoveAction(index) {
      const device = Device
        .query()
        .where('identifier', this.actions[index].device)
        .first()

      if (device === null) {
        return
      }

      const channel = Channel
        .query()
        .where('device_id', device.id)
        .where('channel', this.actions[index].channel)
        .first()

      if (channel === null) {
        return
      }

      const thing = Thing
        .query()
        .with('device')
        .with('channel')
        .where('channel_id', channel.id)
        .first()

      this.remove.show = true
      this.remove.type = 'action'
      this.remove.index = index
      this.remove.thing = thing
    },

    /**
     * Close remove confirmation window
     */
    resetRemoveConfirmation() {
      this.remove.show = false
      this.remove.type = null
      this.remove.index = null
      this.remove.thing = null
    },

    /**
     * Remove was confirmed
     */
    removeItem() {
      if (this.remove.type === 'condition') {
        if (Object.prototype.hasOwnProperty.call(this.conditions, this.remove.index)) {
          this.removeRoutineCondition(this.routine, this.remove.thing)
        }
      } else if (this.remove.type === 'action') {
        if (Object.prototype.hasOwnProperty.call(this.actions, this.remove.index)) {
          this.removeRoutineAction(this.routine, this.remove.thing)
        }
      }

      this.resetRemoveConfirmation()
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
