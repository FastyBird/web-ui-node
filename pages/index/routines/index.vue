<template>
  <div class="fb-routines-list-view__container">
    <div class="fb-routines-list-view__items-container">
      <routine-list-item
        v-for="routine in routines"
        :key="routine.id"
        :routine="routine"
        @click="oneClick"
      />
    </div>

    <!-- ROUTINE DETAIL FOR LARGE DEVICES //-->
    <off-canvas
      :show="view.opened !== null && windowSize !== 'xs'"
      @close="closeView(view.opened)"
    >
      <off-canvas-body
        v-if="viewRoutine !== null && view.opened !== null && windowSize !== 'xs'"
        slot="body"
        :heading="detailHeading"
        :sub-heading="detailSubHeading"
      >
        <template slot="left-button">
          <button
            class="button"
            @click.prevent="closeView(view.opened)"
          >
            <font-awesome-icon icon="times" />
          </button>
        </template>

        <transition
          slot="body"
          name="fade"
          mode="out-in"
        >
          <routine-detail
            v-if="view.opened === view.items.detail.name"
            :routine="viewRoutine"
            :style="`height: ${offCanvasHeight}px`"
            class="fb-routines-list-view__off-canvas-body"
          />

          <routine-settings
            v-if="view.opened === view.items.settings.name"
            :routine="viewRoutine"
            :style="`height: ${offCanvasHeight}px`"
            class="fb-routines-list-view__off-canvas-body"
            @removed="closeView"
          />
        </transition>
      </off-canvas-body>
    </off-canvas>

    <fb-loading-box
      v-if="fetchingRoutines && routines.length === 0"
      :text="$t('routines.texts.loadingRoutines')"
    />

    <template v-if="!fetchingRoutines && routines.length === 0">
      <no-results
        :message="$t('routines.texts.noRoutines')"
        icon="project-diagram"
      />

      <div class="fb-routines-list-view__new-routine">
        <fb-button
          variant="outline-primary"
          name="press"
          @click.prevent="createNewRoutine"
        >
          {{ $t('routines.buttons.addNew.title') }}
        </fb-button>
      </div>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import {
    ROUTINES_HASH_DETAIL,
    ROUTINES_HASH_SETTINGS,

    ROUTINES_HASH_AUTOMATION,
    ROUTINES_HASH_SCHEDULES,
  } from '@/configuration/routes'

  import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

  import RoutineListItem from '@/components/routines/ListItem'

  const RoutineDetail = () => ({
    component: import('@/components/routines/Detail'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const RoutineSettings = () => ({
    component: import('@/components/routines/Settings'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  export default {

    name: 'RoutinesListPage',

    components: {
      RoutineListItem,
      RoutineDetail,
      RoutineSettings,
    },

    transition: 'fade',

    data() {
      return {
        loading: {
          detail: null,
        },
        view: {
          opened: null,
          items: {
            detail: {
              name: 'detail',
              id: null,
              route: {
                hash: ROUTINES_HASH_DETAIL,
                length: 8,
              },
            },
            settings: {
              name: 'settings',
              id: null,
              route: {
                hash: ROUTINES_HASH_SETTINGS,
                length: 10,
              },
            },
          },
        },
        click: {
          delay: 200,
          clicks: 0,
          timer: null,
        },
        offCanvasHeight: null,
      }
    },

    computed: {

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

      /**
       * Get all created & loaded routines
       *
       * @returns {Array}
       */
      routines() {
        return this.$store.getters['entities/trigger/query']()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .where('isForChannel', false)
          .orderBy('name')
          .all()
      },

      /**
       * View device data
       *
       * @returns {(Trigger|null)}
       */
      viewRoutine() {
        if (this.view.opened === null) {
          return null
        }

        let triggerId = 0

        switch (this.view.opened) {
          case this.view.items.detail.name:
            triggerId = this.view.items.detail.id
            break
        }

        return this.$store.getters['entities/trigger/query']()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .where('id', triggerId)
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
       * Get detail window heading
       *
       * @returns {String}
       */
      detailHeading() {
        if (this.view.opened === this.view.items.detail.name) {
          return this.viewRoutine.name
        }

        return 'N/A'
      },

      /**
       * Get detail window sub-heading
       *
       * @returns {(String|null)}
       */
      detailSubHeading() {
        if (this.view.opened === this.view.items.detail.name) {
          return this.viewRoutine.hasComment ? this.viewRoutine.comment : null
        }

        return null
      },

    },

    watch: {

      '$route'(val) {
        if (this._.get(val, 'hash', '') === '') {
          this.closeView()
        } else if (this._.get(val, 'hash', '') !== '') {
          for (const viewName in this.view.items) {
            if (
              this.view.items.hasOwnProperty(viewName)&&
              val.hash.indexOf(this._.get(this.view.items[viewName], 'route.hash', '')) !== -1
            ) {
              this.openView(this.view.items[viewName].name, val.hash.substring(this._.get(this.view.items[viewName], 'route.length', 0)))

              return
            }
          }
        }
      },

      windowSize(val) {
        if (val === 'xs') {
          if (this.view.opened === this.view.items.detail.name) {
            this.$router.push(this.localePath({
              name: this.$routes.routines.detail,
              params: {
                id: this.view.items.detail.id,
              },
            }))

            return
          }
        }
      },

      fetchingRoutines(val) {
        if (!val) {
          this._checkRoute()
        }
      },

    },

    fetch({ app, store, error }) {
      if (!store.getters['entities/trigger/firstLoadFinished']()) {
        return store.dispatch('entities/trigger/fetch', null, {
          root: true,
        })
          .then(() => {
            const routinesCount = store.getters['entities/trigger/query']().count()

            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/hideHamburger', null, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: app.i18n.t('application.headings.routines.list'),
              subHeading: app.i18n.tc('application.subHeadings.routines.list', routinesCount, { count: routinesCount }),
            }, {
              root: true,
            })

            store.dispatch('header/setAddButton', {
              name: app.i18n.t('application.buttons.add.title'),
              callback: null, // Null is set because of SSR and serialization
            }, {
              root: true,
            })

            store.dispatch('header/addTab', {
              name: app.i18n.t('application.buttons.automation.title'),
              link: app.localePath({
                name: app.$routes.routines.list,
                hash: ROUTINES_HASH_AUTOMATION,
              }),
            }, {
              root: true,
            })

            store.dispatch('header/addTab', {
              name: app.i18n.t('application.buttons.schedules.title'),
              link: app.localePath({
                name: app.$routes.routines.list,
                hash: ROUTINES_HASH_SCHEDULES,
              }),
            }, {
              root: true,
            })

            store.dispatch('bottomNavigation/resetStore', null, {
              root: true,
            })
          })
          .catch(() => {
            error({ statusCode: 503, message: 'Something went wrong' })
          })
      }
    },

    beforeMount() {
      if (
        this.$store.getters['entities/trigger/query']().count() === 0 &&
        !this.fetchingRoutines &&
        !this.$store.getters['entities/trigger/firstLoadFinished']()
      ) {
        this.$store.dispatch('entities/trigger/fetch', null, {
          root: true,
        })
          .catch(() => {
            this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          })
      }

      this._configureNavigation()
    },

    mounted() {
      this._calculateWindowHeight()

      if (!this.fetchingRoutines) {
        this._checkRoute()
      }

      window.addEventListener('resize', this._calculateWindowHeight)
    },

    beforeDestroy() {
      window.removeEventListener('resize', this._calculateWindowHeight)
    },

    methods: {

      createNewRoutine() {
        if (this.windowSize === 'xs') {
          this.$router.push(this.localePath(this.$routes.routines.create))
        } else {
          this.openView('create')
        }
      },

      /**
       * Event fired by loaded component
       *
       * @param {String} component
       */
      componentLoaded(component) {
        if (this.loading.hasOwnProperty(component)) {
          this.loading[component] = null
        }
      },

      /**
       * Open routines view
       *
       * @param {String} view
       * @param {String} [id]
       */
      openView(view, id) {
        if (this.view.items.hasOwnProperty(view)) {
          switch (view) {
            case this.view.items.detail.name:
              if (this.windowSize === 'xs') {
                this.$router.push(this.localePath({
                  name: this.$routes.routines.detail,
                  params: {
                    id,
                  },
                }))
              } else {
                this.$router.push(this.localePath({
                  name: this.$routes.routines.list,
                  hash: `${this.view.items.detail.route.hash}-${id}`,
                }))
              }
              break
          }

          this.view.opened = view

          if (this.view.items[view].hasOwnProperty('id') && typeof id !== 'undefined') {
            this.view.items[view].id = id
          }
        }

        if (this.loading.hasOwnProperty(view) && typeof id !== 'undefined') {
          this.loading[view] = id
        }

        // Reconfigure navigation after changes
        this._configureNavigation()
      },

      /**
       * Close routines view window
       *
       * @param {String} view
       */
      closeView(view) {
        this.$router.push(this.localePath(this.$routes.routines.list))

        this.view.opened = null

        if (typeof view !== 'undefined' && this.view.items.hasOwnProperty(view)) {
          if (this.view.items[view].hasOwnProperty('id')) {
            this.view.items[view].id = null
          }
        }

        this.$el.focus()
      },

      /**
       * Double click and single click event handler
       *
       * @param {Object} event
       * @param {Object} item
       * @param {String} item.id
       */
      oneClick(event, item) {
        const path = this.getEventElementsPath(event)

        for (const pathItem of path) {
          if (typeof pathItem.getAttribute === 'function') {
            if (pathItem.getAttribute('role') === 'button' || pathItem.getAttribute('role') === 'dialog') {
              return
            }
          }
        }

        this.click.clicks++

        if (this.click.clicks === 1) {
          const that = this

          this.click.timer = setTimeout(() => {
            that.openView(this.view.items.detail.name, item.id)

            that.click.clicks = 0
          }, this.click.delay)
        }
      },

      /**
       * Check route and if is needed open detail window
       *
       * @private
       */
      _checkRoute() {
        if (this.$route.hash !== '') {
          if (this.$route.hash.search(this.view.items.detail.route.hash) !== -1) {
            this.openView(this.view.items.detail.name, this.$route.hash.substring(this.view.items.detail.route.length))
          }
        }
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

        this.$store.dispatch('header/hideHamburger', null, {
          root: true,
        })

        this.$store.dispatch('header/setHeading', {
          heading: this.$t('application.headings.routines.list'),
          subHeading: this.$tc('application.subHeadings.routines.list', this.routines.length, { count: this.routines.length }),
        }, {
          root: true,
        })

        if (this.routines.length) {
          this.$store.dispatch('header/setAddButton', {
            name: this.$t('application.buttons.add.title'),
            callback: () => {
              this.createNewRoutine()
            },
          }, {
            root: true,
          })
        }

        this.$store.dispatch('header/addTab', {
          name: this.$t('application.buttons.automation.title'),
          link: this.localePath({
            name: this.$routes.routines.list,
            hash: ROUTINES_HASH_AUTOMATION,
          }),
        }, {
          root: true,
        })

        this.$store.dispatch('header/addTab', {
          name: this.$t('application.buttons.schedules.title'),
          link: this.localePath({
            name: this.$routes.routines.list,
            hash: ROUTINES_HASH_SCHEDULES,
          }),
        }, {
          root: true,
        })

        this.$store.dispatch('bottomNavigation/resetStore', null, {
          root: true,
        })
      },

      /**
       * Calculate viewport size after window resizing
       *
       * @private
       */
      _calculateWindowHeight() {
        if (this.windowSize === 'xs') {
          this.offCanvasHeight = null
        } else {
          this.offCanvasHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        }
      },

    },

    head() {
      return {
        title: this.$t('meta.routines.list.title'),
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>
