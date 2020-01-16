<template>
  <div class="fb-iot-groups-list-view__container">
    <div class="fb-iot-groups-list-view__items-container">
      <group-list-item
        v-for="group in groups"
        :key="group.id"
        :group="group"
        @click="oneClick"
      />
    </div>

    <!-- DEVICE DETAIL FOR LARGE DEVICES //-->
    <off-canvas
      :show="(view.opened.type === view.detail.name || view.opened.type === view.settings.name) && windowSize !== 'xs'"
      @close="closeView(view.opened.type)"
    >
      <off-canvas-body
        v-if="view.opened.type !== null && windowSize !== 'xs'"
        slot="body"
        :heading="detailHeading"
        :sub-heading="detailSubHeading"
      >
        <template slot="left-button">
          <button
            class="button"
            @click.prevent="handleDetailLeftButton"
          >
            <font-awesome-icon
              v-if="view.opened.type === view.detail.name"
              icon="times"
            />
            <font-awesome-icon
              v-else
              icon="arrow-lef"
            />
          </button>
        </template>

        <template slot="right-button">
          <button
            v-if="view.opened.type === view.detail.name"
            class="button"
            @click.prevent="openView(view.settings.name, viewGroup.id)"
          >
            <font-awesome-icon icon="cogs" />
          </button>
          <button
            v-if="view.opened.type === view.settings.name"
            class="button"
            @click.prevent="closeView(view.opened.type)"
          >
            <font-awesome-icon icon="times" />
          </button>
        </template>
        {{ view.opened.type }}
        <transition
          slot="body"
          name="fade"
          mode="out-in"
        >
          <group-detail
            v-if="viewDevice !== null && view.opened.type === view.detail.name"
            :group="viewDevice"
            :style="`height: ${offCanvasHeight}px`"
            class="fb-iot-groups-list-view__off-canvas-body"
          />

          <group-settings
            v-if="viewDevice !== null && view.opened.type === view.settings.name"
            :group="viewDevice"
            :style="`height: ${offCanvasHeight}px`"
            class="fb-iot-groups-list-view__off-canvas-body"
            @removed="closeView(view.opened.type)"
          />
        </transition>
      </off-canvas-body>
    </off-canvas>

    <fb-loading-box
      v-if="fetchingGroups && groups.length === 0"
      :text="$t('groups.texts.loadingGroups')"
    />

    <no-results
      v-if="!fetchingGroups && groups.length === 0"
      :message="$t('groups.texts.noGroups')"
      icon="folder"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import {
  GROUPS_GROUP_SETTINGS_LINK,

  GROUPS_HASH_DETAIL,
  GROUPS_HASH_SETTINGS,
  GROUPS_HASH_CREATE,
} from '@/configuration/routes'

import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import GroupListItem from '@/components/groups/ListItem'

// Off canvas details view
import OffCanvas from '@/components/layout/OffCanvas'

import NoResults from '@/components/layout/NoResults'

const GroupDetail = () => ({
  component: import('@/components/groups/Detail'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const GroupSettings = () => ({
  component: import('@/components/groups/Settings'),
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

  name: 'GroupsListPage',

  components: {
    GroupListItem,
    GroupDetail,
    GroupSettings,

    OffCanvas,
    OffCanvasBody,
    NoResults,
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
        connect: {
          name: 'connect',
          type: undefined,
          id: null,
          route: {
            hash: GROUPS_HASH_CREATE,
            length: 8,
          },
        },
        detail: {
          name: 'detail',
          type: undefined,
          id: null,
          route: {
            hash: GROUPS_HASH_DETAIL,
            length: 8,
          },
        },
        settings: {
          name: 'settings',
          id: null,
          route: {
            hash: GROUPS_HASH_SETTINGS,
            length: 10,
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
     * Get all registered & loaded groups
     *
     * @returns {Array}
     */
    groups() {
      return this.$store.getters['entities/group/query']()
        .with('properties')
        .with('socket')
        .orderBy('label')
        .all()
    },

    /**
     * View group data
     *
     * @returns {(Group|null)}
     */
    viewGroup() {
      if (this.view.opened.type === null) {
        return null
      }

      let groupId = 0

      switch (this.view.opened.type) {
        case this.view.detail.name:
          groupId = this.view.detail.id
          break

        case this.view.settings.name:
          groupId = this.view.settings.id
          break
      }

      return this.$store.getters['entities/group/query']()
        .where('id', groupId)
        .first()
    },

    /**
     * Flag signalizing that groups are loading from server
     *
     * @returns {Boolean}
     */
    fetchingGroups() {
      return this.$store.getters['entities/group/fetching']()
    },

    /**
     * Get detail window heading
     *
     * @returns {String}
     */
    detailHeading() {
      if (this.view.opened.type === this.view.detail.name) {
        return this.viewGroup.label
      } else if (this.view.opened.type === this.view.settings.name) {
        return this.viewGroup.label
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
        return this.viewGroup.hasComment ? this.viewGroup.comment : null
      } else if (this.view.opened.type === this.view.settings.name) {
        return this.viewGroup.hasComment ? this.viewGroup.comment : null
      }

      return null
    },

  },

  watch: {

    '$route'(val) {
      if (this._.get(val, 'hash', '') === '') {
        this.closeView()
      } else if (this._.get(val, 'hash', '') !== '') {
        for (const viewName in this.view) {
          if (
            Object.prototype.hasOwnProperty.call(this.view, viewName) &&
            viewName !== 'opened' &&
            val.hash.includes(this._.get(this.view[viewName], 'route.hash', ''))
          ) {
            this.openView(viewName, val.hash.substring(this._.get(this.view[viewName], 'route.length', 0)))

            return
          }
        }
      }
    },

    windowSize(val) {
      if (val === 'xs') {
        if (this.view.opened.type === this.view.settings.name) {
          this.$router.push(this.localePath({ name: GROUPS_GROUP_SETTINGS_LINK, params: { id: this.view.settings.id } }))

          return
        } else if (this.view.opened.type === this.view.detail.name) {
          this.$router.push(this.localePath({ name: this.$routes.groups.detail, params: { id: this.view.detail.id } }))

          return
        }
      }

      this._calculateWindowHeight()
    },

    fetchingGroups(val) {
      if (!val) {
        this._checkRoute()
      }
    },

  },

  fetch({ app, store }) {
    if (!store.getters['entities/group/firstLoadFinished']()) {
      return store.dispatch('entities/group/fetch', null, {
        root: true,
      })
        .then(() => {
          const groupsCount = store.getters['entities/group/query']().count()

          store.dispatch('header/resetStore', null, {
            root: true,
          })

          store.dispatch('header/hideHamburger', null, {
            root: true,
          })

          store.dispatch('header/setHeading', {
            heading: app.i18n.t('application.headings.groups.list'),
            subHeading: app.i18n.tc('application.subHeadings.groups.list', groupsCount, { count: groupsCount }),
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
            name: app.i18n.t('application.buttons.things.title'),
            link: app.localePath(app.$routes.things.list),
          }, {
            root: true,
          })

          store.dispatch('header/addTab', {
            name: app.i18n.t('application.buttons.groups.title'),
            link: app.localePath(app.$routes.groups.list),
          }, {
            root: true,
          })

          store.dispatch('bottomNavigation/resetStore', null, {
            root: true,
          })
        })
        .catch(() => {
          store.dispatch('header/resetStore', null, {
            root: true,
          })

          store.dispatch('header/hideHamburger', null, {
            root: true,
          })

          store.dispatch('header/setHeading', {
            heading: app.i18n.t('application.headings.groups.list'),
            subHeading: app.i18n.tc('application.subHeadings.groups.list', 0, { count: 0 }),
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
            name: app.i18n.t('application.buttons.things.title'),
            link: app.localePath(app.$routes.things.list),
          }, {
            root: true,
          })

          store.dispatch('header/addTab', {
            name: app.i18n.t('application.buttons.groups.title'),
            link: app.localePath(app.$routes.groups.list),
          }, {
            root: true,
          })

          store.dispatch('bottomNavigation/resetStore', null, {
            root: true,
          })
        })
    }
  },

  beforeMount() {
    if (
      this.$store.getters['entities/group/query']().count() === 0 &&
      !this.fetchingGroups &&
      !this.$store.getters['entities/group/firstLoadFinished']()
    ) {
      this.$store.dispatch('entities/group/fetch', {}, {
        root: true,
      })
        .catch((e) => {
          // eslint-disable-next-line
          console.log(e)
        })
    }

    this._configureNavigation()
  },

  mounted() {
    this._calculateWindowHeight()

    if (!this.fetchingGroups) {
      this._checkRoute()
    }
  },

  methods: {

    /**
     * Event fired by loaded component
     *
     * @param {String} component
     */
    componentLoaded(component) {
      if (Object.prototype.hasOwnProperty.call(this.loading, component)) {
        this.loading[component] = null
      }
    },

    openGroupCreate() {
      if (this.windowSize === 'xs') {
        this.$router.push(this.localePath(this.$routes.groups.create))
      } else {
        this.openView('create')
      }
    },

    /**
     * Open group dialog
     *
     * @param {String} view
     * @param {String} id
     */
    openView(view, id) {
      if (
        this.view.opened.type === view &&
        (
          (Object.prototype.hasOwnProperty.call(this.view[view], 'id') && typeof id !== 'undefined' && this.view[view].id === id) || (typeof id === 'undefined')
        )
      ) {
        return
      }

      for (const viewName in this.view) {
        if (Object.prototype.hasOwnProperty.call(this.view, viewName)) {
          if (Object.prototype.hasOwnProperty.call(this.view[viewName], 'id')) {
            this.view[viewName].id = null
          }

          if (Object.prototype.hasOwnProperty.call(this.view[viewName], 'groupId')) {
            this.view[viewName].groupId = null
          }
        }
      }

      switch (view) {
        case this.view.detail.name:
          if (this.windowSize === 'xs') {
            this.$router.push(this.localePath({
              name: this.$routes.groups.detail,
              params: {
                id,
              },
            }))
          } else {
            this.$router.push(this.localePath({
              name: this.$routes.groups.list,
              hash: `${this.view.detail.route.hash}-${id}`,
            }))
          }
          break

        case this.view.settings.name:
          if (this.windowSize === 'xs') {
            this.$router.push(this.localePath({
              name: this.$routes.groups.detail,
              params: {
                id,
              },
              hash: GROUPS_HASH_SETTINGS,
            }))
          } else {
            this.$router.push(this.localePath({
              name: this.$routes.groups.list,
              hash: `${this.view.settings.route.hash}-${id}`,
            }))
          }
          break
      }

      if (Object.prototype.hasOwnProperty.call(this.view, view)) {
        this.view.opened.type = view

        if (Object.prototype.hasOwnProperty.call(this.view[view], 'id') && typeof id !== 'undefined') {
          this.view[view].id = id
        }
      }

      if (Object.prototype.hasOwnProperty.call(this.loading, view) && typeof id !== 'undefined') {
        this.loading[view] = id
      }
    },

    /**
     * Close opened view
     *
     * @param {String} [view]
     */
    closeView(view) {
      this.$router.push(this.localePath(this.$routes.groups.list))

      this.view.opened.type = null

      if (typeof view !== 'undefined' && Object.prototype.hasOwnProperty.call(this.view, view)) {
        if (Object.prototype.hasOwnProperty.call(this.view[view], 'id')) {
          this.view[view].id = null
        }

        if (Object.prototype.hasOwnProperty.call(this.view[view], 'groupId')) {
          this.view[view].groupId = null
        }
      }

      this.$el.focus()
    },

    /**
     * Switch detail display according to actual state
     */
    handleDetailLeftButton() {
      if (this.view.opened.type === this.view.detail.name) {
        this.closeView(this.view.detail.name)
      } else if (this.view.opened.type === this.view.settings.name) {
        this.openView(this.view.detail.name, this.view.settings.id)
      }
    },

    /**
     * Double click and single click event handler
     *
     * - single click open detail
     * - double click open settings
     *
     * @param {Object} event
     * @param {Object} item
     */
    oneClick(event, item) {
      const path = this.getEventElementsPath(event)

      for (const pathItem of path) {
        if (
          typeof pathItem.getAttribute === 'function' &&
          (pathItem.getAttribute('role') === 'button' || pathItem.getAttribute('role') === 'dialog')
        ) {
          return
        }
      }

      this.click.clicks++

      if (this.click.clicks === 1) {
        const that = this

        this.click.timer = setTimeout(() => {
          that.openView(this.view.detail.name, item.id)

          that.click.clicks = 0
        }, this.click.delay)
      } else {
        clearTimeout(this.click.timer)

        this.click.clicks = 0

        this.openView(this.view.settings.name, item.id)
      }
    },

    /**
     * Check route and if is needed open detail window
     *
     * @private
     */
    _checkRoute() {
      if (this.$route.hash !== '') {
        if (this.$route.hash.includes(this.view.detail.route.hash)) {
          this.openView(this.view.detail.name, this.$route.hash.substring(this.view.detail.route.length))
        } else if (this.$route.hash.includes(this.view.settings.route.hash)) {
          this.openView(this.view.settings.name, this.$route.hash.substring(this.view.settings.route.length))
        }
      }
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
        this.offCanvasHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 50
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
        heading: this.$t('application.headings.groups.list'),
        subHeading: this.$tc('application.subHeadings.groups.list', this.groups.length, { count: this.groups.length }),
      }, {
        root: true,
      })

      this.$store.dispatch('header/setAddButton', {
        name: this.$t('application.buttons.add.title'),
        callback: () => {
          this.openGroupCreate()
        },
      }, {
        root: true,
      })

      this.$store.dispatch('header/addTab', {
        name: this.$t('application.buttons.things.title'),
        link: this.localePath(this.$routes.things.list),
      }, {
        root: true,
      })

      this.$store.dispatch('header/addTab', {
        name: this.$t('application.buttons.groups.title'),
        link: this.localePath(this.$routes.groups.list),
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
      title: this.$t('meta.groups.list.title'),
    }
  },

}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>
