<template>
  <form
    class="fb-routines-create__container"
    @submit.prevent="submit"
  >
    <fb-form-input
      v-model="form.model.name"
      v-validate="'required'"
      :data-vv-scope="form.scope"
      :error="errors.first(form.scope + '.name')"
      :has-error="errors.has(form.scope + '.name')"
      :name="'name'"
      :label="$t('routines.fields.name.title')"
      :required="true"
      :tab-index="1"
    />

    <fb-form-text-area
      v-model="form.model.comment"
      :data-vv-scope="form.scope"
      :error="errors.first(form.scope + '.comment')"
      :has-error="errors.has(form.scope + '.comment')"
      :name="'comment'"
      :label="$t('routines.fields.comment.title')"
      :tab-index="2"
    />

    <template v-if="isThingCondition || isSensorCondition">
      <h3 class="fb-routines-create__heading">
        {{ $t('routines.headings.addCondition') }}
      </h3>

      <fb-button
        variant="outline-default"
        block
        @click="$emit('view', 'condition')"
      >
        <font-awesome-icon icon="plus-circle" />
        <span>{{ $t('routines.buttons.addThing.title') }}</span>
      </fb-button>
    </template>

    <template v-if="isThingCondition || isSensorCondition">
      <list-condition
        v-for="(condition, index) in conditions"
        :key="`c-${index}`"
        :condition="condition"
        class="fb-routines-create__items"
        @edit="editCondition(index)"
        @toggle="toggleConditionState(index)"
      />

      <hr>
    </template>

    <template v-if="isScheduled">
      <h3 class="fb-routines-create__heading">
        {{ $t('routines.headings.scheduledTime') }}
      </h3>

      <div class="fb-routines-create__items">
        <list-schedule
          v-for="(schedule, index) in schedules"
          :key="`s-${index}`"
          :schedule="schedule"
          class="fb-routines-create__items"
          @edit="editSchedule(index)"
        />
      </div>

      <hr>
    </template>

    <h3 class="fb-routines-create__heading">
      {{ $t('routines.headings.addAction') }}
    </h3>

    <fb-button
      variant="outline-default"
      block
      @click="$emit('view', 'action')"
    >
      <font-awesome-icon icon="plus-circle" />
      <span>{{ $t('routines.buttons.addThing.title') }}</span>
    </fb-button>

    <div class="fb-routines-create__items">
      <list-action
        v-for="(action, index) in actions"
        :key="`a-${index}`"
        :action="action"
        :index="index"
        class="fb-routines-create__items"
        @edit="editAction(index)"
        @toggle="toggleActionState(index)"
      />
    </div>
  </form>
</template>

<script>
import {
  ROUTINES_QUERY_TYPE_SCHEDULED,
  ROUTINES_QUERY_TYPE_THING,
  ROUTINES_QUERY_TYPE_SENSOR,
  ROUTINES_QUERY_TYPE_MANUAL,
} from '~/configuration/routes'

import Trigger from '~/models/triggers-node/Trigger'

import {
  TRIGGERS_ACTION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_CHANNEL_PROPERTY,
  TRIGGERS_CONDITION_TIME,
} from '~/models/triggers-node/types'

const ListCondition = () => import('~/components/routines/Edit/ListCondition')
const ListAction = () => import('~/components/routines/Edit/ListAction')
const ListSchedule = () => import('~/components/routines/Edit/ListSchedule')

export default {

  name: 'RoutinesCreate',

  components: {
    ListCondition,
    ListAction,
    ListSchedule,
  },

  props: {

    type: {
      type: String,
      required: true,
    },

    remoteSubmit: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      isScheduled: this.type === ROUTINES_QUERY_TYPE_SCHEDULED,
      isThingCondition: this.type === ROUTINES_QUERY_TYPE_THING,
      isSensorCondition: this.type === ROUTINES_QUERY_TYPE_SENSOR,
      isManual: this.type === ROUTINES_QUERY_TYPE_MANUAL,
      form: {
        scope: 'routines_create',
        model: {
          name: '',
          comment: '',
        },
      },
    }
  },

  computed: {

    /**
     * @returns {String}
     */
    windowSize() {
      return this.$store.state.template.windowSize
    },

    /**
     * Get all assigned schedule conditions
     *
     * @returns {Array}
     */
    schedules() {
      return this.$store.getters['routineCreate/getSchedulesConditions']()
    },

    /**
     * Get all assigned conditions with things
     *
     * @returns {Array}
     */
    conditions() {
      return this.$store.getters['routineCreate/getThingsConditions']()
    },

    /**
     * Get all assigned actions
     *
     * @returns {Array}
     */
    actions() {
      return this.$store.getters['routineCreate/getActions']()
    },

  },

  watch: {

    remoteSubmit(val) {
      if (val) {
        this.submit()
      }
    },

    type(val) {
      this.isScheduled = val === ROUTINES_QUERY_TYPE_SCHEDULED
      this.isThingCondition = val === ROUTINES_QUERY_TYPE_THING
      this.isSensorCondition = val === ROUTINES_QUERY_TYPE_SENSOR
      this.isManual = val === ROUTINES_QUERY_TYPE_MANUAL
    },

  },

  beforeMount() {
    this.$validator.localize({
      en: {
        custom: {
          name: {
            required: this.$t('routines.fields.name.validation.required'),
          },
        },
      },
    })
  },

  methods: {

    /**
     * Open edit routine action window
     *
     * @param {Number} index
     */
    editCondition(index) {
      if (Object.prototype.hasOwnProperty.call(this.$store.state.routineCreate.conditions.things, index)) {
        if (Object.prototype.hasOwnProperty.call(this.$store.state.routineCreate.conditions.things, index)) {
          this.$emit('editCondition', this.$store.state.routineCreate.conditions.things[index])
        }
      }
    },

    /**
     * Change action state
     *
     * @param {Number} index
     */
    toggleConditionState(index) {
      if (Object.prototype.hasOwnProperty.call(this.$store.state.routineCreate.conditions.things, index)) {
        this.$store.dispatch('routineCreate/toggleCondition', {
          device: this.$store.state.routineCreate.conditions.things[index].device,
          channel: this.$store.state.routineCreate.conditions.things[index].channel,
        }, {
          root: true,
        })
      }
    },

    /**
     * Open edit routine action window
     *
     * @param {Number} index
     */
    editSchedule(index) {
      if (Object.prototype.hasOwnProperty.call(this.$store.state.routineCreate.conditions.schedules, index)) {
        if (Object.prototype.hasOwnProperty.call(this.$store.state.routineCreate.conditions.schedules, index)) {
          this.$emit('editSchedule', this.$store.state.routineCreate.conditions.schedules[index])
        }
      }
    },

    /**
     * Open edit routine action window
     *
     * @param {Number} index
     */
    editAction(index) {
      if (Object.prototype.hasOwnProperty.call(this.$store.state.routineCreate.actions, index)) {
        if (Object.prototype.hasOwnProperty.call(this.$store.state.routineCreate.actions, index)) {
          this.$emit('editAction', this.$store.state.routineCreate.actions[index])
        }
      }
    },

    /**
     * Change action state
     *
     * @param {Number} index
     */
    toggleActionState(index) {
      if (Object.prototype.hasOwnProperty.call(this.$store.state.routineCreate.actions, index)) {
        this.$store.dispatch('routineCreate/toggleAction', {
          device: this.$store.state.routineCreate.actions[index].device,
          channel: this.$store.state.routineCreate.actions[index].channel,
        }, {
          root: true,
        })
      }
    },

    /**
     * ROUTINE GLOBAL
     */

    submit() {
      this.$emit('update:remoteSubmit', false)

      this.$validator.validateAll(this.form.scope)
        .then((result) => {
          if (result) {
            if (
              (
                (this.isThingCondition || this.isSensorCondition) &&
                this.$store.state.routineCreate.conditions.things.length <= 0
              ) ||
              (
                this.isScheduled &&
                this.$store.state.routineCreate.conditions.schedules.length <= 0
              )
            ) {
              this.$flashMessage(this.$t('routines.messages.missingCondition'), 'error')

              return
            }

            if (
              this.$store.state.routineCreate.actions.length <= 0 &&
              this.$store.state.routineCreate.notifications.length <= 0
            ) {
              this.$flashMessage(this.$t('routines.messages.missingActionOrNotification'), 'error')

              return
            }

            if (this.windowSize === 'xs') {
              this.$bus.$emit('wait-page_reloading', true)
            } else {
              this.$bus.$emit('wait-modal_reloading', true)
            }

            const errorMessage = this.$t('routines.messages.notCreated', {
              routine: this.form.model.name,
            })

            const mappedConditions = []

            this.$store.state.routineCreate.conditions.things.forEach((condition) => {
              condition.rows.forEach((row) => {
                mappedConditions.push({
                  type: TRIGGERS_CONDITION_CHANNEL_PROPERTY,
                  enabled: condition.enabled,
                  device: condition.device,
                  channel: condition.channel,
                  property: row.property,
                  operator: row.operator,
                  operand: row.operand,
                })
              })
            })

            this.$store.state.routineCreate.conditions.schedules.forEach((condition) => {
              mappedConditions.push({
                type: TRIGGERS_CONDITION_TIME,
                enabled: true,
                time: this.$dateFns.format(condition.time, 'yyyy-MM-dd\'T\'HH:mm:ssXXXXX'),
                days: condition.days,
              })
            })

            const mappedActions = []

            this.$store.state.routineCreate.actions.forEach((action) => {
              action.rows.forEach((row) => {
                mappedActions.push({
                  type: TRIGGERS_ACTION_CHANNEL_PROPERTY,
                  enabled: action.enabled,
                  device: action.device,
                  channel: action.channel,
                  property: row.property,
                  value: row.operation,
                })
              })
            })

            Trigger.dispatch('add', {
              automatic: !this.isManual,
              manual: this.isManual,
              data: {
                name: this.form.model.name,
                comment: this.form.model.comment,
                enabled: true,
                conditions: mappedConditions,
                actions: mappedActions,
                notifications: [],
              },
            })
              .then((routine) => {
                if (this.windowSize === 'xs') {
                  this.$bus.$emit('wait-page_reloading', false)
                } else {
                  this.$bus.$emit('wait-modal_reloading', false)
                }

                this.$router.push(this.localePath({
                  name: this.$routes.routines.detail,
                  params: {
                    id: routine.id,
                  },
                }))
              })
              .catch((e) => {
                if (this.windowSize === 'xs') {
                  this.$bus.$emit('wait-page_reloading', false)
                } else {
                  this.$bus.$emit('wait-modal_reloading', false)
                }

                if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                  this.handleFormError(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })
          }
        })
        .catch((e) => {
          if (!this.isDev && Object.prototype.hasOwnProperty.call(this, '$sentry')) {
            this.$sentry.captureException(e)
          }
        })
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
