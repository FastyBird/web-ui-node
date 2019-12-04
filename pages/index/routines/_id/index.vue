<template>
  <div class="fb-routines-detail-view__container">
    <fb-loading-box
      v-if="fetchingRoutine && routine === null"
      :text="$t('texts.loading')"
    />

    <template v-else>
      <template v-if="routine !== null">
        <routine-detail
          v-if="view.opened === view.detail.name || view.opened === view.settings.name"
          ref="detail"
          :routine="routine"
        />

        <routine-settings
          v-if="view.opened === view.settings.name"
          ref="settings"
          v-body-scroll-lock="true"
          :routine="routine"
          class="fb-routines-detail-view__container-settings"
          @removed="routineRemoved"
        />
      </template>

      <fb-modal-window
        v-if="view.opened === view.type.name"
        :show-header="false"
        @close="openView(view.detail.name)"
      >
        <template slot="modal-body">
          <fb-button
            uppercase
            block
            variant="outline-primary"
            size="lg"
            name="close"
            @click.prevent="openView(view.condition.name)"
          >
            Thing to condition
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
            @click.prevent="openView(view.action.name)"
          >
            Thing to action
          </fb-button>
        </template>

        <template slot="modal-footer">
          <fb-button
            uppercase
            variant="link"
            size="lg"
            name="close"
            @click.prevent="openView(view.detail.name)"
          >
            {{ $t('application.buttons.close.title') }}
          </fb-button>
        </template>
      </fb-modal-window>

      <select-thing
        v-if="view.opened === view.action.name || view.opened === view.condition.name"
        :items="view[view.opened].items"
        :only-settable="view.opened === view.action.name"
        class="fb-routines-detail-view__container-things"
        @select="thingSelected"
        @close="openView(view.detail.name)"
      />

      <edit-condition
        v-if="view.opened === view.conditionThing.name"
        :thing="view.conditionThing.thing"
        :conditions="[]"
        class="fb-routines-detail-view__container-thing"
        @add="addCondition"
        @back="openView(view.condition.name)"
        @close="openView(view.detail.name)"
      />

      <edit-action
        v-if="view.opened === view.actionThing.name"
        :thing="view.actionThing.thing"
        :actions="[]"
        class="fb-routines-detail-view__container-thing"
        @add="addAction"
        @back="openView(view.action.name)"
        @close="openView(view.detail.name)"
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
        settings: false,
        view: {
          opened: 'detail', // Detail is by default
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
          },
          action: {
            name: 'action',
            items: [],
          },
          actionThing: {
            name: 'actionThing',
            thing: null,
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
                subHeading: 'Automatic routine',
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
                text: '5 things',
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
        if (this.view.hasOwnProperty(view)) {
          if (this.view[view].hasOwnProperty('id')) {
            this.view[view].id = null
          }
        }

        switch (view) {
          case this.view.settings.name:
            this.$router.push(this.localePath({
              name: this.$routes.routines.detail,
              params: {
                id: this.id,
              },
              hash: this.view.settings.route.hash,
            }))
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

        if (this.view.hasOwnProperty(view)) {
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
        if (this.view.opened === this.view.action.name) {
          this.view.actionThing.thing = thing
          this.view.actionThing.items = this.actions

          this.openView(this.view.actionThing.name)
        } else if (this.view.opened === this.view.condition.name) {
          this.view.conditionThing.thing = thing
          this.view.conditionThing.items = this.conditions

          this.openView(this.view.conditionThing.name)
        }
      },

      /**
       * Condition was selected
       *
       * @param {Object} data
       */
      addCondition(data) {
        this.openView(this.view.detail.name)

        const create = []
        const update = []

        this._.get(this.routine, 'conditions', [])
          .forEach(condition => {
            if (condition.isChannelProperty) {
              this._.get(data, 'rows', [])
                .forEach((row, index) => {
                  if (
                    condition.channel_id === this._.get(row, 'channel') &&
                    condition.property_id === this._.get(row, 'property')
                  ) {
                    update.push({
                      id: condition.id,
                      operator: this._.get(row, 'operator'),
                      operands: [this._.get(row, 'operand')],
                      enabled: this._.get(data, 'enabled', false),
                    })

                    if (data.hasOwnProperty('rows') && data.rows.hasOwnProperty(index)) {
                      data.rows.splice(index, 1)
                    }
                  }
                })
            }
          })

        this._.get(data, 'rows', [])
          .forEach(row => {
            create.push({
              trigger: this._.get(row, 'channel'),
              property: this._.get(row, 'property'),
              operator: this._.get(row, 'operator'),
              operands: [this._.get(row, 'operand')],
              enabled: this._.get(data, 'enabled', false),
            })
          })

        const errorMessageNotCreated = this.$t('routines.messages.conditionNotCreated', {
          routine: this.routine.name,
        })

        create
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

        update
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
      },

      /**
       * Action was selected
       *
       * @param {Object} data
       */
      addAction(data) {
        this.openView(this.view.detail.name)

        const create = []
        const update = []

        this._.get(this.routine, 'actions', [])
          .forEach(action => {
            if (action.isChannelProperty) {
              this._.get(data, 'rows', [])
                .forEach((row, index) => {
                  if (
                    action.channel_id === this._.get(row, 'channel') &&
                    action.property_id === this._.get(row, 'property')
                  ) {
                    update.push({
                      id: action.id,
                      value: this._.get(row, 'operation'),
                      enabled: this._.get(data, 'enabled', false),
                    })

                    if (data.hasOwnProperty('rows') && data.rows.hasOwnProperty(index)) {
                      data.rows.splice(index, 1)
                    }
                  }
                })
            }
          })

        this._.get(data, 'rows', [])
          .forEach(row => {
            create.push({
              channel: this._.get(row, 'channel'),
              property: this._.get(row, 'property'),
              value: this._.get(row, 'operation'),
              enabled: this._.get(data, 'enabled', false),
            })
          })

        const errorMessageNotCreated = this.$t('routines.messages.actionNotCreated', {
          routine: this.routine.name,
        })

        create
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

        update
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
      },

      _openEditIcon() {
        console.log('Edit icon here')
        // Edit icon action...
      },

      /**
       * Open routine settings part
       */
      _openSettings() {
        this.openView(this.view.settings.name)

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

        if (this.view.opened === this.view.settings.name) {
          this.$store.dispatch('header/setRightButton', {
            name: this.$t('application.buttons.close.title'),
            callback: () => {
              if (this._.get(this.$refs, 'detail')) {
                const component = this._.get(this.$refs, 'detail')

                this.$scrollTo(component.$el, 500, {
                  offset: (-1 * this.$store.state.theme.marginTop),
                  onDone: () => {
                    this.openView(this.view.detail.name)
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
        } else if (this.view.opened === this.view.detail.name) {
          this.$store.dispatch('header/setRightButton', {
            name: this.$t('application.buttons.edit.title'),
            callback: () => {
              this._openSettings()
            },
          }, {
            root: true,
          })

          this.$store.dispatch('header/setAddButton', {
            name: this.$t('application.buttons.add.title'),
            callback: () => {
              this.openView(this.view.type.name)
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
          subHeading: 'Automatic routine',
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
          text: '5 things',
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
            this._openSettings()
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

        if (
          this.view.opened === this.view.settings.name &&
          this._.get(this.$refs, 'settings')
        ) {
          const component = this._.get(this.$refs, 'settings')

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
