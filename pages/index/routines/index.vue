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
      v-if="windowSize !== 'xs' && isMounted"
      :show="view.opened === view.items.detail.name || view.opened === view.items.settings.name"
      @close="closeView"
    >
      <routine-detail
        v-if="view.opened === view.items.detail.name || view.opened === view.items.settings.name"
        :id="view.opened === view.items.detail.name ? view.items.detail.id : view.items.settings.id"
        slot="body"
        :settings="view.opened === view.items.settings.name"
        @close="closeView"
      />
    </off-canvas>

    <create-routine
      v-if="view.opened === view.items.create.name && windowSize !== 'xs'"
      @close="closeView"
    />

    <phone-bottom-menu
      v-if="windowSize === 'xs' && isMounted"
      :show-header="true"
      :show="view.opened === view.items.type.name"
      :heading="$t('routines.headings.addNew')"
      @close="closeView"
    >
      <select-routine-type-phone slot="items" />
    </phone-bottom-menu>

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
import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import {
  ROUTINES_HASH_DETAIL,
  ROUTINES_HASH_SETTINGS,
  ROUTINES_HASH_CREATE,
} from '~/configuration/routes'

import Trigger from '~/models/triggers-node/Trigger'

import SelectRoutineTypePhone from '~/components/routines/Phone/SelectType'

import RoutineListItem from '~/components/routines/ListItem'
import RoutineListCarousel from '~/components/routines/ListCarousel'

const RoutineDetail = () => ({
  component: import('~/components/routines/Desktop/Detail'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const CreateRoutine = () => ({
  component: import('~/components/routines/Desktop/Create'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})

const viewSettings = {
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
}

export default {

  name: 'RoutinesListPage',

  components: {
    RoutineListItem,
    RoutineListCarousel,

    RoutineDetail,
    CreateRoutine,

    SelectRoutineTypePhone,
  },

  transition: 'fade',

  data() {
    return {
      view: Object.assign({}, viewSettings),
      click: {
        delay: 200,
        clicks: 0,
        timer: null,
      },
      isMounted: false,
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
     * Get all created & loaded routines
     *
     * @returns {Array}
     */
    routines() {
      return Trigger
        .query()
        .with('actions')
        .with('conditions')
        .with('notifications')
        .where('isForChannel', false)
        .orderBy('name')
        .get()
    },

    /**
     * Flag signalizing that routines are loading from server
     *
     * @returns {Boolean}
     */
    fetchingRoutines() {
      return Trigger.getters('fetching')()
    },

  },

  watch: {

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

    routines() {
      this._configureNavigation()
    },

  },

  fetch({ app, store, error }) {
    if (!store.getters['entities/trigger/firstLoadFinished']()) {
      return store.dispatch('entities/trigger/fetch', null, {
        root: true,
      })
        .then(() => {
          const routinesCount = Trigger
            .query()
            .where('isForChannel', false)
            .count()

          store.dispatch('template/resetHeadings', null, {
            root: true,
          })

          store.dispatch('template/resetButtons', null, {
            root: true,
          })

          store.dispatch('template/setHeading', {
            heading: app.i18n.t('routines.headings.allRoutines'),
            subHeading: app.i18n.tc('routines.subHeadings.allRoutines', routinesCount, { count: routinesCount }),
          }, {
            root: true,
          })

          store.dispatch('template/setActionButton', {
            name: app.i18n.t('application.buttons.add.title'),
          }, {
            root: true,
          })

          store.dispatch('app/bottomMenuExpand', null, {
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
      Trigger.query().count() === 0 &&
      !this.fetchingRoutines &&
      !Trigger.getters('firstLoadFinished')()
    ) {
      Trigger.dispatch('fetch')
        .catch(() => {
          this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        })
    }

    this.$bus.$on('heading_action_button-clicked', this.actionButtonAction)

    this._configureNavigation()
  },

  mounted() {
    if (!this.fetchingRoutines) {
      this._checkRoute()
    }

    this.$bus.$emit('wait-page_reloading', false)

    this.isMounted = true
  },

  beforeDestroy() {
    this.$bus.$off('heading_action_button-clicked', this.actionButtonAction)
  },

  methods: {

    /**
     * Open selected view
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
              this.$bus.$emit('wait-page_reloading', 10)

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
              this.$bus.$emit('wait-page_reloading', 10)

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
                hash: this.view.items.create.route.hash,
              }))
            }
            break
        }

        this.view.opened = view

        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'id') && typeof id !== 'undefined') {
          this.view.items[view].id = id

          const routine = Trigger.find(id)

          if (routine === null) {
            this.closeView()
          }
        }

        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'type') && typeof id !== 'undefined') {
          this.view.items[view].type = id
        }
      }
    },

    /**
     * Close opened view
     */
    closeView() {
      this.$router.push(this.localePath(this.$routes.routines.list))

      // Reset to default values
      Object.assign(this.view, viewSettings)

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
     * Header action button action event
     */
    actionButtonAction() {
      if (this.windowSize === 'xs') {
        this.openView(this.view.items.type.name)
      } else {
        this.openView(this.view.items.create.name)
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
      this.$store.dispatch('template/resetHeadings', null, {
        root: true,
      })

      this.$store.dispatch('template/resetButtons', null, {
        root: true,
      })

      this.$store.dispatch('template/setHeading', {
        heading: this.$t('routines.headings.allRoutines'),
        subHeading: this.$tc('routines.subHeadings.allRoutines', this.routines.length, { count: this.routines.length }),
      }, {
        root: true,
      })

      if (this.routines.length) {
        this.$store.dispatch('template/setActionButton', {
          name: this.$t('application.buttons.add.title'),
        }, {
          root: true,
        })
      }

      this.$store.dispatch('app/bottomMenuExpand', null, {
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
