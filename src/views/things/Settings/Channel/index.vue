<template>
  <layout name="LayoutDefault">
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
  </layout>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    THINGS_LIST_LINK,
    THINGS_THING_SETTINGS_LINK,

    THINGS_HASH_CHANNEL_SETTINGS,

    ERR_404_LINK,
  } from '../../../../router'

  import FbComponentLoading from '@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@fastybird-com/theme/components/UI/FbComponentLoadingError'

  const ThingsSettingsChannel = () => ({
    component: import('@/components/things/Settings/Channel'),
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
      ThingsSettingsChannel,
    },

    mixins: [ThingsSockets],

    data() {
      return {
        id: this.$route.params.id,
        channelId: this.$route.params.channelId,
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
       * View thing channel data
       *
       * @returns {Channel}
       */
      channel() {
        return Channel
          .query()
          .with('properties')
          .where('id', this.channelId)
          .where('thing_id', this.id)
          .first()
      },

      /**
       * Flag signalizing that thing is loading from server
       *
       * @returns {Boolean}
       */
      fetchingChannel() {
        return this.$store.state.entities.thing.semaphore.fetching.items
          || this.$store.state.entities.thing.semaphore.fetching.item.indexOf(this.id) !== -1
          || this.$store.state.entities.channel.semaphore.fetching.items.indexOf(this.id) !== -1
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(`${THINGS_LIST_LINK}${THINGS_HASH_CHANNEL_SETTINGS}${this.channelId}`)
        }
      },

      fetchingChannel(val) {
        if (!val) {
          if (this.thing === null || this.channel === null) {
            this.$router.replace(ERR_404_LINK)

            return
          }

          this._configureHeader()

          if (this.$wamp.isConnected) {
            this.subscribeToThingExchange(this.id, this.channelId)
          }
        }
      },

      exchangeConnected(val) {
        if (val) {
          this.subscribeToThingExchange(this.id, this.channelId)
        }
      },

    },

    created() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(`${THINGS_LIST_LINK}${THINGS_HASH_CHANNEL_SETTINGS}${this.channelId}`)

        return
      }

      if (Thing.query().count() === 0) {
        if (!this.fetchingChannel) {
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

      if (!this.fetchingChannel && (this.thing === null || this.channel === null)) {
        this.$router.replace(ERR_404_LINK)

        return
      }

      if (this.thing && this.channel !== null) {
        this._configureHeader()

        if (this.$wamp.isConnected) {
          this.subscribeToThingExchange(this.id, this.channelId)
        }
      }
    },

    beforeDestroy() {
      if (this.thing) {
        if (this._.get(this.route, 'meta.path') !== THINGS_THING_SETTINGS_LINK && this.$wamp.isConnected) {
          this.unsubscribeFromThingExchange(this.thing.id, this.channel.id)
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
          link: this._getBackLink(),
          icon: 'angle-left',
        })

        this.setHeading({
          heading: this.thing.label,
          subHeading: this.channel.label,
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
        if (this._.get(this.route, 'from.meta.path') === THINGS_THING_SETTINGS_LINK) {
          return this.route.from.fullPath
        }

        return THINGS_THING_SETTINGS_LINK.replace(':id', this.thing.id)
      },

    },

    metaInfo() {
      return {
        title: this.$t('meta.title', { thing: this._.get(this.thing, 'label'), channel: this._.get(this.channel, 'label') }),
      }
    },

  }
</script>

<i18n src="./locales.json" />
