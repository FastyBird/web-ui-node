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
        v-for="(condition, index) in thingConditions"
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
          v-for="(schedule, index) in scheduleConditions"
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
import { mapState } from 'vuex'

import {
  ROUTINES_QUERY_TYPE_SCHEDULED,
  ROUTINES_QUERY_TYPE_THING,
  ROUTINES_QUERY_TYPE_SENSOR,
  ROUTINES_QUERY_TYPE_MANUAL,
} from '@/configuration/routes'

const ListCondition = () => import('@/components/routines/Edit/ListCondition')
const ListAction = () => import('@/components/routines/Edit/ListAction')
const ListSchedule = () => import('@/components/routines/Edit/ListSchedule')

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

    ...mapState('theme', {
      windowSize: state => state.windowSize,
    }),

    /**
     * Get all assigned conditions with things
     *
     * @returns {Array}
     */
    thingConditions() {
      return this.$store.getters['routineCreate/getThingsConditions']()
    },

    /**
     * Get all assigned schedule conditions
     *
     * @returns {Array}
     */
    scheduleConditions() {
      return this.$store.getters['routineCreate/getSchedulesConditions']()
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
          thingId: this.$store.state.routineCreate.conditions.things[index].thing,
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
          thingId: this.$store.state.routineCreate.actions[index].thing,
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
                  type: 'channel_property',
                  enabled: condition.enabled,
                  channel: condition.thing,
                  property: row.property_id,
                  operator: row.operator,
                  operand: row.operand,
                })
              })
            })

            this.$store.state.routineCreate.conditions.schedules.forEach((condition) => {
              mappedConditions.push({
                type: 'time',
                enabled: true,
                time: this.$dateFns.format(condition.time, 'yyyy-MM-dd\'T\'HH:mm:ssXXXXX'),
                days: condition.days,
              })
            })

            const mappedActions = []

            this.$store.state.routineCreate.actions.forEach((action) => {
              action.rows.forEach((row) => {
                mappedActions.push({
                  type: 'channel_property',
                  enabled: action.enabled,
                  channel: action.thing,
                  property: row.property_id,
                  value: row.operation,
                })
              })
            })

            this.$store.dispatch('entities/trigger/add', {
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
            }, {
              root: true,
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
          if (Object.prototype.hasOwnProperty.call(this, '$sentry')) {
            this.$sentry.captureException(e)
          }
        })
    },

    _sortItemsThings(items) {
      return items.sort((a, b) => {
        const aThing = this.$store.getters['entities/thing/find'](a.thing)
        const bThing = this.$store.getters['entities/thing/find'](b.thing)

        if (aThing.label > bThing.label) {
          return -1
        } else if (bThing.label > aThing.label) {
          return 1
        }

        return 0
      })
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
