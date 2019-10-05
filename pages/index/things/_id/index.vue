<template>
  <div class="fb-iot-things-thing-detail-view__container">
    <fb-loading-box
      v-if="(fetchingThing && thing === null) || fetchingChannels"
      :text="$t('texts.loading')"
    />

    <things-detail-thing
      v-if="thing !== null && !fetchingChannels"
      :thing="thing"
      :channels="channels"
    />
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    THINGS_LIST_LINK,
    THINGS_THING_SETTINGS_LINK,

    THINGS_HASH_DETAIL,
  } from '@/configuration/routes'

  import ThingsDetailThing from '@/components/things/Detail'

  export default {

    name: 'ThingDetailPage',

    components: {
      ThingsDetailThing,
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
          this.$router.push(`${this.localePath({ name: THINGS_LIST_LINK })}${THINGS_HASH_DETAIL}${this.id}`)
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
              link: app.localePath({ name: THINGS_LIST_LINK }),
              icon: 'angle-left',
            }, {
              root: true,
            })

            store.dispatch('header/showRightButton', null, {
              root: true,
            })

            store.dispatch('header/setRightButton', {
              name: app.i18n.t('application.buttons.settings.title'),
              link: app.localePath({ name: THINGS_THING_SETTINGS_LINK, params: { id: thing.id } }),
              icon: 'cogs',
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
        this.$router.push(`${this.localePath({ name: THINGS_LIST_LINK })}${THINGS_HASH_DETAIL}${this.id}`)

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
        this.channels.length === 0 &&
        !this.fetchingChannels &&
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
          this.$route.path !== this.localePath({ name: THINGS_THING_SETTINGS_LINK, params: { id: this._.get(this.$route, 'params.id') } }) &&
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
          link: this.localePath({ name: THINGS_LIST_LINK }),
          icon: 'angle-left',
        })

        this.showRightButton()

        this.setRightButton({
          name: this.$t('application.buttons.settings.title'),
          link: this.localePath({ name: THINGS_THING_SETTINGS_LINK, params: { id: this.thing.id } }),
          icon: 'cogs',
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
