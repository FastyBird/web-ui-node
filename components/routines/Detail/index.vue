<template>
  <div class="fb-routines-detail__container">
    <list-items-container
      v-if="routine.isAutomatic && routine.schedule === null"
      :heading="$t('routines.headings.conditions')"
    >
      <template v-for="condition in routine.conditions">
        <list-condition
          v-if="!condition.deleted"
          :key="condition.id"
          :condition="condition"
          class="fb-routines-detail__conditions-container"
          @toggle="toggleConditionState(condition)"
          @remove="confirmRemoveCondition(condition)"
        />
      </template>

      <template v-if="routine.conditions.length === 0">
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
      <template v-for="action in routine.actions">
        <list-action
          v-if="!action.deleted"
          :key="action.id"
          :action="action"
          class="fb-routines-detail__actions-container"
          @toggle="toggleActionState(action)"
          @remove="confirmRemoveAction(action)"
        />
      </template>

      <template v-if="routine.actions.length === 0">
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
import Device from '~/models/devices-node/Device'
import Channel from '~/models/devices-node/Channel'
import Thing from '~/models/things/Thing'
import RoutineAction from '~/models/routines/RoutineAction'
import RoutineCondition from '~/models/routines/RoutineCondition'

const ListAction = () => import('./ListAction')
const ListCondition = () => import('./ListCondition')

export default {

  name: 'RoutinesDetail',

  components: {
    ListAction,
    ListCondition,
  },

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
        item: null,
        thing: null,
      },
    }
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
     * @param {RoutineConditionInterface} condition
     */
    toggleConditionState(condition) {
      RoutineCondition.dispatch('toggleState', {
        id: condition.id,
      })
    },

    /**
     * Change action state
     *
     * @param {RoutineActionInterface} action
     */
    toggleActionState(action) {
      RoutineAction.dispatch('toggleState', {
        id: action.id,
      })
    },

    /**
     * Show remove confirmation window for condition
     *
     * @param {RoutineConditionInterface} condition
     */
    confirmRemoveCondition(condition) {
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

      const thing = Thing
        .query()
        .with('device')
        .with('channel')
        .where('channel_id', channel.id)
        .first()

      this.remove.show = true
      this.remove.type = 'condition'
      this.remove.item = condition
      this.remove.thing = thing
    },

    /**
     * Show remove confirmation window for action
     *
     * @param {RoutineActionInterface} action
     */
    confirmRemoveAction(action) {
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

      const thing = Thing
        .query()
        .with('device')
        .with('channel')
        .where('channel_id', channel.id)
        .first()

      this.remove.show = true
      this.remove.type = 'action'
      this.remove.item = action
      this.remove.thing = thing
    },

    /**
     * Close remove confirmation window
     */
    resetRemoveConfirmation() {
      this.remove.show = false
      this.remove.type = null
      this.remove.item = null
      this.remove.thing = null
    },

    /**
     * Remove was confirmed
     */
    removeItem() {
      if (this.remove.type === 'condition') {
        RoutineCondition.dispatch('remove', {
          id: this.remove.item.id,
        })
      } else if (this.remove.type === 'action') {
        RoutineAction.dispatch('remove', {
          id: this.remove.item.id,
        })
      }

      this.resetRemoveConfirmation()
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
