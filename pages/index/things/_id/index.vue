<template>
  <div
    class="fb-iot-things-thing-detail-view__container"
  >
    <fb-loading-box
      v-if="(fetchingThing && thing === null) || fetchingChannels"
      :text="$t('texts.loading')"
    />

    <things-detail-thing
      v-if="thing !== null && !fetchingChannels"
      ref="detail"
      :thing="thing"
      :channels="channels"
    />

    <things-settings-thing
      v-if="settings"
      ref="settings"
      :thing="thing"
      :channels="channels"
      @removed="thingRemoved"
      @channelSettings="openChannelSettings"
    />

    <things-settings-channel
      v-if="channelSettings && channel !== null"
      ref="channelSettings"
      v-body-scroll-lock="channelSettings && channel !== null"
      :thing="thing"
      :channel="channel"
      style="overflow: scroll;"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import get from 'lodash/get'

  import {
    THINGS_HASH_DETAIL,
    THINGS_HASH_SETTINGS,
    THINGS_HASH_CHANNEL_SETTINGS,
  } from '@/configuration/routes'

  import ThingsDetailThing from '@/components/things/Detail'
  import ThingsSettingsThing from '@/components/things/Settings/Thing'
  import ThingsSettingsChannel from '@/components/things/Settings/Channel'

  export default {

    name: 'ThingDetailPage',

    components: {
      ThingsDetailThing,
      ThingsSettingsThing,
      ThingsSettingsChannel,
    },

    transition: 'fade',

    data() {
      return {
        id: this.$route.params.id,
        settings: false,
        channelSettings: false,
        channel: null,
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
          .with('properties')
          .with('socket')
          .where('id', this.id)
          .first()
      },

      /**
       * View thing channels data
       *
       * @returns {Array}
       */
      channels() {
        return this.$store.getters['entities/channel/query']()
          .with('properties')
          .where('thing_id', this.id)
          .orderBy('name')
          .all()
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

      /**
       * Flag signalizing that thing channels are loading from server
       *
       * @returns {Boolean}
       */
      fetchingChannels() {
        return this.$store.getters['entities/channel/fetching'](this.id)
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          if (this.$route.hash !== '') {
            if (this.$route.hash.indexOf(THINGS_HASH_SETTINGS) !== -1) {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: `${THINGS_HASH_SETTINGS}-${this.id}`,
              }))
            } else if (this.$route.hash.indexOf(THINGS_HASH_CHANNEL_SETTINGS) !== -1) {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: `${THINGS_HASH_CHANNEL_SETTINGS}-${this.channel.id}`,
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

      channelSettings() {
        this._configureNavigationRightButton()
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
            const thing = store.getters['entities/thing/find'](params.id)

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
              heading: thing.label,
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
            if (get(e, 'exception.response.status', 0) !== 404) {
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

      if (
        this.channels.length === 0 &&
        !this.fetchingChannels &&
        !this.$store.getters['entities/channel/firstLoadFinished'](this.id)
      ) {
        this.$store.dispatch('entities/channel/fetch', {
          thing_id: this.id,
        }, {
          root: true,
        })
          .catch(() => {
            // Channels could not be loaded, an unexpected error occur
            this.$nuxt.error({ statusCode: 503, message: 'Channels could not be loaded' })
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
          this.$store.dispatch('entities/thing_socket/unsubscribe', {
            thing_id: this.id,
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
       * Thing was removed, navigate to thing list
       */
      thingRemoved() {
        // TODO
      },

      /**
       * Navigate to channel settings page
       *
       * @param {Channel} channel
       * @param {String} channel.id
       */
      openChannelSettings(channel) {
        this.$set(this, 'channel', channel)
        this.$set(this, 'channelSettings', true)

        this.$nextTick(() => {
          if (this._.get(this.$refs, 'channelSettings')) {
            const component = this._.get(this.$refs, 'channelSettings')

            this._setBlocksHeight('channelSettings', 'height')

            // Scroll view to channel setting part
            this.$scrollTo(component.$el, 500, {
              offset: (-1 * this.$store.state.theme.marginTop),
            })
          }
        })
      },

      /**
       * Open thing settings part
       */
      _openSettings() {
        this.$set(this, 'settings', true)

        this.$nextTick(() => {
          if (this._.get(this.$refs, 'settings')) {
            const component = this._.get(this.$refs, 'settings')

            this._setBlocksHeight('settings')

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
            },
          })
        }
      },

      /**
       * Close thing channel settings part
       */
      _closeChannelSettings() {
        if (this._.get(this.$refs, 'settings')) {
          const component = this._.get(this.$refs, 'settings')

          this.$scrollTo(component.$el, 500, {
            offset: (-1 * this.$store.state.theme.marginTop),
            onDone: () => {
              this.$set(this, 'channelSettings', false)
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
          this.$store.dispatch('entities/thing_socket/subscribe', {
            thing_id: this.thing.id,
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
          heading: this.thing.label,
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
        if (this.channelSettings && this._.get(this.$refs, 'channelSettings')) {
          this.$store.dispatch('header/hideLeftButton', null, {
            root: true,
          })

          this.$store.dispatch('header/setRightButton', {
            name: this.$t('application.buttons.close.title'),
            callback: () => {
              this._closeChannelSettings()
            },
          }, {
            root: true,
          })

          this._setOpenedChannelSettingsRoute()
        } else {
          this.$store.dispatch('header/setLeftButton', {
            name: this.$t('application.buttons.back.title'),
            link: this.localePath({ name: this.$routes.things.list }),
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
        this._setBlocksHeight('settings')
        this._setBlocksHeight('channelSettings', 'height')

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
      _setOpenedChannelSettingsRoute() {
        this.$router.push(this.localePath({
          name: this.$routes.things.detail,
          params: {
            id: this.thing.id,
          },
          hash: `${THINGS_HASH_CHANNEL_SETTINGS}-${this.channel.id}`,
        }))
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
            id: this.thing.id,
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
            id: this.thing.id,
          },
        }))
      },

    },

    head() {
      return {
        title: this.$t('meta.title', { thing: this.thing.label }),
      }
    },

  }
</script>

<i18n src="./locales.json" />
