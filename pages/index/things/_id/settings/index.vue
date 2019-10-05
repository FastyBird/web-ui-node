<template>
  <div class="fb-iot-things-thing-settings-view__container">
    <fb-loading-box
      v-if="fetchingThing && thing === null"
      :text="$t('texts.loading')"
    />

    <things-settings-thing
      v-if="thing !== null"
      :thing="thing"
      :channels="channels"
      @removed="thingRemoved"
      @channelSettings="openChannelSettings"
    />
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    THINGS_LIST_LINK,
    THINGS_THING_DETAIL_LINK,
    THINGS_CHANNEL_SETTINGS_LINK,

    THINGS_HASH_SETTINGS,
  } from '@/configuration/routes'

  import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

  const ThingsSettingsThing = () => ({
    component: import('@/components/things/Settings/Thing'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  export default {

    name: 'ThingSettingsPage',

    components: {
      ThingsSettingsThing,
    },

    transition: 'fade',

    data() {
      return {
        id: this.$route.params.id,
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

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(`${this.localePath({ name: THINGS_LIST_LINK })}${THINGS_HASH_SETTINGS}${this.id}`)
        }
      },

      fetchingThing(val) {
        if (!val) {
          if (this.thing === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

            return
          }

          this._configureHeader()

          if (this.exchangeConnected) {
            this.$store.dispatch('entities/thing_socket/subscribe', {
              thing_id: this.id,
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

            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/setLeftButton', {
              name: app.i18n.t('application.buttons.back.title'),
              link: app.localePath({ name: THINGS_THING_DETAIL_LINK, params: { id: thing.id } }),
              icon: 'angle-left',
            }, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: thing.label,
              subHeading: thing.comment,
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
        this.$router.push(`${this.localePath({ name: THINGS_LIST_LINK })}${THINGS_HASH_SETTINGS}${this.id}`)

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

      if (!this.fetchingThing && !this.fetchingThings && this.thing === null) {
        this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

        return
      }

      if (this.thing) {
        this._configureHeader()

        if (this.exchangeConnected) {
          this.$store.dispatch('entities/thing_socket/subscribe', {
            thing_id: this.id,
          }, {
            root: true,
          })
        }
      }
    },

    beforeDestroy() {
      if (this.thing) {
        if (
          this.$route.path !== this.localePath({ name: THINGS_THING_DETAIL_LINK, params: { id: this._.get(this.$route, 'params.id') } }) &&
          this.$route.path !== this.localePath({ name: THINGS_CHANNEL_SETTINGS_LINK, params: { id: this._.get(this.$route, 'params.id'), channelId: this._.get(this.$route, 'params.channelId') } }) &&
          this.exchangeConnected
        ) {
          this.$store.dispatch('entities/thing_socket/unsubscribe', {
            thing_id: this.thing.id,
          }, {
            root: true,
          })
        }
      }
    },

    methods: {

      ...mapActions('header', [
        'setLeftButton',
        'setHeading',
        'resetStore',
      ]),

      /**
       * Thing was removed, navigate to thing list
       */
      thingRemoved() {
        // TODO: finish thing remove process
      },

      /**
       * Navigate to channel settings page
       *
       * @param {Channel} channel
       * @param {String} channel.id
       */
      openChannelSettings(channel) {
        this.$router.push(this.localePath({ name: THINGS_CHANNEL_SETTINGS_LINK, params: { id: this.thing.id, channelId: channel.id } }))
      },

      /**
       * Configure page header for small devices
       *
       * @private
       */
      _configureHeader() {
        this.resetStore()

        this.setLeftButton({
          name: this.$t('application.buttons.back.title'),
          link: this.localePath({ name: THINGS_THING_DETAIL_LINK, params: { id: this.thing.id } }),
          icon: 'angle-left',
        })

        this.setHeading({
          heading: this.thing.label,
          subHeading: this.thing.comment,
        })
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
