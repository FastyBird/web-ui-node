<template>
  <div class="fb-routines-detail-view__container">
    <fb-loading-box
      v-if="fetchingRoutine && routine === null"
      :text="$t('texts.loading')"
    />

    <template v-else>
      <template v-if="routine !== null">
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

        <mobile-bottom-menu
          :show-header="true"
          :show="view.opened === view.items.type.name"
          :heading="$t('routines.headings.addNew')"
          @close="openView(view.items.detail.name)"
        >
          <template slot="items">
            <template v-if="routine.isAutomatic && schedule === null">
              <fb-button
                block
                variant="link"
                name="condition"
                @click.prevent="openView(view.items.conditionThing.name)"
              >
                {{ $t('routines.buttons.thingToCondition.title') }}
              </fb-button>

              <fb-divider
                text="OR"
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
                text="OR"
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
        </mobile-bottom-menu>

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
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import get from 'lodash/get'

import {
  ROUTINES_HASH_DETAIL,
  ROUTINES_HASH_SETTINGS,
} from '@/configuration/routes'

import routineUpdateMixin from '@/mixins/routineUpdate'

import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import RoutineDetail from '@/components/routines/Detail'
import RoutineSettings from '@/components/routines/Settings'

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

  mixins: [routineUpdateMixin],

  data() {
    return {
      id: this.$route.params.id,
      view: Object.assign({}, viewSettings),
    }
  },

  computed: {

    ...mapState('theme', {
      windowSize: state => state.windowSize,
    }),

    /**
     * User account details
     *
     * @returns {(Account|null)}
     */
    account() {
      return this.$store.getters['entities/account/query']()
        .first()
    },

    /**
     * View routine data
     *
     * @returns {Trigger}
     */
    routine() {
      return this.$store.getters['entities/trigger/query']()
        .with('actions')
        .with('conditions')
        .with('notifications')
        .where('id', this.id)
        .first()
    },

    /**
     * Routine schedule condition
     *
     * @returns {(Condition|null)}
     */
    schedule() {
      const condition = this._.get(this.routine, 'conditions', []).find(item => item.isTime)

      if (typeof condition === 'undefined') {
        return null
      }

      return condition
    },

    /**
     * Flag signalizing that routines are loading from server
     *
     * @returns {Boolean}
     */
    fetchingRoutines() {
      return this.$store.getters['entities/trigger/fetching']()
    },

    /**
     * Flag signalizing that routine is loading from server
     *
     * @returns {Boolean}
     */
    fetchingRoutine() {
      return this.$store.getters['entities/trigger/getting'](this.id)
    },

    /**
     * Count total things count (actions)
     *
     * @returns {Number}
     */
    thingsCount() {
      return this._.uniq(this._.get(this.routine, 'actions', [])
        .map((item) => {
          return item.channel_id
        }))
        .length
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
    if (store.getters['entities/trigger/query']().count() === 0) {
      return store.dispatch('entities/trigger/get', {
        id: params.id,
      }, {
        root: true,
      })
        .then(() => {
          const routine = store.getters['entities/trigger/find'](params.id)

          if (routine) {
            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/setLeftButton', {
              name: app.i18n.t('application.buttons.back.title'),
              link: app.localePath(app.$routes.routines.list),
              icon: 'arrow-left',
            }, {
              root: true,
            })

            store.dispatch('header/setRightButton', {
              name: app.i18n.t('application.buttons.edit.title'),
              callback: null, // Null is set because of SSR and serialization
            }, {
              root: true,
            })

            store.dispatch('header/setFullRowHeading', null, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: routine.name,
              subHeading: routine.isAutomatic ? app.i18n.t('routines.headings.automaticRoutine') : app.i18n.t('routines.headings.manualRoutine'),
            }, {
              root: true,
            })

            store.dispatch('header/setHeadingIcon', {
              icon: app.$routineIcon(routine),
              callback: 'callback_here', // String is set because of SSR and serialization
            }, {
              root: true,
            })

            store.dispatch('header/setAddButton', {
              name: app.i18n.t('application.buttons.add.title'),
              callback: null, // Null is set because of SSR and serialization
            }, {
              root: true,
            })

            store.dispatch('header/setInfoText', {
              text: '-',
            }, {
              root: true,
            })

            store.dispatch('bottomNavigation/resetStore', null, {
              root: true,
            })

            store.dispatch('bottomNavigation/hideNavigation', null, {
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
      this.$store.getters['entities/trigger/query']().count() === 0 &&
      !this.fetchingRoutines &&
      !this.fetchingRoutine &&
      !this.$store.getters['entities/trigger/firstLoadFinished']()
    ) {
      this.$store.dispatch('entities/trigger/get', {
        id: this.id,
      }, {
        root: true,
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
    this._checkRoute()

    this.$nextTick(() => {
      this._setBlocksHeight('detail')
    })

    window.addEventListener('resize', this._windowResizeHandler)
  },

  updated() {
    this._setBlocksHeight('detail')
  },

  beforeDestroy() {
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
            this.$router.push(this.localePath({
              name: this.$routes.routines.detail,
              params: {
                id: this.id,
              },
              hash: this.view.items.settings.route.hash,
            }))

            this.$nextTick(() => {
              if (this._.get(this.$refs, 'settings')) {
                const component = this._.get(this.$refs, 'settings')

                this._setBlocksHeight('settings', 'height')

                // Scroll view to setting part
                this.$scrollTo(component.$el, 500, {
                  container: '.fb-default-layout__content',
                })
              }
            })
            break

          // Other pages
          default:
            this.$router.push(this.localePath({
              name: this.$routes.routines.detail,
              params: {
                id: this.id,
              },
            }))
            break
        }

        switch (view) {
          // Select add item type
          case this.view.items.type.name:
            if (this.schedule !== null || this.routine.isManual) {
              this.openView(this.view.items.actionThing.name)

              return
            }
            break

          // Show things list for condition select
          case this.view.items.conditionThing.name:
          case this.view.items.conditionSensor.name:
            const conditionThings = []

            this._.get(this.routine, 'conditions', [])
              .forEach((condition) => {
                if (typeof conditionThings.find(({ thing }) => thing === condition.channel_id) === 'undefined') {
                  conditionThings.push({
                    thing: condition.channel_id,
                  })
                }
              })

            this.view.items[view].items = conditionThings
            break

          // Show window for configuring condition
          case this.view.items.condition.name:
            const storedCondition = this._.get(this.routine, 'conditions', [])
              .find(({ channel_id }) => channel_id === this.view.items.condition.thing.id)

            if (typeof storedCondition !== 'undefined') {
              const condition = {
                thing: storedCondition.channel_id,
                enabled: storedCondition.enabled,
                rows: [],
              }

              this._.filter(this._.get(this.routine, 'conditions', []), { channel_id: storedCondition.channel_id })
                .forEach((item) => {
                  condition.rows.push({
                    property_id: item.property_id,
                    operand: item.operand,
                    operator: item.operator,
                  })
                })

              this.view.items[view].item = condition
            } else {
              this.view.items[view].item = null
            }
            break

          // Show things list for action select
          case this.view.items.actionThing.name:
            const actionThings = []

            this._.get(this.routine, 'actions', [])
              .forEach((action) => {
                if (typeof actionThings.find(({ thing }) => thing === action.channel_id) === 'undefined') {
                  actionThings.push({
                    thing: action.channel_id,
                  })
                }
              })

            this.view.items[view].items = actionThings
            break

          // Show window for configuring action
          case this.view.items.action.name:
            const storedAction = this._.get(this.routine, 'actions', [])
              .find(({ channel_id }) => channel_id === this.view.items.action.thing.id)

            if (typeof storedAction !== 'undefined') {
              const action = {
                thing: storedAction.channel_id,
                enabled: storedAction.enabled,
                rows: [],
              }

              this._.filter(this._.get(this.routine, 'actions', []), { channel_id: storedAction.channel_id })
                .forEach((item) => {
                  action.rows.push({
                    property_id: item.property_id,
                    operation: item.value,
                  })
                })

              this.view.items[view].item = action
            } else {
              this.view.items[view].item = null
            }
            break
        }

        this.view.opened = view
      }

      // Reconfigure navigation after changes
      this._configureNavigation()
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
     */
    addCondition(data) {
      this.openView(this.view.items.detail.name)

      this.addRoutineCondition(this.routine, data)
    },

    /**
     * Remove thing condition via edit window
     *
     * @param {Object} thing
     */
    removeCondition(thing) {
      this.openView(this.view.items.detail.name)

      this.removeRoutineCondition(this.routine, thing)
    },

    /**
     * Action was selected
     *
     * @param {Object} data
     */
    addAction(data) {
      this.openView(this.view.items.detail.name)

      this.addRoutineAction(this.routine, data)
    },

    /**
     * Remove thing condition via edit window
     *
     * @param {Object} thing
     */
    removeAction(thing) {
      this.openView(this.view.items.detail.name)

      this.removeRoutineAction(this.routine, thing)
    },

    _openEditIcon() {
      // TODO: Edit icon action...
    },

    /**
     * Configure page header for small devices
     *
     * @private
     */
    _configureNavigation() {
      this.$store.dispatch('header/resetStore', null, {
        root: true,
      })

      this.$store.dispatch('header/setLeftButton', {
        name: this.$t('application.buttons.back.title'),
        link: this.localePath({ name: this.$routes.routines.list }),
        icon: 'arrow-left',
      }, {
        root: true,
      })

      if (this.view.opened === this.view.items.settings.name) {
        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.close.title'),
          callback: () => {
            if (this._.get(this.$refs, 'detail')) {
              const component = this._.get(this.$refs, 'detail')

              this.$scrollTo(component.$el, 500, {
                container: '.fb-default-layout__content',
                onDone: () => {
                  this.openView(this.view.items.detail.name)
                },
              })
            }
          },
        }, {
          root: true,
        })
      } else if (this.view.opened === this.view.items.detail.name || this.view.opened === this.view.items.type.name) {
        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.edit.title'),
          callback: () => {
            this.openView(this.view.items.settings.name)
          },
        }, {
          root: true,
        })
      }

      this.$store.dispatch('header/setAddButton', {
        name: this.$t('application.buttons.add.title'),
        callback: () => {
          this.openView(this.view.items.type.name)
        },
      }, {
        root: true,
      })

      this.$store.dispatch('header/setFullRowHeading', null, {
        root: true,
      })

      let days = ''

      if (this.schedule !== null) {
        if (this.schedule.days.length === 7) {
          days = this.$t('routines.texts.everyday')
        } else {
          days = []

          for (const day of this.schedule.days) {
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

      this.$store.dispatch('header/setHeading', {
        heading: this.routine.name,
        subHeading: this.routine.isAutomatic ? (this.schedule !== null ? this.$t('routines.headings.scheduledRoutine', { days, time: this.$dateFns.format(this.schedule.time, this.account.timeFormat) }) : this.$t('routines.headings.automaticRoutine')) : this.$t('routines.headings.manualRoutine'),
      }, {
        root: true,
      })

      this.$store.dispatch('header/setHeadingIcon', {
        icon: this.$routineIcon(this.routine),
        callback: () => {
          this._openEditIcon()
        },
      }, {
        root: true,
      })

      this.$store.dispatch('header/setInfoText', {
        text: this.$tc('routines.texts.routineThings', this.thingsCount, { count: this.thingsCount }),
      }, {
        root: true,
      })

      this.$store.dispatch('bottomNavigation/resetStore', null, {
        root: true,
      })

      this.$store.dispatch('bottomNavigation/hideNavigation', null, {
        root: true,
      })
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
      this._setBlocksHeight('settings', 'height')

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
     * @param {String} attribute
     *
     * @private
     */
    _setBlocksHeight(block, attribute = 'minHeight') {
      if (this._.get(this.$refs, block)) {
        const component = this._.get(this.$refs, block)

        component.$el.style[attribute] = `${document.getElementsByClassName('fb-default-layout__content')[0].clientHeight}px`
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
