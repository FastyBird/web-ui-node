<template>
  <div class="fb-iot-things-list-view__container">
    <div class="fb-iot-things-list-view__items-container">
      <things-list-item
        v-for="thing in things"
        :key="thing.id"
        :thing="thing"
        @click="oneClick"
      />
    </div>

    <!-- THING DETAIL FOR LARGE DEVICES //-->
    <off-canvas
      :show="(view.opened.type === view.detail.name || view.opened.type === view.settings.name || view.opened.type === view.channelSettings.name) && windowSize !== 'xs'"
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
            @click.prevent="openView(view.settings.name, viewThing.id)"
          >
            <font-awesome-icon icon="cogs" />
          </button>
          <button
            v-if="view.opened.type === view.settings.name || view.opened.type === view.channelSettings.name"
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
          <things-detail
            v-if="viewThing !== null && view.opened.type === view.detail.name"
            :thing="viewThing"
            :channels="viewChannels"
            :style="`height: ${offCanvasHeight}px`"
            class="fb-iot-things-list-view__off-canvas-body"
          />

          <things-settings-thing
            v-if="viewThing !== null && view.opened.type === view.settings.name"
            :thing="viewThing"
            :channels="viewChannels"
            :style="`height: ${offCanvasHeight}px`"
            class="fb-iot-things-list-view__off-canvas-body"
            @channelSettings="openChannelSettings"
            @removed="closeView(view.opened.type)"
          />

          <things-settings-channel
            v-if="!fetchingChannels && viewThing !== null && view.opened.type === view.channelSettings.name"
            :thing="viewThing"
            :channel="viewChannel"
            :style="`height: ${offCanvasHeight}px`"
            class="fb-iot-things-list-view__off-canvas-body"
          />

          <fb-loading-box
            v-if="fetchingChannels && viewThing !== null && view.opened.type === view.channelSettings.name"
            :text="$t('texts.loadingChannels')"
          />
        </transition>
      </off-canvas-body>
    </off-canvas>

    <fb-loading-box
      v-if="fetchingThings && things.length === 0"
      :text="$t('texts.loading')"
    />

    <no-results
      v-if="!fetchingThings && things.length === 0"
      :message="$t('texts.noThings')"
      icon="plug"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import {
    THINGS_HASH_DETAIL,
    THINGS_HASH_SETTINGS,
    THINGS_HASH_CHANNEL_SETTINGS,
    THINGS_HASH_CONNECT,
  } from '@/configuration/routes'

  import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

  import ThingsListItem from '@/components/things/ListItem'

  const ThingsDetail = () => ({
    component: import('@/components/things/Detail'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const ThingsSettingsThing = () => ({
    component: import('@/components/things/Settings/Thing'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const ThingsSettingsChannel = () => ({
    component: import('@/components/things/Settings/Channel'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  // Off canvas details view
  import OffCanvas from '@/components/layout/OffCanvas'

  const OffCanvasBody = () => ({
    component: import('@/components/layout/OffCanvas/Body'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  import NoResults from '@/components/layout/NoResults'

  export default {

    name: 'ThingsListPage',

    components: {
      ThingsListItem,
      ThingsDetail,
      ThingsSettingsThing,
      ThingsSettingsChannel,

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
          channelSettings: {
            name: 'channelSettings',
            id: null,
            thingId: null,
            route: {
              hash: THINGS_HASH_CHANNEL_SETTINGS,
              length: 18,
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
        return this.$store.getters['entities/thing/query']()
          .with('properties')
          .with('socket')
          .orderBy('label')
          .all()
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

        let thingId = 0

        switch (this.view.opened.type) {
          case this.view.detail.name:
            thingId = this.view.detail.id
            break

          case this.view.settings.name:
            thingId = this.view.settings.id
            break

          case this.view.channelSettings.name:
            thingId = this.view.channelSettings.thingId
            break
        }

        return this.$store.getters['entities/thing/query']()
          .with('properties')
          .with('socket')
          .where('id', thingId)
          .first()
      },

      /**
       * View thing channel data
       *
       * @returns {(Channel|null)}
       */
      viewChannel() {
        if (
          this.view.opened.type === null ||
          this.view.opened.type !== this.view.channelSettings.name
        ) {
          return null
        }

        return this.$store.getters['entities/channel/query']()
          .with('properties')
          .where('id', this.view.channelSettings.id)
          .first()
      },

      /**
       * View thing channel data
       *
       * @returns {Array}
       */
      viewChannels() {
        if (this.view.opened.type === null) {
          return []
        }

        if (this.view.opened.type === this.view.detail.name) {
          return this.$store.getters['entities/channel/query']()
            .with('properties')
            .where('thing_id', this.view.detail.id)
            .orderBy('name')
            .all()
        } else if (this.view.opened.type === this.view.settings.name) {
          return this.$store.getters['entities/channel/query']()
            .with('properties')
            .where('thing_id', this.view.settings.id)
            .orderBy('name')
            .all()
        }

        return []
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
       * Flag signalizing that channels are loading from server
       *
       * @returns {Boolean}
       */
      fetchingChannels() {
        return this._.get(this.$store, 'state.entities.channel.semaphore.fetching.items', []).length
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
        } else if (this.view.opened.type === this.view.channelSettings.name) {
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
        } else if (this.view.opened.type === this.view.channelSettings.name && !this.fetchingChannels) {
          return this.$tChannel(this.viewThing, this.viewChannel)
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
              if (viewName === this.view.channelSettings.name) {
                this.openView(viewName, val.hash.substring(this.view.channelSettings.route.length))
              } else {
                this.openView(viewName, val.hash.substring(this._.get(this.view[viewName], 'route.length', 0)))
              }

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
          } else if (this.view.opened.type === this.view.channelSettings.name) {
            const channel = this.$store.getters['entities/channel/query']()
              .where('id', this.view.channelSettings.id)
              .first()

            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: channel.thing_id,
              },
              hash: `${THINGS_HASH_CHANNEL_SETTINGS}-${this.view.channelSettings.id}`,
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
        if (!val && this.$route.hash.indexOf(this.view.channelSettings.route.hash) === -1) {
          this._checkRoute()
        }
      },

      fetchingChannels(val) {
        if (!val && this.$route.hash.indexOf(this.view.channelSettings.route.hash) !== -1) {
          this._checkRoute()
        }
      },

      exchangeConnected(val) {
        if (val && this.view.opened.type !== null) {
          if (this.view.opened.type === this.view.channelSettings.name) {
            this.$store.dispatch('entities/thing_socket/subscribe', {
              thing_id: this.view[this.view.opened.type].thingId,
              channel_id: this.view[this.view.opened.type].id,
            }, {
              root: true,
            })
          } else {
            this.$store.dispatch('entities/thing_socket/subscribe', {
              thing_id: this.view[this.view.opened.type].id,
            }, {
              root: true,
            })
          }
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

      /**
       * Navigate to thing channel settings page
       *
       * @param {Channel} channel
       * @param {String} channel.id
       * @param {String} channel.thing_id
       */
      openChannelSettings(channel) {
        this.openView(this.view.channelSettings.name, channel.id)
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

            if (this.view[viewName].hasOwnProperty('thingId')) {
              this.view[viewName].thingId = null
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

              this._loadChannels(id)
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

              this._loadChannels(id)
            }
            break

          case this.view.channelSettings.name:
            const thing = this.$store.getters['entities/thing/query']()
              .where('channel_ids', value => value.indexOf(id) !== -1)
              .first()

            if (thing) {
              if (this.windowSize === 'xs') {
                this.$router.push(this.localePath({
                  name: this.$routes.things.detail,
                  params: {
                    id: thing.id,
                  },
                  hash: `${THINGS_HASH_CHANNEL_SETTINGS}-${id}`,
                }))
              } else {
                this.view.channelSettings.thingId = thing.id

                this.$router.push(this.localePath({
                  name: this.$routes.things.list,
                  hash: `${this.view.channelSettings.route.hash}-${id}`,
                }))

                this._loadChannels(thing.id)
              }
            } else {
              this.$router.push(this.localePath(this.$routes.things.list))

              return
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
          if (view === this.view.channelSettings.name) {
            this.$store.dispatch('entities/thing_socket/subscribe', {
              thing_id: this.view[view].thingId,
              channel_id: this.view[view].id,
            }, {
              root: true,
            })
          } else {
            this.$store.dispatch('entities/thing_socket/subscribe', {
              thing_id: this.view[this.view.opened.type].id,
            }, {
              root: true,
            })
          }
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
            if (view === this.view.channelSettings.name) {
              this.$store.dispatch('entities/thing_socket/unsubscribe', {
                thing_id: this.view[view].thingId,
                channel_id: this.view[view].id,
              }, {
                root: true,
              })
            } else {
              this.$store.dispatch('entities/thing_socket/unsubscribe', {
                thing_id: this.view[view].id,
              }, {
                root: true,
              })
            }
          }

          if (this.view[view].hasOwnProperty('id')) {
            this.view[view].id = null
          }

          if (this.view[view].hasOwnProperty('thingId')) {
            this.view[view].thingId = null
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
        } else if (this.view.opened.type === this.view.channelSettings.name) {
          this.openView(this.view.settings.name, this.view.channelSettings.thingId)
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
       * Check if channels for thing were loaded and if not, load them
       *
       * @param {String} id
       *
       * @private
       */
      _loadChannels(id) {
        const thing = this.$store.getters['entities/thing/query']()
          .where('id', id)
          .first()

        if (
          thing.channel_ids.length &&
          this.$store.getters['entities/channel/query']().where('thing_id', id).count() === 0 &&
          !this.$store.getters['entities/channel/fetching'](id) &&
          !this.$store.getters['entities/channel/firstLoadFinished'](id)
        ) {
          this.$store.dispatch('entities/channel/fetch', {
            thing_id: id,
          }, {
            root: true,
          })
            .catch(() => {
              // Channels could not be loaded, an unexpected error occur
              this.$nuxt.error({ statusCode: 503, message: 'Channels could not be loaded' })
            })
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
          } else if (this.$route.hash.indexOf(this.view.channelSettings.route.hash) !== -1) {
            this.openView(this.view.channelSettings.name, this.$route.hash.substring(this.view.channelSettings.route.length))
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
        title: this.$t('meta.title'),
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
