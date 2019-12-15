<template>
  <div class="fb-routines-detail-view__container">
    <fb-loading-box
      v-if="fetchingRoutine && routine === null"
      :text="$t('texts.loading')"
    />

    <template v-else>
      <template v-if="routine !== null">
        <routine-detail
          v-if="view.opened === view.items.detail.name || view.opened === view.items.settings.name"
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
      </template>

      <fb-modal-window
        v-if="view.opened === view.items.type.name"
        :show-header="false"
        @close="openView(view.items.detail.name)"
      >
        <template slot="modal-body">
          <fb-button
            uppercase
            block
            variant="outline-primary"
            size="lg"
            name="close"
            @click.prevent="openView(view.items.condition.name)"
          >
            {{ $t('routines.buttons.thingToCondition.title') }}
          </fb-button>

          <fb-divider
            text="OR"
            type="vertical"
          />

          <fb-button
            uppercase
            block
            variant="outline-primary"
            size="lg"
            name="close"
            @click.prevent="openView(view.items.action.name)"
          >
            {{ $t('routines.buttons.thingToAction.title') }}
          </fb-button>
        </template>

        <template slot="modal-footer">
          <fb-button
            uppercase
            variant="link"
            size="lg"
            name="close"
            @click.prevent="openView(view.items.detail.name)"
          >
            {{ $t('application.buttons.close.title') }}
          </fb-button>
        </template>
      </fb-modal-window>

      <select-thing
        v-if="view.opened === view.items.action.name || view.opened === view.items.condition.name"
        :items="view.items[view.opened].items"
        :only-settable="view.opened === view.items.action.name"
        class="fb-routines-detail-view__container-things"
        @select="thingSelected"
        @close="openView(view.items.detail.name)"
      />

      <edit-condition
        v-if="view.opened === view.items.conditionThing.name"
        :thing="view.items.conditionThing.thing"
        :condition="view.items.conditionThing.item"
        class="fb-routines-detail-view__container-thing"
        @add="addCondition"
        @remove="removeCondition"
        @back="openView(view.items.condition.name)"
        @close="openView(view.items.detail.name)"
      />

      <edit-action
        v-if="view.opened === view.items.actionThing.name"
        :thing="view.items.actionThing.thing"
        :action="view.items.actionThing.item"
        class="fb-routines-detail-view__container-thing"
        @add="addAction"
        @remove="removeAction"
        @back="openView(view.items.action.name)"
        @close="openView(view.items.detail.name)"
      />
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

  import RoutineDetail from '@/components/routines/Detail'
  import RoutineSettings from '@/components/routines/Settings'

  const SelectThing = () => import('@/components/routines/Edit/SelectThing')
  const EditCondition = () => import('@/components/routines/Edit/EditCondition')
  const EditAction = () => import('@/components/routines/Edit/EditAction')

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
        view: {
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
            condition: {
              name: 'condition',
              items: [],
            },
            conditionThing: {
              name: 'conditionThing',
              thing: null,
              items: [],
            },
            action: {
              name: 'action',
              items: [],
            },
            actionThing: {
              name: 'actionThing',
              thing: null,
              items: [],
            },
          },
        },
      }
    },

    computed: {

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

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
          .map(item => {
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
            if (this.$route.hash.indexOf(ROUTINES_HASH_SETTINGS) !== -1) {
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
        if (!val) {
          if (this.routine === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Routine Not Found' })

            return
          }

          this._configureNavigation()
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
          .catch(e => {
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
          .catch(e => {
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
       * Open routines view
       *
       * @param {String} view
       */
      openView(view) {
        if (this.view.items.hasOwnProperty(view)) {
          switch (view) {
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
                    offset: (-1 * this.$store.state.theme.marginTop),
                  })
                }
              })
              break

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
            case this.view.items.condition.name:
              const conditionThings = []

              this._.get(this.routine, 'conditions', [])
                .forEach(condition => {
                  if (typeof conditionThings.find(({ thing }) => thing === condition.channel_id) === 'undefined') {
                    conditionThings.push({
                      thing: condition.channel_id,
                    })
                  }
                })

              this.view.items[view].items = conditionThings
              break

            case this.view.items.conditionThing.name:
              const storedCondition = this._.get(this.routine, 'conditions', []).find(({ channel_id }) => channel_id === this.view.items.conditionThing.thing.id)

              if (typeof storedCondition !== 'undefined') {
                const condition = {
                  thing: storedCondition.channel_id,
                  enabled: storedCondition.enabled,
                  rows: [],
                }

                this._.filter(this._.get(this.routine, 'conditions', []), { 'channel_id': storedCondition.channel_id })
                  .forEach(item => {
                    condition.rows.push({
                      property: item.property_id,
                      operand: this._.first(item.operands),
                      operator: item.operator,
                    })
                  })

                this.view.items[view].item = condition
              } else {
                this.view.items[view].item = null
              }
              break

            case this.view.items.action.name:
              const actionThings = []

              this._.get(this.routine, 'actions', [])
                .forEach(action => {
                  if (typeof actionThings.find(({ thing }) => thing === action.channel_id) === 'undefined') {
                    actionThings.push({
                      thing: action.channel_id,
                    })
                  }
                })

              this.view.items[view].items = actionThings
              break

            case this.view.items.actionThing.name:
              const storedAction = this._.get(this.routine, 'actions', []).find(({ channel_id }) => channel_id === this.view.items.actionThing.thing.id)

              if (typeof storedAction !== 'undefined') {
                const action = {
                  thing: storedAction.channel_id,
                  enabled: storedAction.enabled,
                  rows: [],
                }

                this._.filter(this._.get(this.routine, 'actions', []), { 'channel_id': storedAction.channel_id })
                  .forEach(item => {
                    action.rows.push({
                      property: item.property_id,
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
        if (this.view.opened === this.view.items.action.name) {
          this.view.items.actionThing.thing = thing

          this.openView(this.view.items.actionThing.name)
        } else if (this.view.opened === this.view.items.condition.name) {
          this.view.items.conditionThing.thing = thing

          this.openView(this.view.items.conditionThing.name)
        }
      },

      /**
       * Condition was selected
       *
       * @param {Object} data
       */
      addCondition(data) {
        this.openView(this.view.items.detail.name)

        const storedConditions = this._.filter(this._.get(this.routine, 'conditions', []), ({ channel_id }) => channel_id === data.thing)

        const toCreate = []
        const toUpdate = []
        const toDelete = []

        this._.get(data, 'rows', [])
          .forEach(row => {
            const condition = this._.get(this.routine, 'conditions', []).find(item => item.channel_id === this._.get(data, 'thing') && item.property_id === this._.get(row, 'property'))

            // Editing existing condition
            if (typeof condition !== 'undefined') {
              toUpdate.push({
                id: condition.id,
                enabled: this._.get(data, 'enabled', false),
                operator: this._.get(row, 'operator'),
                operands: [this._.get(row, 'operand')],
              })
            // Updating new condition
            } else {
              toCreate.push({
                trigger: this._.get(data, 'thing'),
                enabled: this._.get(data, 'enabled', false),
                property: this._.get(row, 'property'),
                operator: this._.get(row, 'operator'),
                operands: [this._.get(row, 'operand')],
              })
            }
          })

        storedConditions
          .forEach(condition => {
            if (typeof toUpdate.find(({ id }) => id === condition.id) === 'undefined') {
              toDelete.push({
                id: condition.id,
              })
            }
          })

        const errorMessageNotCreated = this.$t('routines.messages.conditionNotCreated', {
          routine: this.routine.name,
        })

        toCreate
          .forEach(item => {
            this.$store.dispatch('entities/condition/add', {
              trigger: this.routine,
              data: item,
            }, {
              root: true,
            })
              .catch(e => {
                if (e.hasOwnProperty('exception')) {
                  this.handleFormError(e.exception, errorMessageNotCreated)
                } else {
                  this.$flashMessage(errorMessageNotCreated, 'error')
                }
              })
          })

        const errorMessageNotUpdated = this.$t('routines.messages.conditionNotUpdated', {
          routine: this.routine.name,
        })

        toUpdate
          .forEach(item => {
            this.$store.dispatch('entities/condition/edit', {
              id: item.id,
              data: item,
            }, {
              root: true,
            })
              .catch(e => {
                if (e.hasOwnProperty('exception')) {
                  this.handleFormError(e.exception, errorMessageNotUpdated)
                } else {
                  this.$flashMessage(errorMessageNotUpdated, 'error')
                }
              })
          })

        const errorMessageNotRemoved = this.$t('routines.messages.conditionNotRemoved', {
          routine: this.routine.name,
        })

        toDelete
          .forEach(item => {
            this.$store.dispatch('entities/condition/remove', {
              id: item.id,
            }, {
              root: true,
            })
              .catch(e => {
                if (e.hasOwnProperty('exception')) {
                  this.handleFormError(e.exception, errorMessageNotRemoved)
                } else {
                  this.$flashMessage(errorMessageNotRemoved, 'error')
                }
              })
          })
      },

      removeCondition(thing) {
        // TODO: remove
        console.log(thing)
      },

      /**
       * Action was selected
       *
       * @param {Object} data
       */
      addAction(data) {
        this.openView(this.view.items.detail.name)

        const storedActions = this._.filter(this._.get(this.routine, 'actions', []), ({ channel_id }) => channel_id === data.thing)

        const toCreate = []
        const toUpdate = []
        const toDelete = []

        this._.get(data, 'rows', [])
          .forEach(row => {
            const action = this._.get(this.routine, 'actions', []).find(item => item.channel_id === this._.get(data, 'thing') && item.property_id === this._.get(row, 'property'))

            // Editing existing action
            if (typeof action !== 'undefined') {
              toUpdate.push({
                id: action.id,
                enabled: this._.get(data, 'enabled', false),
                value: this._.get(row, 'operation'),
              })
            // Updating new action
            } else {
              toCreate.push({
                channel: this._.get(data, 'thing'),
                enabled: this._.get(data, 'enabled', false),
                property: this._.get(row, 'property'),
                value: this._.get(row, 'operation'),
              })
            }
          })

        storedActions
          .forEach(action => {
            if (typeof toUpdate.find(({ id }) => id === action.id) === 'undefined') {
              toDelete.push({
                id: action.id,
              })
            }
          })

        const errorMessageNotCreated = this.$t('routines.messages.actionNotCreated', {
          routine: this.routine.name,
        })

        toCreate
          .forEach(item => {
            this.$store.dispatch('entities/action/add', {
              trigger: this.routine,
              data: item,
            }, {
              root: true,
            })
              .catch(e => {
                if (e.hasOwnProperty('exception')) {
                  this.handleFormError(e.exception, errorMessageNotCreated)
                } else {
                  this.$flashMessage(errorMessageNotCreated, 'error')
                }
              })
          })

        const errorMessageNotUpdated = this.$t('routines.messages.actionNotUpdated', {
          routine: this.routine.name,
        })

        toUpdate
          .forEach(item => {
            this.$store.dispatch('entities/action/edit', {
              id: item.id,
              data: item,
            }, {
              root: true,
            })
              .catch(e => {
                if (e.hasOwnProperty('exception')) {
                  this.handleFormError(e.exception, errorMessageNotUpdated)
                } else {
                  this.$flashMessage(errorMessageNotUpdated, 'error')
                }
              })
          })

        const errorMessageNotRemoved = this.$t('routines.messages.actionNotRemoved', {
          routine: this.routine.name,
        })

        toDelete
          .forEach(item => {
            this.$store.dispatch('entities/action/remove', {
              id: item.id,
            }, {
              root: true,
            })
              .catch(e => {
                if (e.hasOwnProperty('exception')) {
                  this.handleFormError(e.exception, errorMessageNotRemoved)
                } else {
                  this.$flashMessage(errorMessageNotRemoved, 'error')
                }
              })
          })
      },

      removeAction(thing) {
        // TODO: remove
        console.log(thing)
      },

      _openEditIcon() {
        console.log('Edit icon here')
        // Edit icon action...
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
                  offset: (-1 * this.$store.state.theme.marginTop),
                  onDone: () => {
                    this.openView(this.view.items.detail.name)
                  },
                })
              }
            },
          }, {
            root: true,
          })

          this.$store.dispatch('header/resetAddButton', null, {
            root: true,
          })
        } else if (this.view.opened === this.view.items.detail.name) {
          this.$store.dispatch('header/setRightButton', {
            name: this.$t('application.buttons.edit.title'),
            callback: () => {
              this.openView(this.view.items.settings.name)
            },
          }, {
            root: true,
          })

          this.$store.dispatch('header/setAddButton', {
            name: this.$t('application.buttons.add.title'),
            callback: () => {
              this.openView(this.view.items.type.name)
            },
          }, {
            root: true,
          })
        }

        this.$store.dispatch('header/setFullRowHeading', null, {
          root: true,
        })

        this.$store.dispatch('header/setHeading', {
          heading: this.routine.name,
          subHeading: this.routine.isAutomatic ? this.$t('routines.headings.automaticRoutine') : this.$t('routines.headings.manualRoutine'),
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
          if (this.$route.hash.indexOf(ROUTINES_HASH_SETTINGS) !== -1) {
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
            offset: (-1 * this.$store.state.theme.marginTop),
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

          component.$el.style[attribute] = `${document.querySelector('body').clientHeight}px`
        }
      },

    },

    head() {
      return {
        title: this.$t('meta.routines.detail.title', { routine: this._.get(this.routine, 'name') }),
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>
