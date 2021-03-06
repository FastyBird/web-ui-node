<template>
  <div class="fb-groups-list-view__container">
    <div class="fb-groups-list-view__items-container">
      <group-list-item
        v-for="group in groups"
        :key="group.id"
        :group="group"
        @click="oneClick"
      />
    </div>

    <off-canvas
      v-if="windowSize !== 'xs' && isMounted"
      :show="view.opened === view.items.detail.name || view.opened === view.items.settings.name"
      @close="closeView"
    >
      <group-detail
        v-if="view.opened === view.items.detail.name || view.opened === view.items.settings.name"
        :id="view.opened === view.items.detail.name ? view.items.detail.id : view.items.settings.id"
        slot="body"
        :settings="view.opened === view.items.settings.name"
        @close="closeView"
      />
    </off-canvas>

    <fb-ui-loading-box
      v-if="fetchingGroups && groups.length === 0"
      :text="$t('groups.texts.loadingGroups')"
    />

    <template v-if="!fetchingGroups && groups.length === 0">
      <no-results
        :message="$t('groups.texts.noGroups')"
        icon="folder"
      />

      <div class="fb-groups-list-view__new-group">
        <fb-ui-button
          variant="outline-primary"
          name="press"
          @click.prevent="openGroupCreate"
        >
          {{ $t('groups.buttons.addNew.title') }}
        </fb-ui-button>
      </div>
    </template>
  </div>
</template>

<script>
import { FbUiComponentLoading, FbUiComponentLoadingError } from '@fastybird/web-ui-theme'

import {
  GROUPS_HASH_DETAIL,
  GROUPS_HASH_SETTINGS,
  GROUPS_HASH_CREATE,
} from '~/configuration/routes'

import Group from '~/models/ui-module/Group'

import GroupListItem from '~/components/groups/ListItem'

const GroupDetail = () => ({
  component: import('~/components/groups/Desktop/Detail'),
  loading: FbUiComponentLoading,
  error: FbUiComponentLoadingError,
  timeout: 10000,
})

const viewSettings = {
  opened: null,
  items: {
    create: {
      name: 'create',
      route: {
        hash: GROUPS_HASH_CREATE,
        length: 7,
      },
    },
    detail: {
      name: 'detail',
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
}

export default {

  name: 'GroupsListPage',

  components: {
    GroupListItem,

    GroupDetail,
  },

  transition: 'fade',

  data() {
    return {
      window: Object.assign({}, viewSettings),
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
      return this.$store.state.app.windowSize
    },

    /**
     * Get all registered & loaded groups
     *
     * @returns {Array<Group>}
     */
    groups() {
      return Group
        .query()
        .orderBy('label')
        .get()
    },

    /**
     * Flag signalizing that groups are loading from server
     *
     * @returns {Boolean}
     */
    fetchingGroups() {
      return Group.getters('fetching')()
    },

  },

  watch: {

    windowSize(val) {
      if (val === 'xs') {
        if (this.window.opened === this.window.items.detail.name) {
          this.$router.push(this.localePath({
            name: this.$routes.things.detail,
            params: {
              id: this.window.items.detail.id,
            },
          }))
        } else if (this.window.opened === this.window.items.settings.name) {
          this.$router.push(this.localePath({
            name: this.$routes.things.detail,
            params: {
              id: this.window.items.settings.id,
            },
            hash: GROUPS_HASH_SETTINGS,
          }))
        } else if (this.window.opened === this.window.items.create.name) {
          this.$router.push(this.localePath({
            name: this.$routes.things.create,
          }))
        }
      }
    },

    fetchingGroups(val) {
      if (!val) {
        this._checkRoute()
      }
    },

    things() {
      this._configureNavigation()
    },

  },

  fetch({ app, store, error }) {
    if (!store.getters['entities/group/firstLoadFinished']()) {
      return store.dispatch('entities/group/fetch', null, {
        root: true,
      })
        .then(() => {
          const groupsCount = Group
            .query()
            .count()

          store.dispatch('template/resetHeadings', null, {
            root: true,
          })

          store.dispatch('template/resetButtons', null, {
            root: true,
          })

          store.dispatch('template/setHeading', {
            heading: app.i18n.t('application.headings.groups.list'),
            subHeading: app.i18n.tc('application.subHeadings.groups.list', groupsCount, { count: groupsCount }),
          }, {
            root: true,
          })

          store.dispatch('template/setActionButton', {
            name: app.i18n.t('application.buttons.add.title'),
          }, {
            root: true,
          })

          store.dispatch('template/addHeadingTab', {
            name: app.i18n.t('application.buttons.things.title'),
            link: app.localePath(app.$routes.things.list),
          }, {
            root: true,
          })

          store.dispatch('template/addHeadingTab', {
            name: app.i18n.t('application.buttons.groups.title'),
            link: app.localePath(app.$routes.groups.list),
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
      Group.query().count() === 0 &&
      !this.fetchingGroups &&
      !Group.getters('firstLoadFinished')()
    ) {
      Group.dispatch('fetch')
        .catch(() => {
          this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        })
    }

    this._configureNavigation()
  },

  mounted() {
    if (!this.fetchingGroups) {
      this._checkRoute()
    }

    this.$bus.$emit('wait-page_reloading', false)

    this.isMounted = true
  },

  methods: {

    /**
     * Open selected view
     *
     * @param {String} view
     * @param {String} [id]
     */
    openView(view, id) {
      if (Object.prototype.hasOwnProperty.call(this.window.items, view)) {
        for (const viewName in this.window.items) {
          if (Object.prototype.hasOwnProperty.call(this.window.items, viewName)) {
            if (Object.prototype.hasOwnProperty.call(this.window.items[viewName], 'id')) {
              this.window.items[viewName].id = null
            }
          }
        }

        switch (view) {
          case this.window.items.detail.name:
            if (this.windowSize === 'xs') {
              this.$bus.$emit('wait-page_reloading', 10)

              this.$router.push(this.localePath({
                name: this.$routes.groups.detail,
                params: {
                  id,
                },
              }))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.groups.list,
                hash: `${this.window.items.detail.route.hash}-${id}`,
              }))
            }
            break

          case this.window.items.settings.name:
            if (this.windowSize === 'xs') {
              this.$bus.$emit('wait-page_reloading', 10)

              this.$router.push(this.localePath({
                name: this.$routes.groups.detail,
                params: {
                  id,
                },
                hash: GROUPS_HASH_SETTINGS,
              }))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.groups.list,
                hash: `${this.window.items.settings.route.hash}-${id}`,
              }))
            }
            break

          case this.window.items.create.name:
            if (this.windowSize === 'xs') {
              this.$bus.$emit('wait-page_reloading', 10)

              this.$router.push(this.localePath(this.$routes.groups.create))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.groups.list,
                hash: this.window.items.create.route.hash,
              }))
            }
            break
        }

        this.window.opened = view

        if (Object.prototype.hasOwnProperty.call(this.window.items[view], 'id') && typeof id !== 'undefined') {
          this.window.items[view].id = id

          const group = Group.find(id)

          if (group === null) {
            this.closeView()
          }
        }
      }
    },

    /**
     * Close opened view
     */
    closeView() {
      this.$router.push(this.localePath(this.$routes.things.list))

      // Reset to default values
      Object.assign(this.window, viewSettings)

      this.$el.focus()
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
        this.click.timer = setTimeout(() => {
          this.openView(this.window.detail.name, item.id)

          this.click.clicks = 0
        }, this.click.delay)
      } else {
        clearTimeout(this.click.timer)

        this.click.clicks = 0

        this.openView(this.window.settings.name, item.id)
      }
    },

    /**
     * Header action button action event
     */
    actionButtonAction() {
      this.openView(this.window.items.create.name)
    },

    /**
     * Check route and if is needed open detail window
     *
     * @private
     */
    _checkRoute() {
      if (this.$route.hash !== '') {
        if (this.$route.hash.includes(this.window.items.detail.route.hash)) {
          this.openView(this.window.items.detail.name, this.$route.hash.substring(this.window.items.detail.route.length))
        } else if (this.$route.hash.includes(this.window.items.settings.route.hash)) {
          this.openView(this.window.items.settings.name, this.$route.hash.substring(this.window.items.settings.route.length))
        } else if (this.$route.hash.includes(this.window.items.create.route.hash)) {
          this.openView(this.window.items.create.name)
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
        heading: this.$t('application.headings.groups.list'),
        subHeading: this.$tc('application.subHeadings.groups.list', this.groups.length, { count: this.groups.length }),
      }, {
        root: true,
      })

      if (this.groups.length) {
        this.$store.dispatch('template/setActionButton', {
          name: this.$t('application.buttons.add.title'),
        }, {
          root: true,
        })
      }

      this.$store.dispatch('template/addHeadingTab', {
        name: this.$t('application.buttons.things.title'),
        link: this.localePath(this.$routes.things.list),
      }, {
        root: true,
      })

      this.$store.dispatch('template/addHeadingTab', {
        name: this.$t('application.buttons.groups.title'),
        link: this.localePath(this.$routes.groups.list),
      }, {
        root: true,
      })

      this.$store.dispatch('app/bottomMenuExpand', null, {
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

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
