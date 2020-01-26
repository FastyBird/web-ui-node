<template>
  <div class="fb-iot-things-thing-settings-view__container">
    <fb-loading-box
      v-if="fetchingThing && thing === null"
      :text="$t('things.texts.loadingThing')"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import {
  THINGS_HASH_ROUTINES,
} from '@/configuration/routes'

export default {

  name: 'ThingRoutinesPage',

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

    windowSize(val) {
      if (val !== 'xs') {
        this.$router.push(this.localePath({
          name: this.$routes.things.list,
          hash: `${THINGS_HASH_ROUTINES}-${this.id}`,
        }))
      }
    },

    fetchingThing(val) {
      if (!val) {
        if (this.thing === null) {
          this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

          return
        }

        this._configureNavigation()
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
            link: app.localePath({ name: this.$routes.things.detail, params: { id: thing.channel_id } }),
            icon: 'arrow-left',
          }, {
            root: true,
          })

          store.dispatch('header/setHeading', {
            heading: app.$tThing(thing),
            subHeading: app.$tThingDevice(thing),
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
        .catch((e) => {
          // eslint-disable-next-line
          console.log(e)

          error({ statusCode: 404, message: 'Page Not Found' })
        })
    }
  },

  beforeMount() {
    if (this.windowSize !== null && this.windowSize !== 'xs') {
      this.$router.push(this.localePath({
        name: this.$routes.things.list,
        hash: `${THINGS_HASH_ROUTINES}-${this.id}`,
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
        .catch((e) => {
          // eslint-disable-next-line
          console.log(e)
        })
    }

    if (!this.fetchingThing && !this.fetchingThings && this.thing === null) {
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
        link: this.localePath({ name: this.$routes.things.detail, params: { id: this.thing.channel_id } }),
        icon: 'arrow-left',
      }, {
        root: true,
      })

      this.$store.dispatch('header/setFullRowHeading', null, {
        root: true,
      })

      this.$store.dispatch('header/setHeading', {
        heading: this.$tThing(this.thing),
        subHeading: this.$tThingDevice(this.thing),
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

  },

  head() {
    return {
      title: this.$t('meta.things.routines.title', { thing: this.$tThing(this.thing) }),
    }
  },

}
</script>
