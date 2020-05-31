<template>
  <div class="fb-routines-detail-view__container">
    <fb-loading-box
      v-if="fetchingRoutine && routine === null"
      :text="$t('texts.loading')"
    />

    <template v-else-if="routine !== null">
      <routine-detail
        v-if="view.opened === view.items.detail.name || view.opened === view.items.settings.name || view.opened === view.items.type.name"
        ref="detail"
        :routine="routine"
      />

      <routine-settings
        v-if="view.opened === view.items.settings.name"
        ref="settings"
        v-body-scroll-lock="true"
        :routine="routine"
        class="fb-routines-detail-view__container-settings"
        @removed="routineRemoved"
      />

      <phone-bottom-menu
        :show-header="true"
        :show="view.opened === view.items.type.name"
        :heading="$t('routines.headings.addNew')"
        @close="openView(view.items.detail.name)"
      >
        <template slot="items">
          <template v-if="routine.isAutomatic && routine.schedule === null">
            <fb-button
              block
              variant="link"
              name="condition"
              @click.prevent="openView(view.items.conditionThing.name)"
            >
              {{ $t('routines.buttons.thingToCondition.title') }}
            </fb-button>

            <fb-divider
              :text="$t('application.misc.or')"
              type="vertical"
            />

            <fb-button
              block
              variant="link"
              name="condition"
              @click.prevent="openView(view.items.conditionSensor.name)"
            >
              {{ $t('routines.buttons.sensorToCondition.title') }}
            </fb-button>

            <fb-divider
              :text="$t('application.misc.or')"
              type="vertical"
            />
          </template>

          <fb-button
            block
            variant="link"
            name="action"
            @click.prevent="openView(view.items.actionThing.name)"
          >
            {{ $t('routines.buttons.thingToAction.title') }}
          </fb-button>
        </template>
      </phone-bottom-menu>

      <select-thing
        v-if="view.opened === view.items.conditionThing.name || view.opened === view.items.conditionSensor.name || view.opened === view.items.actionThing.name"
        :items="view.items[view.opened].items"
        :only-settable="view.opened === view.items.actionThing.name"
        :type-thing="view.opened === view.items.conditionThing.name"
        :type-sensor="view.opened === view.items.conditionSensor.name"
        @select="thingSelected"
        @close="openView(view.items.detail.name)"
      />

      <edit-condition
        v-if="view.opened === view.items.condition.name"
        :thing="view.items.condition.thing"
        :condition="view.items.condition.item"
        :type-thing="view.items.condition.type === 'thing'"
        :type-sensor="view.items.condition.type === 'sensor'"
        @add="addCondition"
        @remove="removeCondition"
        @back="openView(view.items.condition.type === 'thing' ? view.items.conditionThing.name : view.items.conditionSensor.name)"
        @close="openView(view.items.detail.name)"
      />

      <edit-action
        v-if="view.opened === view.items.action.name"
        :thing="view.items.action.thing"
        :action="view.items.action.item"
        @add="addAction"
        @remove="removeAction"
        @back="openView(view.items.actionThing.name)"
        @close="openView(view.items.detail.name)"
      />
    </template>
  </div>
</template>

<script>
import get from 'lodash/get'

import FbComponentLoading from '@/node_modules/@fastybird-com/web-ui-theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/web-ui-theme/components/UI/FbComponentLoadingError'

import {
  ROUTINES_HASH_DETAIL,
  ROUTINES_HASH_SETTINGS,
} from '~/configuration/routes'

import Routine from '~/models/routines/Routine'
import RoutineAction from '~/models/routines/RoutineAction'
import RoutineCondition from '~/models/routines/RoutineCondition'

import RoutineDetail from '~/components/routines/Detail'
import RoutineSettings from '~/components/routines/Settings'
import SelectThing from '~/components/routines/Phone/SelectThing'
import Thing from '~/models/things/Thing'

const EditCondition = () => ({
  component: import('~/components/routines/Phone/EditCondition'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 10000,
})
const EditAction = () => ({
  component: import('~/components/routines/Phone/EditAction'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 10000,
})

const viewSettings = {
  opened: 'detail', // Detail is by default
  items: {
    detail: {
      name: 'detail',
      route: {
        hash: ROUTINES_HASH_DETAIL,
      },
    },
    settings: {
      name: 'settings',
      route: {
        hash: ROUTINES_HASH_SETTINGS,
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
      items: [],
      type: null,
    },
    actionThing: {
      name: 'actionThing',
      items: [],
    },
    action: {
      name: 'action',
      thing: null,
      items: [],
    },
  },
}

export default {

  name: 'RoutineDetailPage',

  components: {
    RoutineDetail,
    RoutineSettings,

    SelectThing,
    EditCondition,
    EditAction,
  },

  transition: 'fade',

  data() {
    return {
      id: this.$route.params.id,
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
     * Flag signalizing that routines are loading from server
     *
     * @returns {Boolean}
     */
    fetchingRoutines() {
      return Routine.getters('fetching')()
    },

    /**
     * Flag signalizing that routine is loading from server
     *
     * @returns {Boolean}
     */
    fetchingRoutine() {
      return Routine.getters('getting')(this.id)
    },

  },

  watch: {

    routine(val) {
      if (val) {
        this._configureNavigation()
      }
    },

    windowSize(val) {
      if (val !== 'xs') {
        if (this.$route.hash !== '') {
          if (this.$route.hash.includes(ROUTINES_HASH_SETTINGS)) {
            this.$router.push(this.localePath({
              name: this.$routes.routines.list,
              hash: `${ROUTINES_HASH_SETTINGS}-${this.id}`,
            }))
          }
        } else {
          this.$router.push(this.localePath({
            name: this.$routes.routines.list,
            hash: `${ROUTINES_HASH_DETAIL}-${this.id}`,
          }))
        }
      }
    },

    fetchingRoutine(val) {
      if (!val && this.routine === null) {
        this.$nuxt.error({ statusCode: 404, message: 'Routine Not Found' })
      }
    },

  },

  fetch({ app, store, params, error }) {
    if (store.getters['entities/routine/query']().count() === 0) {
      return store.dispatch('entities/routine/get', {
        id: params.id,
      }, {
        root: true,
      })
        .then(() => {
          const routine = Routine
            .query()
            .with('trigger')
            .where('id', params.id)
            .first()

          if (routine) {
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
              name: app.i18n.t('application.buttons.edit.title'),
            }, {
              root: true,
            })

            store.dispatch('template/setFullRowHeading', null, {
              root: true,
            })

            store.dispatch('template/setHeading', {
              heading: routine.name,
              subHeading: routine.isAutomatic ? app.i18n.t('routines.headings.automaticRoutine') : app.i18n.t('routines.headings.manualRoutine'),
            }, {
              root: true,
            })

            store.dispatch('template/setHeadingIcon', {
              icon: app.$routineIcon(routine),
            }, {
              root: true,
            })

            store.dispatch('template/setActionButton', {
              name: app.i18n.t('application.buttons.add.title'),
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
          } else {
            error({ statusCode: 404, message: 'Routine Not Found' })
          }
        })
        .catch((e) => {
          if (get(e, 'exception.response.status', 0) === 404) {
            error({ statusCode: 404, message: 'Routine Not Found' })
          } else {
            error({ statusCode: 503, message: 'Something went wrong' })
          }
        })
    }
  },

  beforeMount() {
    if (this.windowSize !== null && this.windowSize !== 'xs') {
      this.$router.push(this.localePath({
        name: this.$routes.routines.list,
        hash: `${ROUTINES_HASH_DETAIL}-${this.id}`,
      }))

      return
    }

    if (
      Routine.query().count() === 0 &&
      !this.fetchingRoutines &&
      !this.fetchingRoutine &&
      !Routine.getters('firstLoadFinished')()
    ) {
      Routine.dispatch('get', {
        id: this.id,
      })
        .catch((e) => {
          if (this._.get(e, 'exception.response.status', 0) === 404) {
            this.$nuxt.error({ statusCode: 404, message: 'Routine Not Found' })
          } else {
            this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          }
        })
    }

    if (!this.fetchingRoutine && this.routine === null) {
      this.$nuxt.error({ statusCode: 404, message: 'Routine Not Found' })

      return
    }

    if (this.routine) {
      this._configureNavigation()
    }
  },

  mounted() {
    this.$nextTick(() => {
      this._setBlocksHeight('detail')

      this._checkRoute()
    })

    this.$bus.$emit('wait-page_reloading', false)

    window.addEventListener('resize', this._windowResizeHandler)
  },

  updated() {
    this._setBlocksHeight('detail')
  },

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked', this.leftButtonAction)
    this.$bus.$off('heading_right_button-clicked', this.rightButtonAction)
    this.$bus.$off('heading_action_button-clicked', this.actionButtonAction)

    window.removeEventListener('resize', this._windowResizeHandler)
  },

  methods: {

    /**
     * Routine was removed, navigate to routines list
     */
    routineRemoved() {
      this.$router.push(this.localePath(this.$routes.routines.list))
    },

    /**
     * Open selected view
     *
     * @param {String} view
     */
    openView(view) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        // Updating window route
        switch (view) {
          // Settings page
          case this.view.items.settings.name:
            this.view.opened = view

            this.$nextTick(() => {
              if (this._.get(this.$refs, 'settings')) {
                const component = this._.get(this.$refs, 'settings')

                this._setBlocksHeight('settings')

                // Scroll view to setting part
                this.$scrollTo(component.$el, 500, {
                  container: '.fb-default-layout__content',
                  onDone: () => {
                    this.$router.push(this.localePath({
                      name: this.$routes.routines.detail,
                      params: {
                        id: this.id,
                      },
                      hash: this.view.items.settings.route.hash,
                    }), () => {
                      // Reconfigure navigation after changes
                      this._configureNavigation()
                    })
                  },
                })
              }
            })
            break

          // Details page
          case this.view.items.detail.name:
            if (
              this._.get(this.$refs, 'detail') &&
              this.view.opened === this.view.items.settings.name
            ) {
              const component = this._.get(this.$refs, 'detail')

              this.$scrollTo(component.$el, 500, {
                container: '.fb-default-layout__content',
                onDone: () => {
                  this.$router.push(this.localePath({
                    name: this.$routes.routines.detail,
                    params: {
                      id: this.id,
                    },
                  }), () => {
                    this.view.opened = view

                    // Reconfigure navigation after changes
                    this._configureNavigation()
                  })
                },
              })
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.routines.detail,
                params: {
                  id: this.id,
                },
              }))

              this.view.opened = view

              // Reconfigure navigation after changes
              this._configureNavigation()
            }
            break

          // Other pages
          default:
            this.view.opened = view

            this.$router.push(this.localePath({
              name: this.$routes.routines.detail,
              params: {
                id: this.id,
              },
            }))

            // Reconfigure navigation after changes
            this._configureNavigation()
            break
        }

        switch (view) {
          // Select add item type
          case this.view.items.type.name:
            if (this.routine.schedule !== null || this.routine.isManual) {
              this.openView(this.view.items.actionThing.name)
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

          // Show window for configuring condition
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

          // Show window for configuring action
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
      }
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
     * Remove thing condition via edit window
     */
    removeCondition() {
      this.openView(this.view.items.detail.name)

      RoutineCondition.dispatch('remove', {
        id: this.view.items.condition.item.id,
      })
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
      }
    },

    /**
     * Remove thing condition via edit window
     */
    removeAction() {
      this.openView(this.view.items.detail.name)

      RoutineAction.dispatch('remove', {
        id: this.view.items.action.item.id,
      })
    },

    /**
     * Header left button action event
     */
    leftButtonAction() {
      if (this.windowSize === 'xs') {
        this.$bus.$emit('wait-page_reloading', 10)
      }

      this.$router.push(this.localePath({ name: this.$routes.routines.list }))
    },

    /**
     * Header right button action event
     */
    rightButtonAction() {
      if (this.view.opened === this.view.items.settings.name) {
        this.openView(this.view.items.detail.name)
      } else {
        this.openView(this.view.items.settings.name)
      }
    },

    /**
     * Header action button action event
     */
    actionButtonAction() {
      this.openView(this.view.items.type.name)
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

      if (this.view.opened === this.view.items.settings.name) {
        this.$store.dispatch('template/setRightButton', {
          name: this.$t('application.buttons.close.title'),
        }, {
          root: true,
        })
      } else if (this.view.opened === this.view.items.detail.name || this.view.opened === this.view.items.type.name) {
        this.$store.dispatch('template/setRightButton', {
          name: this.$t('application.buttons.edit.title'),
        }, {
          root: true,
        })
      }

      this.$store.dispatch('template/setActionButton', {
        name: this.$t('application.buttons.add.title'),
      }, {
        root: true,
      })

      this.$store.dispatch('template/setFullRowHeading', null, {
        root: true,
      })

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

      this.$store.dispatch('template/setHeading', {
        heading: this.routine.name,
        subHeading: this.routine.isAutomatic ? (this.routine.schedule !== null ? this.$t('routines.headings.scheduledRoutine', {
          days,
          time: this.$dateFns.format(this.routine.schedule.time, this.account.timeFormat),
        }) : this.$t('routines.headings.automaticRoutine')) : this.$t('routines.headings.manualRoutine'),
      }, {
        root: true,
      })

      this.$store.dispatch('template/setHeadingIcon', {
        icon: this.$routineIcon(this.routine),
      }, {
        root: true,
      })

      this.$store.dispatch('template/setHeadingInfoText', {
        text: this.$tc('routines.texts.routineThings', this.routine.actions.length, { count: this.routine.actions.length }),
      }, {
        root: true,
      })

      this.$store.dispatch('app/bottomMenuCollapse', null, {
        root: true,
      })

      // Clear actions
      this.$bus.$off('heading_left_button-clicked')
      this.$bus.$off('heading_right_button-clicked')
      this.$bus.$off('heading_action_button-clicked')

      // Reassign actions
      this.$bus.$on('heading_left_button-clicked', this.leftButtonAction)
      this.$bus.$on('heading_right_button-clicked', this.rightButtonAction)
      this.$bus.$on('heading_action_button-clicked', this.actionButtonAction)
    },

    /**
     * Check route and if is needed open detail window
     *
     * @private
     */
    _checkRoute() {
      if (this.$route.hash !== '') {
        if (this.$route.hash.includes(ROUTINES_HASH_SETTINGS)) {
          this.openView(this.view.items.settings.name)
        }
      }
    },

    /**
     * Update blocks height according to resized window
     *
     * @private
     */
    _windowResizeHandler() {
      this._setBlocksHeight('detail')
      this._setBlocksHeight('settings')

      if (this._.get(this.$refs, this.view.opened)) {
        const component = this._.get(this.$refs, this.view.opened)

        this.$scrollTo(component.$el, 1, {
          container: '.fb-default-layout__content',
        })
      }
    },

    /**
     * Set component height by reference
     *
     * @param {String} block
     *
     * @private
     */
    _setBlocksHeight(block) {
      if (this._.get(this.$refs, block)) {
        const component = this._.get(this.$refs, block)

        const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

        component.$el.style.minHeight = `${viewportHeight - this.$store.getters['template/bodyTopBottomMargin']()}px`
      }
    },

  },

  validate({ app, params }) {
    return app.$validateUUID(params.id)
  },

  head() {
    return {
      title: this.$t('meta.routines.detail.title', { routine: this._.get(this.routine, 'name') }),
    }
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
