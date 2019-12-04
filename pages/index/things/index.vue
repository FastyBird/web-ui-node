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

    <!-- THING DETAIL FOR LARGE DEVICES //-->
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
            @click.prevent="openView(view.settings.name, viewThing.channel_id)"
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

        <transition
          slot="body"
          name="fade"
          mode="out-in"
        >
          <thing-detail
            v-if="viewThing !== null && view.opened.type === view.detail.name"
            :thing="viewThing"
            :style="`height: ${offCanvasHeight}px`"
            class="fb-iot-things-list-view__off-canvas-body"
          />

          <thing-settings
            v-if="viewThing !== null && view.opened.type === view.settings.name"
            :thing="viewThing"
            :style="`height: ${offCanvasHeight}px`"
            class="fb-iot-things-list-view__off-canvas-body"
            @removed="closeView(view.opened.type)"
          />
        </transition>
      </off-canvas-body>
    </off-canvas>

    <fb-loading-box
      v-if="fetchingThings && things.length === 0"
      :text="$t('things.texts.loadingThings')"
    />

    <no-results
      v-if="!fetchingThings && things.length === 0"
      :message="$t('things.texts.noThings')"
      icon="plug"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import { orderBy } from 'natural-orderby'

  import {
    THINGS_HASH_DETAIL,
    THINGS_HASH_SETTINGS,
    THINGS_HASH_CONNECT,
  } from '@/configuration/routes'

  import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

  import ThingListItem from '@/components/things/ListItem'

  const ThingDetail = () => ({
    component: import('@/components/things/Detail'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const ThingSettings = () => ({
    component: import('@/components/things/Settings'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  export default {

    name: 'ThingsListPage',

    components: {
      ThingListItem,
      ThingDetail,
      ThingSettings,
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
              hash: THINGS_HASH_CONNECT,
              length: 8,
            },
          },
          detail: {
            name: 'detail',
            type: undefined,
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

      ...mapState('wamp', {
        exchangeConnected: state => state.isConnected,
      }),

      /**
       * Get all registered & loaded things
       *
       * @returns {Array}
       */
      things() {
        const items = this.$store.getters['entities/thing/query']()
          .with('device')
          .with('device.properties')
          .with('device.socket')
          .with('channel')
          .with('channel.properties')
          .all()

        return orderBy(
          items,
          [
            v => v.label,
            v => v.comment,
          ],
          ['asc'],
        )
      },

      /**
       * View thing data
       *
       * @returns {(Thing|null)}
       */
      viewThing() {
        if (this.view.opened.type === null) {
          return null
        }

        let id = ''

        switch (this.view.opened.type) {
          case this.view.detail.name:
            id = this.view.detail.id
            break

          case this.view.settings.name:
            id = this.view.settings.id
            break
        }

        return this.$store.getters['entities/thing/query']()
          .with('device')
          .with('device.properties')
          .with('device.socket')
          .with('channel')
          .with('channel.properties')
          .where('channel_id', id)
          .first()
      },

      /**
       * Flag signalizing that things are loading from server
       *
       * @returns {Boolean}
       */
      fetchingThings() {
        return this.$store.getters['entities/thing/fetching']()
      },

      /**
       * Get detail window heading
       *
       * @returns {String}
       */
      detailHeading() {
        if (this.view.opened.type === this.view.detail.name) {
          return this.viewThing.label
        } else if (this.view.opened.type === this.view.settings.name) {
          return this.viewThing.label
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
          return this.viewThing.hasComment ? this.viewThing.comment : null
        } else if (this.view.opened.type === this.view.settings.name) {
          return this.viewThing.hasComment ? this.viewThing.comment : null
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
        if (val === 'xs') {
          if (this.view.opened.type === this.view.settings.name) {
            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: this.view.settings.id,
              },
              hash: THINGS_HASH_SETTINGS,
            }))

            return
          } else if (this.view.opened.type === this.view.detail.name) {
            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: this.view.detail.id,
              },
            }))

            return
          }
        }

        this._calculateWindowHeight()
      },

      fetchingThings(val) {
        if (!val) {
          this._checkRoute()
        }
      },

      exchangeConnected(val) {
        if (val && this.view.opened.type !== null) {
          this.$store.dispatch('entities/device_socket/subscribe', {
            device_id: this.view[this.view.opened.type].id,
          }, {
            root: true,
          })
        }
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
            const thingsCount = store.getters['entities/thing/query']().count()

            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/hideHamburger', null, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: app.i18n.t('application.headings.things.list'),
              subHeading: app.i18n.tc('application.subHeadings.things.list', thingsCount, { count: thingsCount }),
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
            error({ statusCode: 503, message: 'Something went wrong' })
          })
      }
    },

    beforeMount() {
      if (
        this.$store.getters['entities/thing/query']().count() === 0 &&
        !this.fetchingThings &&
        !this.$store.getters['entities/thing/firstLoadFinished']()
      ) {
        this.$store.dispatch('entities/thing/fetch', {}, {
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

      if (!this.fetchingThings) {
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
        if (this.loading.hasOwnProperty(component)) {
          this.loading[component] = null
        }
      },

      openThingConnect() {
        if (this.windowSize === 'xs') {
          this.$router.push(this.localePath(this.$routes.things.connect))
        } else {
          this.openView('connect')
        }
      },

      /**
       * Open thing dialog
       *
       * @param {String} view
       * @param {String} id
       */
      openView(view, id) {
        if (
          this.view.opened.type === view &&
          (
            (this.view[view].hasOwnProperty('id') && typeof id !== 'undefined' && this.view[view].id === id) || (typeof id === 'undefined')
          )
        ) {
          return
        }

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
              this.$router.push(this.localePath({
                name: this.$routes.things.detail,
                params: {
                  id,
                },
              }))
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: `${this.view.detail.route.hash}-${id}`,
              }))
            }
            break

          case this.view.settings.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({
                name: this.$routes.things.detail,
                params: {
                  id,
                },
                hash: THINGS_HASH_SETTINGS,
              }))
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: `${this.view.settings.route.hash}-${id}`,
              }))
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

        if (this.exchangeConnected) {
          this.$store.dispatch('entities/device_socket/subscribe', {
            device_id: this.view[this.view.opened.type].id,
          }, {
            root: true,
          })
        }
      },

      /**
       * Close opened view
       *
       * @param {String} [view]
       */
      closeView(view) {
        this.$router.push(this.localePath(this.$routes.things.list))

        this.view.opened.type = null

        if (typeof view !== 'undefined' && this.view.hasOwnProperty(view)) {
          if (this.exchangeConnected) {
            this.$store.dispatch('entities/device_socket/unsubscribe', {
              device_id: this.view[view].id,
            }, {
              root: true,
            })
          }

          if (this.view[view].hasOwnProperty('id')) {
            this.view[view].id = null
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
            typeof pathItem.getAttribute === 'function'
            && (pathItem.getAttribute('role') === 'button' || pathItem.getAttribute('role') === 'dialog')
          ) {
            return
          }
        }

        this.click.clicks++

        if (this.click.clicks === 1) {
          const that = this

          this.click.timer = setTimeout(() => {
            that.openView(this.view.detail.name, item.channel_id)

            that.click.clicks = 0
          }, this.click.delay)
        } else {
          clearTimeout(this.click.timer)

          this.click.clicks = 0

          this.openView(this.view.settings.name, item.channel_id)
        }
      },

      /**
       * Check route and if is needed open detail window
       *
       * @private
       */
      _checkRoute() {
        if (this.$route.hash !== '') {
          if (this.$route.hash.indexOf(this.view.detail.route.hash) !== -1) {
            this.openView(this.view.detail.name, this.$route.hash.substring(this.view.detail.route.length))
          } else if (this.$route.hash.indexOf(this.view.settings.route.hash) !== -1) {
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
          this.offCanvasHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
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
          heading: this.$t('application.headings.things.list'),
          subHeading: this.$tc('application.subHeadings.things.list', this.things.length, { count: this.things.length }),
        }, {
          root: true,
        })

        this.$store.dispatch('header/setAddButton', {
          name: this.$t('application.buttons.add.title'),
          callback: () => {
            this.openThingConnect()
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
        title: this.$t('meta.things.list.title'),
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
