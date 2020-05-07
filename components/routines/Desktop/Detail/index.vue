<template>
  <off-canvas-body
    v-if="routine"
    :heading="routine.name"
    :sub-heading="subHeading"
  >
    <template slot="left-button">
      <button
        class="button"
        @click.prevent="handleLeftButton"
      >
        <font-awesome-icon
          v-if="view.opened !== view.items.settings.name"
          icon="times"
        />
        <font-awesome-icon
          v-else
          icon="arrow-left"
        />
      </button>
    </template>

    <template slot="right-button">
      <button
        v-if="view.opened !== view.items.settings.name"
        class="button"
        @click.prevent="openView(view.items.settings.name)"
      >
        <font-awesome-icon icon="cogs" />
      </button>
      <button
        v-if="view.opened === view.items.settings.name"
        class="button"
        @click.prevent="$emit('close')"
      >
        <font-awesome-icon icon="times" />
      </button>
    </template>

    <transition
      slot="body"
      name="fade"
      mode="out-in"
    >
      <div
        v-if="view.opened !== view.items.settings.name"
        :style="`height: ${offCanvasHeight}px`"
        class="fb-routines-list-view__off-canvas-body"
      >
        <routine-detail
          :routine="routine"
          @view="openView"
        />

        <fb-button
          variant="outline-primary"
          uppercase
          pill
          class="fb-routines-desktop-detail__add-button"
          @click.prevent="openView('type')"
        >
          <font-awesome-icon icon="plus" />
        </fb-button>

        <fb-modal-window
          v-if="view.opened !== view.items.detail.name && view.opened !== view.items.settings.name"
          :transparent-bg="true"
          @close="closeView"
        >
          <div
            slot="modal-content"
            class="fb-modal-window__content fb-routines-desktop-detail__create"
          >
            <div class="fb-modal-window__header">
              <button
                type="button"
                class="fb-modal-window__close"
                @click.prevent="closeView"
              >
                <span aria-hidden="true">×</span>
                <span class="sr-only">{{ $t('application.buttons.close.title') }}</span>
              </button>

              <div>
                <template v-if="view.opened === view.items.type.name">
                  <font-awesome-icon icon="project-diagram" />

                  <h4>
                    {{ $t('routines.headings.addNew') }}
                  </h4>

                  <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
                    consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
                </template>

                <template v-else-if="view.opened === view.items.conditionThing.name || view.opened === view.items.conditionSensor.name || view.opened === view.items.actionThing.name">
                  <font-awesome-icon icon="plug" />

                  <h4 v-if="view.opened === view.items.conditionThing.name">
                    {{ $t('routines.headings.typeThing') }}
                  </h4>

                  <h4 v-if="view.opened === view.items.conditionSensor.name">
                    {{ $t('routines.headings.typeSensor') }}
                  </h4>

                  <h4 v-if="view.opened === view.items.actionThing.name">
                    {{ $t('routines.headings.typeActor') }}
                  </h4>

                  <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
                    consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
                </template>

                <template v-else-if="view.opened === view.items.condition.name">
                  <font-awesome-icon :icon="$thingIcon(view.items.condition.thing)" />

                  <h4>
                    {{ $tThingChannel(view.items.condition.thing) }}
                  </h4>

                  <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
                    consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
                </template>

                <template v-else-if="view.opened === view.items.action.name">
                  <font-awesome-icon :icon="$thingIcon(view.items.action.thing)" />

                  <h4>
                    {{ $tThingChannel(view.items.action.thing) }}
                  </h4>

                  <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit,
                    consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
                </template>
              </div>
            </div>

            <div class="fb-modal-window__body">
              <div
                v-if="view.opened === view.items.type.name"
                class="fb-routines-desktop-detail__type"
              >
                <template v-if="routine.isAutomatic && routine.schedule === null">
                  <div class="fb-routines-desktop-detail__type-row">
                    <div>
                      <fb-button
                        block
                        variant="outline-primary"
                        size="lg"
                        name="condition"
                        @click.prevent="openView(view.items.conditionThing.name)"
                      >
                        {{ $t('routines.buttons.thingToCondition.title') }}
                      </fb-button>
                    </div>
                    <div>
                      <fb-button
                        block
                        variant="outline-primary"
                        size="lg"
                        name="condition"
                        @click.prevent="openView(view.items.conditionSensor.name)"
                      >
                        {{ $t('routines.buttons.sensorToCondition.title') }}
                      </fb-button>
                    </div>
                  </div>

                  <fb-divider
                    :text="$t('application.misc.or')"
                    type="horizontal"
                  />
                </template>

                <div class="fb-routines-desktop-detail__type-row">
                  <div>
                    <fb-button
                      block
                      variant="outline-primary"
                      size="lg"
                      name="action"
                      @click.prevent="openView(view.items.actionThing.name)"
                    >
                      {{ $t('routines.buttons.thingToAction.title') }}
                    </fb-button>
                  </div>
                </div>
              </div>

              <select-thing
                v-if="view.opened === view.items.conditionThing.name || view.opened === view.items.conditionSensor.name || view.opened === view.items.actionThing.name"
                :items="view.items[view.opened].items"
                :type-actor="view.opened === view.items.actionThing.name || (view.opened === view.items.conditionThing.name)"
                :type-sensor="view.opened === view.items.conditionSensor.name"
                @select="thingSelected"
              />

              <edit-condition
                v-if="view.opened === view.items.condition.name"
                :thing="view.items.condition.thing"
                :condition="view.items.condition.item"
                :type-thing="view.items.condition.type === 'thing'"
                :type-sensor="view.items.condition.type === 'sensor'"
                :remote-submit.sync="submitSelect"
                @add="addCondition"
              />

              <edit-action
                v-if="view.opened === view.items.action.name"
                :thing="view.items.action.thing"
                :action="view.items.action.item"
                :remote-submit.sync="submitSelect"
                @add="addAction"
              />
            </div>

            <div class="fb-modal-window__footer">
              <template v-if="view.opened === view.items.type.name || view.opened === view.items.conditionThing.name || view.opened === view.items.conditionSensor.name || view.opened === view.items.actionThing.name">
                <fb-button
                  uppercase
                  variant="link"
                  size="lg"
                  name="close"
                  @click.prevent="closeView"
                >
                  {{ $t('application.buttons.close.title') }}
                </fb-button>
              </template>

              <template v-else-if="view.opened === view.items.condition.name">
                <fb-button
                  uppercase
                  variant="link"
                  size="lg"
                  name="close"
                  @click.prevent="openView(view.items.condition.type === 'thing' ? view.items.conditionThing.name : view.items.conditionSensor.name)"
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
                  <template v-if="view.items.condition.item">
                    {{ $t('routines.buttons.updateThing.title') }}
                  </template>
                  <template v-else>
                    {{ $t('routines.buttons.addThing.title') }}
                  </template>
                </fb-button>
              </template>

              <template v-else-if="view.opened === view.items.action.name">
                <fb-button
                  uppercase
                  variant="link"
                  size="lg"
                  name="close"
                  @click.prevent="openView(view.items.actionThing.name)"
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
                  <template v-if="view.items.action.item">
                    {{ $t('routines.buttons.updateThing.title') }}
                  </template>
                  <template v-else>
                    {{ $t('routines.buttons.addThing.title') }}
                  </template>
                </fb-button>
              </template>
            </div>
          </div>
        </fb-modal-window>
      </div>

      <routine-settings
        v-else
        :routine="routine"
        :style="`height: ${offCanvasHeight}px`"
        class="fb-routines-list-view__off-canvas-body"
        @removed="$emit('close')"
      />
    </transition>
  </off-canvas-body>
</template>

<script>
import FbComponentLoading from '@/node_modules/@fastybird-com/ui-theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/ui-theme/components/UI/FbComponentLoadingError'

import {
  ROUTINES_HASH_DETAIL,
  ROUTINES_HASH_SETTINGS,
} from '~/configuration/routes'

import Routine from '~/models/routines/Routine'
import RoutineAction from '~/models/routines/RoutineAction'
import RoutineCondition from '~/models/routines/RoutineCondition'

import RoutineDetail from '~/components/routines/Detail'

import SelectThing from '~/components/routines/Edit/SelectThing'
import EditCondition from '~/components/routines/Edit/EditCondition'
import EditAction from '~/components/routines/Edit/EditAction'
import Thing from '~/models/things/Thing'

const RoutineSettings = () => ({
  component: import('~/components/routines/Settings'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 10000,
})

const viewSettings = {
  opened: 'detail',
  items: {
    detail: {
      name: 'detail',
      route: {
        hash: ROUTINES_HASH_DETAIL,
        length: 8,
      },
    },
    settings: {
      name: 'settings',
      route: {
        hash: ROUTINES_HASH_SETTINGS,
        length: 10,
      },
    },
    type: {
      name: 'type',
    },
    conditionThing: {
      name: 'conditionThing',
      items: [],
    },
    conditionSensor: {
      name: 'conditionSensor',
      items: [],
    },
    condition: {
      name: 'condition',
      thing: null,
      item: null,
      type: null,
    },
    actionThing: {
      name: 'actionThing',
      items: [],
    },
    action: {
      name: 'action',
      thing: null,
      item: null,
    },
  },
}

export default {

  name: 'RoutinesDesktopDetail',

  components: {
    RoutineDetail,
    RoutineSettings,

    SelectThing,
    EditCondition,
    EditAction,
  },

  props: {

    id: {
      type: String,
      required: true,
    },

    settings: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      view: Object.assign({}, viewSettings),
      offCanvasHeight: null,
      submitSelect: false,
    }
  },

  computed: {

    /**
     * View routine data
     *
     * @returns {Routine}
     */
    routine() {
      return Routine
        .query()
        .with('trigger')
        .with('actions')
        .with('actions.rows')
        .with('actions.rows.action')
        .with('conditions')
        .with('conditions.rows')
        .with('conditions.rows.condition')
        .with('schedule')
        .with('schedule.condition')
        .where('id', this.id)
        .first()
    },

    /**
     * Get window sub-heading
     *
     * @returns {String}
     */
    subHeading() {
      let days = ''

      if (this.routine.schedule !== null) {
        if (this.routine.schedule.days.length === 7) {
          days = this.$t('routines.texts.everyday')
        } else {
          days = []

          for (const day of this.routine.schedule.days) {
            switch (day) {
              case 1:
                days.push(this.$t('application.days.mon.short'))
                break

              case 2:
                days.push(this.$t('application.days.tue.short'))
                break

              case 3:
                days.push(this.$t('application.days.wed.short'))
                break

              case 4:
                days.push(this.$t('application.days.thu.short'))
                break

              case 5:
                days.push(this.$t('application.days.fri.short'))
                break

              case 6:
                days.push(this.$t('application.days.sat.short'))
                break

              case 7:
                days.push(this.$t('application.days.sun.short'))
                break
            }
          }

          days = days.join(', ')
        }
      }

      return this.routine.isAutomatic ? (this.routine.schedule !== null ? this.$t('routines.headings.scheduledRoutine', {
        days,
        time: this.$dateFns.format(this.routine.schedule.time, this._.get(this.account, 'timeFormat', 'HH:mm')),
      }) : this.$t('routines.headings.automaticRoutine')) : this.$t('routines.headings.manualRoutine')
    },

  },

  created() {
    this.view.opened = this.settings ? this.view.items.settings.name : this.view.items.detail.name
  },

  mounted() {
    this._calculateWindowHeight()

    window.addEventListener('resize', this._calculateWindowHeight)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this._calculateWindowHeight)
  },

  methods: {

    /**
     * Switch detail display according to actual state
     */
    handleLeftButton() {
      if (this.view.opened === this.view.items.detail.name) {
        this.$emit('close')
      } else if (this.view.opened === this.view.items.settings.name) {
        this.openView(this.view.items.detail.name)
      }
    },

    /**
     * Open selected view
     *
     * @param {String} view
     */
    openView(view) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        switch (view) {
          case this.view.items.detail.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({
                name: this.$routes.routines.detail,
                params: {
                  id: this.routine.id,
                },
              }))
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.routines.list,
                hash: `${this.view.items.detail.route.hash}-${this.routine.id}`,
              }))
            }
            break

          case this.view.items.settings.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({
                name: this.$routes.routines.detail,
                params: {
                  id: this.routine.id,
                },
                hash: ROUTINES_HASH_SETTINGS,
              }))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.routines.list,
                hash: `${this.view.items.settings.route.hash}-${this.routine.id}`,
              }))
            }
            break

          // Select add item type
          case this.view.items.type.name:
            if (this.routine.schedule !== null || this.routine.isManual) {
              this.openView(this.view.items.actionThing.name)

              return
            }
            break

          // Show things list for condition select
          case this.view.items.conditionThing.name:
          case this.view.items.conditionSensor.name:
            const conditionThings = []

            this.routine.conditions
              .forEach((condition) => {
                if (typeof conditionThings.find(item => (item.device === condition.device && item.channel === condition.channel)) === 'undefined') {
                  conditionThings.push(
                    Thing
                      .query()
                      .with('device')
                      .whereHas('device', (query) => {
                        query.where('identifier', condition.device)
                      })
                      .with('channel')
                      .whereHas('channel', (query) => {
                        query.where('channel', condition.channel)
                      })
                      .first(),
                  )
                }
              })

            this.view.items[view].items = conditionThings
            break

          // Show condition configuration
          case this.view.items.condition.name:
            const storedCondition = this.routine.conditions
              .find(item => (item.device === this.view.items.condition.thing.device.identifier && item.channel === this.view.items.condition.thing.channel.channel))

            if (typeof storedCondition !== 'undefined') {
              this.view.items[view].item = storedCondition
            } else {
              this.view.items[view].item = null
            }
            break

          // Show things list for action select
          case this.view.items.actionThing.name:
            const actionThings = []

            this.routine.actions
              .forEach((action) => {
                if (typeof actionThings.find(item => (item.device === action.device && item.channel === action.channel)) === 'undefined') {
                  actionThings.push(
                    Thing
                      .query()
                      .with('device')
                      .whereHas('device', (query) => {
                        query.where('identifier', action.device)
                      })
                      .with('channel')
                      .whereHas('channel', (query) => {
                        query.where('channel', action.channel)
                      })
                      .first(),
                  )
                }
              })

            this.view.items[view].items = actionThings
            break

          // Show action configuration
          case this.view.items.action.name:
            const storedAction = this.routine.actions
              .find(item => (item.device === this.view.items.action.thing.device.identifier && item.channel === this.view.items.action.thing.channel.channel))

            if (typeof storedAction !== 'undefined') {
              this.view.items[view].item = storedAction
            } else {
              this.view.items[view].item = null
            }
            break
        }

        this.view.opened = view
      }
    },

    /**
     * Close opened view
     */
    closeView() {
      // Reset to default values
      Object.assign(this.view, viewSettings)
    },

    /**
     * Pass submit call to child component
     */
    submitSelection() {
      this.submitSelect = true
    },

    /**
     * Condition or action thing is selected, opening properties select
     *
     * @param {Thing} thing
     */
    thingSelected(thing) {
      if (this.view.opened === this.view.items.actionThing.name) {
        this.view.items.action.thing = thing

        this.openView(this.view.items.action.name)
      } else if (
        this.view.opened === this.view.items.conditionThing.name ||
        this.view.opened === this.view.items.conditionSensor.name
      ) {
        this.view.items.condition.thing = thing
        this.view.items.condition.type = this.view.opened === this.view.items.conditionThing.name ? 'thing' : (this.view.opened === this.view.items.conditionSensor.name ? 'sensor' : null)

        this.openView(this.view.items.condition.name)
      } else {
        this.closeView()
      }
    },

    /**
     * Condition was selected
     *
     * @param {Object} data
     * @param {(RoutineCondition|null)} condition
     */
    addCondition(data, condition) {
      this.openView(this.view.items.detail.name)

      if (condition !== null) {
        RoutineCondition.dispatch('edit', {
          id: condition.id,
          data,
        })
      } else {
        RoutineCondition.dispatch('add', {
          routine: this.routine,
          data,
        })
      }
    },

    /**
     * Action was selected
     *
     * @param {Object} data
     * @param {(RoutineAction|null)} action
     */
    addAction(data, action) {
      this.openView(this.view.items.detail.name)

      if (action !== null) {
        RoutineAction.dispatch('edit', {
          id: action.id,
          data,
        })
      } else {
        RoutineAction.dispatch('add', {
          routine: this.routine,
          data,
        })
          .catch((e) => {
            const errorMessageNotCreated = this.$t('routines.messages.actionNotCreated', {
              routine: this.routine.name,
            })

            if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
              this.handleFormError(e.exception, errorMessageNotCreated)
            } else {
              this.$flashMessage(errorMessageNotCreated, 'error')
            }
          })
      }
    },

    /**
     * Calculate viewport size after window resizing
     *
     * @private
     */
    _calculateWindowHeight() {
      this.offCanvasHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
