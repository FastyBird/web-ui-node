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
  import { mapState, mapActions } from 'vuex'

  import {
    THINGS_LIST_LINK,
    THINGS_CHANNEL_SETTINGS_LINK,
    ERR_404_LINK,
  } from '@/router'

  const ThingsDetailChannelLight = () => import('@/components/things/Detail/Channel/LightActor')

  import {
    CHANNEL_TYPE_LIGHT,
  } from '@/constants'

  export default {

    name: 'ChannelDetailView',

    components: {
      ThingsDetailChannelLight,
    },

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
          this.$router.push(`${THINGS_LIST_LINK}#detail-channel-${this.channelId}`)
        }
      },

      things(val) {
        if (val !== null) {
          this.thing = this.$store.getters['entities/thing/find'](this.id)

          if (this.thing === null) {
            this.$router.push(ERR_404_LINK)

            this.$toasted.error(this.$t('messages.notFound'), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })

            return
          }

          this._configureHeader()
        }
      },

      channels(val) {
        if (val !== null) {
          this.channel = this.$store.getters['entities/channel/query']()
            .with('properties')
            .where('id', this.channelId)
            .first()

          if (this.channel === null) {
            this.$router.push(ERR_404_LINK)

            this.$toasted.error(this.$t('messages.notFound'), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })

            return
          }

          this._configureHeader()
        }
      },

      channel(val) {
        if (val !== null) {
          if (val.structure_type !== CHANNEL_TYPE_LIGHT) {
            this.$router.push(ERR_404_LINK)

            this.$toasted.error(this.$t('messages.notFound'), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })
          }
        }
      },

    },

    created() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(`${THINGS_LIST_LINK}#detail-channel-${this.channelId}`)

        return
      }

      this.thing = this.$store.getters['entities/thing/find'](this.id)

      if (!this.$store.state.entities.thing.semaphore.fetching.items && this.thing === null) {
        this.$router.push(ERR_404_LINK)

        this.$toasted.error(this.$t('messages.notFound'), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })

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
        this.$router.push(ERR_404_LINK)

        this.$toasted.error(this.$t('messages.notFound'), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })

        return
      }

      if (this.thing) {
        this._configureHeader()
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
          link: THINGS_CHANNEL_SETTINGS_LINK.replace(':id', this.thing.id).replace(':channelId', this.channel.id),
          icon: 'cogs',
        })

        this.setHeading({
          heading: this.thing.label,
          subHeading: this.$tChannel(this.thing, this.channel),
        })
      },

    },

  }
</script>

<i18n src="./locales.json" />
