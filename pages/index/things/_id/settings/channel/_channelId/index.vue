<template>
  <div class="fb-iot-things-channel-settings-view__container">
    <fb-loading-box
      v-if="fetchingChannel && (thing === null && channel === null)"
      :text="$t('texts.loading')"
    />

    <things-settings-channel
      v-if="thing !== null && channel !== null"
      :thing="thing"
      :channel="channel"
    />
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    THINGS_LIST_LINK,
    THINGS_THING_SETTINGS_LINK,

    THINGS_HASH_CHANNEL_SETTINGS,
  } from '@/configuration/routes'

  import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

  const ThingsSettingsChannel = () => ({
    component: import('@/components/things/Settings/Channel'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  export default {

    name: 'ThingChannelSettingsPage',

    components: {
      ThingsSettingsChannel,
    },

    transition: 'fade',

    data() {
      return {
        id: this.$route.params.id,
        channelId: this.$route.params.channelId,
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
       * View thing channel data
       *
       * @returns {Channel}
       */
      channel() {
        return this.$store.getters['entities/channel/query']()
          .with('properties')
          .where('id', this.channelId)
          .where('thing_id', this.id)
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

      /**
       * Flag signalizing that thing channels are loading from server
       *
       * @returns {Boolean}
       */
      fetchingChannels() {
        return this.$store.getters['entities/channel/fetching'](this.id)
      },

      /**
       * Flag signalizing that thing channel is loading from server
       *
       * @returns {Boolean}
       */
      fetchingChannel() {
        return this.$store.getters['entities/channel/getting'](this.channelId)
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(`${this.localePath({ name: THINGS_LIST_LINK })}${THINGS_HASH_CHANNEL_SETTINGS}${this.channelId}`)
        }
      },

      fetchingChannel(val) {
        if (!val) {
          if (this.thing === null || this.channel === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

            return
          }

          this._configureHeader()

          if (this.exchangeConnected) {
            this.$store.dispatch('entities/thing_socket/subscribe', {
              thing_id: this.id,
              channel_id: this.channelId,
            }, {
              root: true,
            })
          }
        }
      },

      exchangeConnected(val) {
        if (val) {
          this.$store.dispatch('entities/thing_socket/subscribe', {
            thing_id: this.id,
            channel_id: this.channelId,
          }, {
            root: true,
          })
        }
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
            const channel = store.getters['entities/channel/find'](params.channelId)

            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/setLeftButton', {
              name: app.i18n.t('application.buttons.back.title'),
              link: app.localePath({ name: THINGS_THING_SETTINGS_LINK, params: { id: thing.id } }),
              icon: 'angle-left',
            }, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: thing.label,
              subHeading: channel.label,
            }, {
              root: true,
            })
          })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)

            error({ statusCode: 404, message: 'Page Not Found' })
          })
      }
    },

    beforeMount() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(`${this.localePath({ name: THINGS_LIST_LINK })}${THINGS_HASH_CHANNEL_SETTINGS}${this.channelId}`)

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
            // eslint-disable-next-line
            console.log(e)
          })
      }

      if (
        this.channel === null &&
        !this.fetchingChannels &&
        !this.fetchingChannel &&
        !this.$store.getters['entities/channel/firstLoadFinished'](this.id)
      ) {
        this.$store.dispatch('entities/channel/fetch', {
          thing_id: this.id,
        }, {
          root: true,
        })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }

      if (
        !this.fetchingThing &&
        !this.fetchingThings &&
        (
          this.thing === null || this.channel === null
        )
      ) {
        this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

        return
      }

      if (this.thing && this.channel !== null) {
        this._configureHeader()

        if (this.exchangeConnected) {
          this.$store.dispatch('entities/thing_socket/subscribe', {
            thing_id: this.id,
            channel_id: this.channelId,
          }, {
            root: true,
          })
        }
      }
    },

    beforeDestroy() {
      if (this.thing) {
        if (
          this.$route.path !== this.localePath({ name: THINGS_THING_SETTINGS_LINK, params: { id: this._.get(this.$route, 'params.id') } }) &&
          this.exchangeConnected
        ) {
          this.$store.dispatch('entities/thing_socket/unsubscribe', {
            thing_id: this.thing.id,
            channel_id: this.channel.id,
          }, {
            root: true,
          })
        }
      }
    },

    methods: {

      ...mapActions('header', [
        'setLeftButton',
        'setRightButton',
        'showRightButton',
        'setHeading',
        'resetStore',
      ]),

      /**
       * Configure page header for small devices
       *
       * @private
       */
      _configureHeader() {
        this.resetStore()

        this.setLeftButton({
          name: this.$t('application.buttons.back.title'),
          link: this.localePath({ name: THINGS_THING_SETTINGS_LINK, params: { id: this.thing.id } }),
          icon: 'angle-left',
        })

        this.setHeading({
          heading: this.thing.label,
          subHeading: this.$tChannel(this.thing, this.channel),
        })
      },

    },

    head() {
      return {
        title: this.$t('meta.title', { thing: this.thing.label, channel: this.$tChannel(this.thing, this.channel) }),
      }
    },

  }
</script>

<i18n src="./locales.json" />
