<template>
  <layout name="LayoutDefault">
    <template v-if="!$store.state.entities.thing.semaphore.fetching.items && $store.state.entities.channel.semaphore.fetching.items.indexOf(id) === -1">
      <things-detail-channel-light
        v-if="thing !== null && thing !== null"
        :thing="channel"
        :channel="channel"
      />
    </template>

    <fb-loading-box
      v-if="$store.state.entities.thing.semaphore.fetching.items || $store.state.entities.channel.semaphore.fetching.items.indexOf(id) !== -1"
      :text="$t('texts.loading')"
    />
  </layout>
</template>

<script>
  import { mapState } from 'vuex'

  import {
    THINGS_LIST_LINK,
  } from '@/configuration/routes'

  const ThingsDetailChannelLight = () => import('@/components/things/Detail/Channel/LightActor')

  export default {

    name: 'ChannelDetailPage',

    components: {
      ThingsDetailChannelLight,
    },

    transition: 'fade',

    data() {
      return {
        id: this.$route.params.id,
        channelId: this.$route.params.channelId,
        thing: null,
        channel: null,
      }
    },

    computed: {

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

      things() {
        return this.$store.getters['entities/thing/all']()
      },

      channels() {
        return this.$store.getters['entities/channel/query']()
          .with('properties')
          .where('thing_id', this.id)
          .all()
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(`${this.localePath({ name: THINGS_LIST_LINK })}#detail-channel-${this.channelId}`)
        }
      },

      things(val) {
        if (val !== null) {
          this.thing = this.$store.getters['entities/thing/find'](this.id)

          if (this.thing === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

            return
          }

          this._configureNavigation()
        }
      },

      channels(val) {
        if (val !== null) {
          this.channel = this.$store.getters['entities/channel/query']()
            .with('properties')
            .where('id', this.channelId)
            .first()

          if (this.channel === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

            return
          }

          this._configureNavigation()
        }
      },

      channel(val) {
        if (val !== null) {
          if (!val.isLight) {
            this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })
          }
        }
      },

    },

    beforeMount() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(`${this.localePath({ name: THINGS_LIST_LINK })}#detail-channel-${this.channelId}`)

        return
      }

      this.thing = this.$store.getters['entities/thing/find'](this.id)

      if (!this.$store.state.entities.thing.semaphore.fetching.items && this.thing === null) {
        this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

        return
      }

      this.channel = this.$store.getters['entities/channel/query']()
        .with('properties')
        .where('id', this.channelId)
        .first()

      if (
        !this.$store.state.entities.thing.semaphore.fetching.items
        && this.$store.state.entities.channel.semaphore.fetching.items.indexOf(this.id) === -1
        && this.channel === null
      ) {
        this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

        return
      }

      if (this.thing) {
        this._configureNavigation()
      }
    },

    methods: {

      /**
       * Configure page header for small devices
       *
       * @private
       */
      _configureNavigation() {
        this.$store.dispatch('header/resetStore', null, {
          root: true,
        })

        this.$store.dispatch('header/setLeftButton', {
          name: this.$t('application.buttons.back.title'),
          link: this.localePath({ name: THINGS_LIST_LINK }),
          icon: 'arrow-left',
        }, {
          root: true,
        })

        this.$store.dispatch('header/hideRightButton', null, {
          root: true,
        })

        this.$store.dispatch('header/setHeading', {
          heading: this.thing.label,
          subHeading: this.$tChannel(this.thing, this.channel),
        }, {
          root: true,
        })
      },

    },

  }
</script>

<i18n src="./locales.json" />
