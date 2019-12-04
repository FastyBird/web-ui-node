<template>
  <div class="fb-iot-things-thing-detail-view__container">
    <fb-loading-box
      v-if="fetchingThing && thing === null"
      :text="$t('texts.loading')"
    />

    <template v-else>
      <thing-detail
        ref="detail"
        :thing="thing"
      />

      <thing-settings
        v-if="settings"
        ref="settings"
        v-body-scroll-lock="true"
        :thing="thing"
        class="fb-iot-things-thing-detail-view__container-settings"
        @removed="thingRemoved"
      />
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import get from 'lodash/get'

  import {
    THINGS_HASH_DETAIL,
    THINGS_HASH_SETTINGS,
  } from '@/configuration/routes'

  import ThingDetail from '@/components/things/Detail'
  import ThingSettings from '@/components/things/Settings'

  export default {

    name: 'ThingDetailPage',

    components: {
      ThingDetail,
      ThingSettings,
    },

    transition: 'fade',

    data() {
      return {
        id: this.$route.params.id,
        settings: false,
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
       * View thing data
       *
       * @returns {Thing}
       */
      thing() {
        return this.$store.getters['entities/thing/query']()
          .with('device')
          .with('device.properties')
          .with('device.socket')
          .with('channel')
          .with('channel.properties')
          .where('channel_id', this.id)
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
       * Flag signalizing that thing is loading from server
       *
       * @returns {Boolean}
       */
      fetchingThing() {
        return this.$store.getters['entities/thing/getting'](this.id)
      },

    },

    watch: {

      /**
       * Watch for thing updates
       */
      thing() {
        this._configureNavigation()
      },

      windowSize(val) {
        if (val !== 'xs') {
          if (this.$route.hash !== '') {
            if (this.$route.hash.indexOf(THINGS_HASH_SETTINGS) !== -1) {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: `${THINGS_HASH_SETTINGS}-${this.id}`,
              }))
            }
          } else {
            this.$router.push(this.localePath({
              name: this.$routes.things.list,
              hash: `${THINGS_HASH_DETAIL}-${this.id}`,
            }))
          }
        }
      },

      fetchingThing(val) {
        if (!val) {
          if (this.thing === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Thing Not Found' })

            return
          }

          this._configureNavigation()

          this._subscribeSockets()
        }
      },

      exchangeConnected() {
        this._subscribeSockets()
      },

    },

    fetch({ app, store, params, error }) {
      if (store.getters['entities/thing/query']().count() === 0) {
        return store.dispatch('entities/thing/get', {
          id: params.id,
        }, {
          root: true,
        })
          .then(() => {
            const thing = store.getters['entities/thing/query']()
              .with('device')
              .with('channel')
              .where('channel_id', params.id)
              .first()

            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/setLeftButton', {
              name: app.i18n.t('application.buttons.back.title'),
              link: app.localePath(app.$routes.things.list),
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
              heading: app.$tThing(thing),
              subHeading: thing.comment,
            }, {
              root: true,
            })

            store.dispatch('header/setHeadingIcon', {
              icon: app.$thingIcon(thing),
            }, {
              root: true,
            })

            store.dispatch('bottomNavigation/resetStore', null, {
              root: true,
            })

            store.dispatch('bottomNavigation/hideNavigation', null, {
              root: true,
            })
          })
          .catch(e => {
            if (get(e, 'exception.response.status', 0) === 404) {
              error({ statusCode: 404, message: 'Thing Not Found' })
            } else {
              error({ statusCode: 503, message: 'Something went wrong' })
            }
          })
      }
    },

    beforeMount() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(this.localePath({
          name: this.$routes.things.list,
          hash: `${THINGS_HASH_DETAIL}-${this.id}`,
        }))

        return
      }

      if (
        this.$store.getters['entities/thing/query']().count() === 0 &&
        !this.fetchingThings &&
        !this.fetchingThing &&
        !this.$store.getters['entities/thing/firstLoadFinished']()
      ) {
        this.$store.dispatch('entities/thing/get', {
          id: this.id,
        }, {
          root: true,
        })
          .catch(e => {
            if (this._.get(e, 'exception.response.status', 0) === 404) {
              this.$nuxt.error({ statusCode: 404, message: 'Thing Not Found' })
            } else {
              this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
            }
          })
      }

      if (!this.fetchingThing && !this.fetchingThings && this.thing === null) {
        this.$nuxt.error({ statusCode: 404, message: 'Thing Not Found' })

        return
      }

      if (this.thing) {
        this._configureNavigation()

        this._subscribeSockets()
      }
    },

    mounted() {
      this._checkRoute()

      this._setBlocksHeight('detail')

      window.addEventListener('scroll', this._windowScrolledHandler)
      window.addEventListener('resize', this._windowResizeHandler)
    },

    beforeDestroy() {
      if (this.thing) {
        if (
          this.$route.path !== this.localePath(this.$routes.things.list) &&
          this.exchangeConnected
        ) {
          this.$store.dispatch('entities/device_socket/unsubscribe', {
            device_id: this.thing.device_id,
          }, {
            root: true,
          })
        }
      }

      window.removeEventListener('scroll', this._windowScrolledHandler)
      window.removeEventListener('resize', this._windowResizeHandler)
    },

    methods: {

      /**
       * Thing was removed, navigate to things list
       */
      thingRemoved() {
        this.$router.push(this.localePath(this.$routes.things.list))
      },

      /**
       * Open thing settings part
       */
      _openSettings() {
        this.$set(this, 'settings', true)

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
       * Close thing settings part
       */
      _closeSettings() {
        if (this._.get(this.$refs, 'detail')) {
          const component = this._.get(this.$refs, 'detail')

          this.$scrollTo(component.$el, 500, {
            offset: (-1 * this.$store.state.theme.marginTop),
            onDone: () => {
              this.$set(this, 'settings', false)
              this._configureNavigationRightButton()
            },
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
          if (this.$route.hash.indexOf(THINGS_HASH_SETTINGS) !== -1) {
            this._openSettings()
          }
        }
      },

      /**
       * If it is possible and necessary, connect thing to sockets
       *
       * @private
       */
      _subscribeSockets() {
        if (this.exchangeConnected) {
          this.$store.dispatch('entities/device_socket/subscribe', {
            device_id: this.thing.device_id,
          }, {
            root: true,
          })
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

        this._configureNavigationRightButton()

        this.$store.dispatch('header/setFullRowHeading', null, {
          root: true,
        })

        this.$store.dispatch('header/setHeading', {
          heading: this.$tThing(this.thing),
          subHeading: this.thing.comment,
        }, {
          root: true,
        })

        this.$store.dispatch('header/setHeadingIcon', {
          icon: this.$thingIcon(this.thing),
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
       * Configure page header right navigation button
       *
       * @private
       */
      _configureNavigationRightButton() {
        this.$store.dispatch('header/setLeftButton', {
          name: this.$t('application.buttons.back.title'),
          link: this.localePath(this.$routes.things.list),
          icon: 'arrow-left',
        }, {
          root: true,
        })

        if (
          this.settings &&
          this._.get(this.$refs, 'settings') &&
          this._.get(this.$refs, 'settings.$el').getBoundingClientRect().top <= (this.$store.state.theme.marginTop + 1)
        ) {
          this.$store.dispatch('header/setRightButton', {
            name: this.$t('application.buttons.close.title'),
            callback: () => {
              this._closeSettings()
            },
          }, {
            root: true,
          })

          this._setOpenedSettingsRoute()
        } else {
          this.$store.dispatch('header/setRightButton', {
            name: this.$t('application.buttons.edit.title'),
            callback: () => {
              this._openSettings()
            },
          }, {
            root: true,
          })

          this._setClosedSettingsRoute()
        }
      },

      /**
       * Update view according to view position
       *
       * @private
       */
      _windowScrolledHandler() {
        this._configureNavigationRightButton()
      },

      /**
       * Update blocks height according to resized window
       *
       * @private
       */
      _windowResizeHandler() {
        this._setBlocksHeight('detail')
        this._setBlocksHeight('settings', 'height')

        if (this.settings && this._.get(this.$refs, 'settings')) {
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

      /**
       * Change route accordingly to view position
       *
       * @private
       */
      _setOpenedSettingsRoute() {
        this.$router.push(this.localePath({
          name: this.$routes.things.detail,
          params: {
            id: this.thing.channel_id,
          },
          hash: THINGS_HASH_SETTINGS,
        }))
      },

      /**
       * Change route accordingly to view position
       *
       * @private
       */
      _setClosedSettingsRoute() {
        this.$router.push(this.localePath({
          name: this.$routes.things.detail,
          params: {
            id: this.thing.channel_id,
          },
        }))
      },

    },

    head() {
      return {
        title: this.$t('meta.things.detail.title', { thing: this.$tThing(this.thing) }),
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
