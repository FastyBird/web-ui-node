<template>
  <div class="fb-routines-list-view__container">
    <routine-list-carousel />

    <div class="fb-routines-list-view__items-container">
      <routine-list-item
        v-for="routine in routines"
        :key="routine.id"
        :routine="routine"
        @click="oneClick"
      />
    </div>

    <off-canvas
      v-if="windowSize !== 'xs'"
      :show="view.opened === view.items.detail.name || view.opened === view.items.settings.name"
      @close="closeView(view.opened)"
    >
      <routine-detail
        v-if="view.opened === view.items.detail.name"
        :id="view.items.detail.id"
        slot="body"
        @close="closeView(view.opened)"
      />

      <routine-detail
        v-if="view.opened === view.items.settings.name"
        :id="view.items.settings.id"
        slot="body"
        :settings="true"
        @close="closeView(view.opened)"
      />
    </off-canvas>

    <fb-modal-window
      v-if="(view.opened === view.items.type.name || view.opened === view.items.create.name) && windowSize !== 'xs'"
      @close="closeView(view.opened)"
    >
      <template slot="modal-content">
        <select-routine-type
          v-if="view.opened === view.items.type.name"
          @close="closeView(view.opened)"
        />

        <create-routine
          v-if="view.opened === view.items.create.name"
          :type="view.items.create.type"
          @close="closeView(view.opened)"
        />
      </template>
    </fb-modal-window>

    <mobile-bottom-menu
      v-if="windowSize === 'xs'"
      :show-header="true"
      :show="view.opened === view.items.type.name"
      :heading="'Add new'"
      @close="closeView(view.opened)"
    >
      <select-routine-type-phone slot="items" />
    </mobile-bottom-menu>

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
          @click.prevent="openView(view.items.type.name)"
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
  ROUTINES_HASH_CREATE,
} from '@/configuration/routes'

import RoutineListItem from '@/components/routines/ListItem'
import RoutineListCarousel from '@/components/routines/ListCarousel'

const RoutineDetail = () => import('@/components/routines/Desktop/Detail')
const SelectRoutineType = () => import('@/components/routines/Desktop/SelectType')
const CreateRoutine = () => import('@/components/routines/Desktop/Create')

const SelectRoutineTypePhone = () => import('@/components/routines/Phone/SelectType')

export default {

  name: 'RoutinesListPage',

  components: {
    RoutineListItem,
    RoutineListCarousel,

    RoutineDetail,
    SelectRoutineType,
    CreateRoutine,

    SelectRoutineTypePhone,
  },

  transition: 'fade',

  data() {
    return {
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
          type: {
            name: 'type',
          },
          create: {
            name: 'create',
            type: null,
            route: {
              hash: ROUTINES_HASH_CREATE,
              length: 8,
            },
          },
        },
      },
      click: {
        delay: 200,
        clicks: 0,
        timer: null,
      },
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
     * Flag signalizing that routines are loading from server
     *
     * @returns {Boolean}
     */
    fetchingRoutines() {
      return this.$store.getters['entities/trigger/fetching']()
    },

  },

  watch: {

    '$route'(val) {
      if (this._.get(val, 'hash', '') === '') {
        this.closeView()
      } else if (this._.get(val, 'hash', '') !== '') {
        for (const viewName in this.view.items) {
          if (
            Object.prototype.hasOwnProperty.call(this.view.items, viewName) &&
            this._.get(this.view.items[viewName], 'route.hash', '') !== '' &&
            val.hash.includes(this._.get(this.view.items[viewName], 'route.hash', ''))
          ) {
            this.openView(viewName, val.hash.substring(this._.get(this.view.items[viewName], 'route.length', 0)))

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
        } else if (this.view.opened === this.view.items.settings.name) {
          this.$router.push(this.localePath({
            name: this.$routes.routines.detail,
            params: {
              id: this.view.items.settings.id,
            },
            hash: ROUTINES_HASH_SETTINGS,
          }))
        } else if (this.view.opened === this.view.items.create.name) {
          this.$router.push(this.localePath({
            name: this.$routes.routines.create,
            query: {
              type: this.view.items.create.type,
            },
          }))
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

          store.dispatch('header/setHeading', {
            heading: app.i18n.t('routines.headings.allRoutines'),
            subHeading: app.i18n.tc('routines.subHeadings.allRoutines', routinesCount, { count: routinesCount }),
          }, {
            root: true,
          })

          store.dispatch('header/setAddButton', {
            name: app.i18n.t('application.buttons.add.title'),
            callback: null, // Null is set because of SSR and serialization
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
    if (!this.fetchingRoutines) {
      this._checkRoute()
    }
  },

  methods: {

    /**
     * Open routines view
     *
     * @param {String} view
     * @param {String} [id]
     */
    openView(view, id) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        for (const viewName in this.view.items) {
          if (Object.prototype.hasOwnProperty.call(this.view.items, viewName)) {
            if (Object.prototype.hasOwnProperty.call(this.view.items[viewName], 'id')) {
              this.view.items[viewName].id = null
            }
          }
        }

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

          case this.view.items.settings.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({
                name: this.$routes.routines.detail,
                params: {
                  id,
                },
                hash: ROUTINES_HASH_SETTINGS,
              }))
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.routines.list,
                hash: `${this.view.items.settings.route.hash}-${id}`,
              }))
            }
            break

          case this.view.items.create.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({
                name: this.$routes.routines.create,
                query: {
                  type: id,
                },
              }))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.routines.list,
                hash: `${this.view.items.create.route.hash}-${id}`,
              }))
            }
            break
        }

        this.view.opened = view

        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'id') && typeof id !== 'undefined') {
          this.view.items[view].id = id

          const routine = this.$store.getters['entities/trigger/query']()
            .where('id', id)
            .first()

          if (routine === null) {
            this.closeView(view)
          }
        }

        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'type') && typeof id !== 'undefined') {
          this.view.items[view].type = id
        }
      }
    },

    /**
     * Close routines view window
     *
     * @param {String} view
     */
    closeView(view) {
      this.$router.push(this.localePath(this.$routes.routines.list))

      this.view.opened = null

      if (typeof view !== 'undefined' && Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'id')) {
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
        this.click.timer = setTimeout(() => {
          this.openView(this.view.items.detail.name, item.id)

          this.click.clicks = 0
        }, this.click.delay)
      } else {
        clearTimeout(this.click.timer)

        this.click.clicks = 0

        this.openView(this.view.items.settings.name, item.id)
      }
    },

    /**
     * Check route and if is needed open detail window
     *
     * @private
     */
    _checkRoute() {
      if (this.$route.hash !== '') {
        if (this.$route.hash.includes(this.view.items.detail.route.hash)) {
          this.openView(this.view.items.detail.name, this.$route.hash.substring(this.view.items.detail.route.length))
        } else if (this.$route.hash.includes(this.view.items.settings.route.hash)) {
          this.openView(this.view.items.settings.name, this.$route.hash.substring(this.view.items.settings.route.length))
        } else if (this.$route.hash.includes(this.view.items.create.route.hash)) {
          this.openView(this.view.items.create.name, this.$route.hash.substring(this.view.items.create.route.length))
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

      this.$store.dispatch('header/setHeading', {
        heading: this.$t('routines.headings.allRoutines'),
        subHeading: this.$tc('routines.subHeadings.allRoutines', this.routines.length, { count: this.routines.length }),
      }, {
        root: true,
      })

      if (this.routines.length) {
        this.$store.dispatch('header/setAddButton', {
          name: this.$t('application.buttons.add.title'),
          callback: () => {
            this.openView(this.view.items.type.name)
          },
        }, {
          root: true,
        })
      }

      this.$store.dispatch('bottomNavigation/resetStore', null, {
        root: true,
      })
    },

  },

  head() {
    return {
      title: this.$t('meta.routines.list.title'),
    }
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
