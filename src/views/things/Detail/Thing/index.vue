<template web>
  <layout name="LayoutDefault">
    <div class="fb-iot-things-thing-detail-view__container">
      <fb-loading-box
        v-if="fetchingThing && thing === null"
        :text="$t('texts.loading')"
      />

      <things-detail-thing
        v-if="thing !== null"
        :thing="thing"
        :channels="channels"
      />
    </div>
  </layout>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    THINGS_LIST_LINK,
    THINGS_THING_SETTINGS_LINK,

    THINGS_HASH_DETAIL,

    ERR_404_LINK,
  } from '@/router'

  import FbComponentLoading from '@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@fastybird-com/theme/components/UI/FbComponentLoadingError'

  const ThingsDetailThing = () => ({
    component: import('@/components/things/Detail'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  import Thing from '@/store/modules/io-server/Thing'
  import Channel from '@/store/modules/io-server/Channel'

  import ThingsSockets from '@/mixins/things.sockets'

  export default {

    name: 'ThingDetailView',

    components: {
      ThingsDetailThing,
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
          || this.$store.state.entities.channel.semaphore.fetching.items.indexOf(this.id) !== -1
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(`${THINGS_LIST_LINK}${THINGS_HASH_DETAIL}${this.id}`)
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
        this.$router.push(`${THINGS_LIST_LINK}${THINGS_HASH_DETAIL}${this.id}`)

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
        if (this._.get(this.route, 'meta.path') !== THINGS_THING_SETTINGS_LINK && this.$wamp.isConnected) {
          this.unsubscribeFromThingExchange(this.thing.id)
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
          link: THINGS_LIST_LINK,
          icon: 'angle-left',
        })

        this.showRightButton()

        this.setRightButton({
          name: this.$t('application.buttons.settings.title'),
          link: THINGS_THING_SETTINGS_LINK.replace(':id', this.thing.id),
          icon: 'cogs',
        })

        this.setHeading({
          heading: this.thing.label,
          subHeading: this.thing.comment,
        })
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
