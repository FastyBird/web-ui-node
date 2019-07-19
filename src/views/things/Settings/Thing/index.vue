<template web>
  <layout name="LayoutDefault">
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
  </layout>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    THINGS_LIST_LINK,
    THINGS_THING_DETAIL_LINK,
    THINGS_CHANNEL_SETTINGS_LINK,

    THINGS_HASH_SETTINGS,

    ERR_404_LINK,
  } from '@/router'

  import FbComponentLoading from '@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@fastybird-com/theme/components/UI/FbComponentLoadingError'

  const ThingsSettingsThing = () => ({
    component: import('@/components/things/Settings/Thing'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  import Thing from '@/store/modules/io-server/Thing'
  import Channel from '@/store/modules/io-server/Channel'

  import ThingsSockets from '@/mixins/things.sockets'

  export default {

    name: 'ThingSettingsView',

    components: {
      ThingsSettingsThing,
    },

    mixins: [ThingsSockets],

    data() {
      return {
        id: this.$route.params.id,
      }
    },

    computed: {

      ...mapState({
        route: state => state.route,
      }),

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

      ...mapState('wampExchange', {
        exchangeConnected: state => state.isConnected,
      }),

      /**
       * View thing data
       *
       * @returns {Thing}
       */
      thing() {
        return Thing
          .query()
          .with('properties')
          .where('id', this.id)
          .first()
      },

      /**
       * View thing channels data
       *
       * @returns {Array}
       */
      channels() {
        return Channel
          .query()
          .with('properties')
          .where('thing_id', this.id)
          .orderBy('name')
          .all()
      },

      /**
       * Flag signalizing that thing is loading from server
       *
       * @returns {Boolean}
       */
      fetchingThing() {
        return this.$store.state.entities.thing.semaphore.fetching.items
          || this.$store.state.entities.thing.semaphore.fetching.item.indexOf(this.id) !== -1
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(`${THINGS_LIST_LINK}${THINGS_HASH_SETTINGS}${this.id}`)
        }
      },

      fetchingThing(val) {
        if (!val) {
          if (this.thing === null) {
            this.$router.replace(ERR_404_LINK)

            return
          }

          this._configureHeader()

          if (this.$wamp.isConnected) {
            this.subscribeToThingExchange(this.id)
          }
        }
      },

      exchangeConnected(val) {
        if (val) {
          this.subscribeToThingExchange(this.id)
        }
      },

    },

    created() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(`${THINGS_LIST_LINK}${THINGS_HASH_SETTINGS}${this.id}`)

        return
      }

      if (Thing.query().count() === 0) {
        if (!this.fetchingThing) {
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
      }

      if (!this.fetchingThing && this.thing === null) {
        this.$router.replace(ERR_404_LINK)

        return
      }

      if (this.thing) {
        this._configureHeader()

        if (this.$wamp.isConnected) {
          this.subscribeToThingExchange(this.id)
        }
      }
    },

    beforeDestroy() {
      if (this.thing) {
        if (
          this._.get(this.route, 'meta.path') !== THINGS_THING_DETAIL_LINK
          && this._.get(this.route, 'meta.path') !== THINGS_CHANNEL_SETTINGS_LINK
          && this.$wamp.isConnected
        ) {
          this.unsubscribeFromThingExchange(this.thing.id)
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
        this.$router.push(THINGS_CHANNEL_SETTINGS_LINK.replace(':id', this.thing.id).replace(':channelId', channel.id))
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
          link: this._getBackLink(),
          icon: 'angle-left',
        })

        this.setHeading({
          heading: this.thing.label,
          subHeading: this.thing.comment,
        })
      },

      /**
       * Create back link url determined on previous page
       *
       * @returns {String}
       *
       * @private
       */
      _getBackLink() {
        if (this._.get(this.route, 'from.meta.path') === THINGS_THING_DETAIL_LINK) {
          return this.route.from.fullPath
        }

        return THINGS_THING_DETAIL_LINK.replace(':id', this.thing.id)
      },

    },

    metaInfo() {
      return {
        title: this.$t('meta.title', { thing: this._.get(this.thing, 'label') }),
      }
    },

  }
</script>

<i18n src="./locales.json" />
