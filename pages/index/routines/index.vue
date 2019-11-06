<template>
  <div class="fb-routines-list-view__container">
    <div class="fb-routines-list-view__navigation">
      <fb-button
        :to="localePath($routes.routines.list)"
        variant="primary"
        uppercase
        disabled
        class="fb-routines-list-view__navigation-button fb-routines-list-view__navigation-button-active"
      >
        {{ $t('buttons.automation.title') }}
      </fb-button>

      <fb-button
        :to="localePath($routes.routines.list)"
        variant="primary"
        uppercase
        class="fb-routines-list-view__navigation-button"
      >
        {{ $t('buttons.schedules.title') }}
      </fb-button>

      <fb-button
        variant="outline-primary"
        uppercase
        pill
        class="fb-routines-list-view__add-button"
        @click="openRoutineCreate"
      >
        <font-awesome-icon icon="plus" />
      </fb-button>
    </div>

    <div class="fb-routines-list-view__items-container row p-t-md">
      <routines-list-item
        v-for="routine in routines"
        :key="routine.id"
        :routine="routine"
        class="col-md-6 col-lg-4"
        @click="oneClick"
      />
    </div>

    <!-- ROUTINE DETAIL FOR LARGE DEVICES //-->
    <off-canvas
      :show="view.opened.type !== null && windowSize !== 'xs'"
      @close="closeView(view.opened.type)"
    >
      <off-canvas-body
        v-if="view.opened.type !== null && windowSize !== 'xs'"
        slot="body"
        :heading="detailHeading()"
        :sub-heading="detailSubHeading()"
      >
        <template slot="left-button">
          <button
            class="button"
            @click.prevent="closeView(view.opened.type)"
          >
            <font-awesome-icon icon="times" />
          </button>
        </template>

        <transition
          slot="body"
          name="fade"
          mode="out-in"
        >
          <routines-detail
            v-if="view.opened.type === view.detail.name"
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
      :text="$t('texts.loading')"
    />

    <div
      v-show="!fetchingRoutines && routines.length === 0"
      class="p-x-md"
    >
      <div class="row">
        <div class="col-8 offset-2 col-sm-6 offset-sm-3 col-md-4 offset-md-4 col-xl-2 offset-xl-5 p-t-lg">
          <div class="text-center p-a-lg">
            <span class="icon-with-child">
              <font-awesome-icon
                icon="project-diagram"
                class="icon-5x text-muted m-y-lg"
              />
              <span
                class="bg-primary circle sq-32 icon-2x icon-child m-y-lg"
                style="padding-top: 1px;"
              >
                <font-awesome-icon icon="plus" />
              </span>
            </span>
          </div>

          <p class="text-center m-b-lg">
            {{ $t('texts.noRoutines') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    ROUTINES_LIST_LINK,
    ROUTINES_ROUTINE_DETAIL_LINK,
    ROUTINES_CREATE_LINK,

    ROUTINES_HASH_DETAIL,
  } from '@/configuration/routes'

  import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

  import RoutinesListItem from '@/components/routines/List/Item'

  // Routine detail
  const RoutinesDetail = () => ({
    component: import('@/components/routines/Detail'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  // Off canvas details view
  const OffCanvas = () => ({
    component: import('@/components/layout/OffCanvas'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const OffCanvasBody = () => ({
    component: import('@/components/layout/OffCanvas/Body'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  export default {

    name: 'RoutinesListPage',

    components: {
      RoutinesListItem,
      RoutinesDetail,

      OffCanvas,
      OffCanvasBody,
    },

    transition: 'fade',

    data() {
      return {
        loading: {
          detail: null,
        },
        view: {
          opened: {
            type: null,
          },
          detail: {
            name: 'detail',
            id: null,
            route: {
              hash: ROUTINES_HASH_DETAIL,
              length: 8,
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
          .orderBy('name')
          .all()
      },

      /**
       * View thing data
       *
       * @returns {(Routine|null)}
       */
      viewRoutine() {
        if (this.view.opened.type === null) {
          return null
        }

        let routineId = 0

        switch (this.view.opened.type) {
          case this.view.detail.name:
            routineId = this.view.detail.id
            break
        }

        return this.$store.getters['entities/trigger/query']()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .where('id', routineId)
          .first()
      },

      /**
       * Flag signalizing that routines are loading from server
       *
       * @returns {Boolean}
       */
      fetchingRoutines() {
        return this._.get(this.$store, 'state.entities.trigger.semaphore.fetching.items', false)
      },

    },

    watch: {

      '$route'(val) {
        if (this._.get(val, 'hash', '') === '') {
          this.closeView()
        } else if (this._.get(val, 'hash', '') !== '') {
          for (const viewName in this.view) {
            if (
              this.view.hasOwnProperty(viewName)
              && viewName !== 'opened'
              && val.hash.indexOf(this._.get(this.view[viewName], 'route.hash', '')) !== -1
            ) {
              this.openView(viewName, val.hash.substring(this._.get(this.view[viewName], 'route.length', 0)))

              return
            }
          }
        }
      },

      windowSize(val) {
        if ((val === 'xs')) {
          if (this.view.opened.type === this.view.detail.name) {
            this.$router.push(this.localePath({ name: ROUTINES_ROUTINE_DETAIL_LINK, params: { id: this.view.detail.id } }))

            return
          }
        }

        this._calculateWindowHeight()
      },

      fetchingRoutines(val) {
        if (!val) {
          this._checkRoute()
        }
      },

    },

    fetch({ app, store }) {
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
          })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
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
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }

      this._configureNavigation()
    },

    mounted() {
      this._calculateWindowHeight()

      if (!this.fetchingRoutines) {
        this._checkRoute()
      }
    },

    methods: {

      ...mapActions('header', [
        'setHeading',
        'setRightButton',
        'resetStore',
      ]),

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
       * Get detail window heading
       *
       * @returns {String}
       */
      detailHeading() {
        if (this.view.opened.type === this.view.detail.name) {
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
        if (this.view.opened.type === this.view.detail.name) {
          return this.viewRoutine.hasComment ? this.viewRoutine.comment : null
        }

        return 'N/A'
      },

      openRoutineCreate() {
        if (this.windowSize === 'xs') {
          this.$router.push(this.localePath({ name: ROUTINES_CREATE_LINK }))
        } else {
          this.openView('create')
        }
      },

      /**
       * Open routines view
       *
       * @param {String} view
       * @param {String} id
       */
      openView(view, id) {
        for (const viewName in this.view) {
          if (this.view.hasOwnProperty(viewName)) {
            if (this.view[viewName].hasOwnProperty('id')) {
              this.view[viewName].id = null
            }
          }
        }

        switch (view) {
          case this.view.detail.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({ name: ROUTINES_ROUTINE_DETAIL_LINK, params: { id } }))
            } else {
              this.$router.push(`${this.localePath({ name: ROUTINES_LIST_LINK })}${this.view.detail.route.hash}${id}`)
            }
            break
        }

        if (this.view.hasOwnProperty(view)) {
          this.view.opened.type = view

          if (this.view[view].hasOwnProperty('id') && typeof id !== 'undefined') {
            this.view[view].id = id
          }
        }

        if (this.loading.hasOwnProperty(view) && typeof id !== 'undefined') {
          this.loading[view] = id
        }
      },

      /**
       * Close routines view window
       *
       * @param {String} view
       */
      closeView(view) {
        this.$router.push(this.localePath({ name: ROUTINES_LIST_LINK }))

        this.view.opened.type = null

        if (typeof view !== 'undefined' && this.view.hasOwnProperty(view)) {
          if (this.view[view].hasOwnProperty('id')) {
            this.view[view].id = null
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
            that.openView(this.view.detail.name, item.id)

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
          if (this.$route.hash.search(this.view.detail.route.hash) !== -1) {
            const routine = this._.find(this.routines, { id: this.$route.hash.substring(this.view.detail.route.length) })

            if (routine) {
              this.openView(this.view.detail.name, routine)
            }
          }
        }
      },

      /**
       * Calculate viewport size after window resizing
       *
       * @private
       */
      _calculateWindowHeight() {
        this.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

        if (this.windowSize === 'xs') {
          this.offCanvasHeight = null
        } else {
          this.offCanvasHeight = this.viewportHeight - 50
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

        this.$store.dispatch('bottomNavigation/resetStore', null, {
          root: true,
        })
      },

    },

    head() {
      return {
        title: this.$t('meta.title'),
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>

<i18n src="./locales.json" />
