<template>
  <div class="fb-iot-things-list-view__container">
    <div class="fb-iot-things-list-view__items-container">
      <thing-list-item
        v-for="thing in things"
        :key="thing.id"
        :thing="thing"
        @click="oneClick"
      />
    </div>

    <off-canvas
      v-if="windowSize !== 'xs' && isMounted"
      :show="view.opened === view.items.detail.name || view.opened === view.items.settings.name"
      @close="closeView"
    >
      <thing-detail
        v-if="view.opened === view.items.detail.name || view.opened === view.items.settings.name"
        :id="view.opened === view.items.detail.name ? view.items.detail.id : view.items.settings.id"
        slot="body"
        :settings="view.opened === view.items.settings.name"
        @close="closeView"
      />
    </off-canvas>

    <connect-thing
      v-if="view.opened === view.items.connect.name && windowSize !== 'xs'"
      @close="closeView"
    />

    <fb-loading-box
      v-if="fetchingThings && things.length === 0"
      :text="$t('things.texts.loadingThings')"
    />

    <template v-if="!fetchingThings && things.length === 0">
      <no-results
        :message="$t('things.texts.noThings')"
        icon="plug"
      />

      <div class="fb-iot-things-list-view__new-thing">
        <fb-button
          variant="outline-primary"
          name="press"
          @click.prevent="openView(view.items.connect.name)"
        >
          {{ $t('things.buttons.addNew.title') }}
        </fb-button>
      </div>
    </template>
  </div>
</template>

<script>
import { orderBy } from 'natural-orderby'

import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import {
  THINGS_HASH_DETAIL,
  THINGS_HASH_SETTINGS,
  THINGS_HASH_CONNECT,
} from '~/configuration/routes'

import Thing from '~/models/things/Thing'

import ThingListItem from '~/components/things/ListItem'

const ThingDetail = () => ({
  component: import('~/components/things/Desktop/Detail'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const ConnectThing = () => import('~/components/things/Desktop/Connect')

const viewSettings = {
  opened: null,
  items: {
    connect: {
      name: 'connect',
      route: {
        hash: THINGS_HASH_CONNECT,
        length: 8,
      },
    },
    detail: {
      name: 'detail',
      id: null,
      route: {
        hash: THINGS_HASH_DETAIL,
        length: 8,
      },
    },
    settings: {
      name: 'settings',
      id: null,
      route: {
        hash: THINGS_HASH_SETTINGS,
        length: 10,
      },
    },
  },
}

export default {

  name: 'ThingsListPage',

  components: {
    ThingListItem,

    ThingDetail,
    ConnectThing,
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
     * Get all registered & loaded things
     *
     * @returns {Array<Thing>}
     */
    things() {
      const items = Thing
        .query()
        .with('device')
        .with('channel')
        .get()

      return orderBy(
        items,
        [
          v => this.$tThingChannel(v),
          v => this.$tThingDevice(v),
        ],
        ['asc'],
      )
    },

    /**
     * Flag signalizing that things are loading from server
     *
     * @returns {Boolean}
     */
    fetchingThings() {
      return Thing.getters('fetching')()
    },

  },

  watch: {

    windowSize(val) {
      if (val === 'xs') {
        if (this.view.opened === this.view.items.detail.name) {
          this.$router.push(this.localePath({
            name: this.$routes.things.detail,
            params: {
              id: this.view.items.detail.id,
            },
          }))
        } else if (this.view.opened === this.view.items.settings.name) {
          this.$router.push(this.localePath({
            name: this.$routes.things.detail,
            params: {
              id: this.view.items.settings.id,
            },
            hash: THINGS_HASH_SETTINGS,
          }))
        } else if (this.view.opened === this.view.items.connect.name) {
          this.$router.push(this.localePath({
            name: this.$routes.things.connect,
          }))
        }
      }
    },

    fetchingThings(val) {
      if (!val) {
        this._checkRoute()
      }
    },

    things() {
      this._configureNavigation()
    },

  },

  fetch({ app, store, error }) {
    if (!store.getters['entities/thing/firstLoadFinished']()) {
      return store.dispatch('entities/thing/fetch', {
        include_channels: false,
      }, {
        root: true,
      })
        .then(() => {
          const thingsCount = Thing
            .query()
            .count()

          store.dispatch('template/resetHeadings', null, {
            root: true,
          })

          store.dispatch('template/resetButtons', null, {
            root: true,
          })

          store.dispatch('template/setHeading', {
            heading: app.i18n.t('things.headings.allThings'),
            subHeading: app.i18n.tc('things.subHeadings.allThings', thingsCount, { count: thingsCount }),
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
      Thing.query().count() === 0 &&
      !this.fetchingThings &&
      !Thing.getters('firstLoadFinished')()
    ) {
      Thing.dispatch('fetch')
        .catch(() => {
          this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        })
    }

    this.$bus.$on('heading_action_button-clicked', this.actionButtonAction)

    this._configureNavigation()
  },

  mounted() {
    if (!this.fetchingThings) {
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
                name: this.$routes.things.detail,
                params: {
                  id,
                },
              }))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: `${this.view.items.detail.route.hash}-${id}`,
              }))
            }
            break

          case this.view.items.settings.name:
            if (this.windowSize === 'xs') {
              this.$bus.$emit('wait-page_reloading', 10)

              this.$router.push(this.localePath({
                name: this.$routes.things.detail,
                params: {
                  id,
                },
                hash: THINGS_HASH_SETTINGS,
              }))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: `${this.view.items.settings.route.hash}-${id}`,
              }))
            }
            break

          case this.view.items.connect.name:
            if (this.windowSize === 'xs') {
              this.$bus.$emit('wait-page_reloading', 10)

              this.$router.push(this.localePath(this.$routes.things.connect))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: this.view.items.connect.route.hash,
              }))
            }
            break
        }

        this.view.opened = view

        if (Object.prototype.hasOwnProperty.call(this.view.items[view], 'id') && typeof id !== 'undefined') {
          this.view.items[view].id = id

          const thing = Thing.find(id)

          if (thing === null) {
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
      Object.assign(this.view, viewSettings)

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
          (
            pathItem.getAttribute('role') === 'button' ||
            pathItem.getAttribute('role') === 'dialog'
          )
        ) {
          return
        }
      }

      this.click.clicks++

      if (this.click.clicks === 1) {
        this.click.timer = setTimeout(() => {
          this.openView(this.view.items.detail.name, item.channel_id)

          this.click.clicks = 0
        }, this.click.delay)
      } else {
        clearTimeout(this.click.timer)

        this.click.clicks = 0

        this.openView(this.view.items.settings.name, item.channel_id)
      }
    },

    /**
     * Header action button action event
     */
    actionButtonAction() {
      this.openView(this.view.items.connect.name)
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
        } else if (this.$route.hash.includes(this.view.items.connect.route.hash)) {
          this.openView(this.view.items.connect.name)
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
        heading: this.$t('things.headings.allThings'),
        subHeading: this.$tc('things.subHeadings.allThings', this.things.length, { count: this.things.length }),
      }, {
        root: true,
      })

      if (this.things.length) {
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
      title: this.$t('meta.things.list.title'),
    }
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
