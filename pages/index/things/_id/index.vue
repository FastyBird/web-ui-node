<template>
  <div class="fb-iot-things-thing-detail-view__container">
    <fb-loading-box
      v-if="fetchingThing && thing === null"
      :text="$t('texts.loading')"
    />

    <template v-else-if="thing !== null">
      <thing-detail-button
        v-if="isButtonThing && (view.opened === view.items.detail.name || view.opened === view.items.settings.name)"
        ref="detail"
        :thing="thing"
      />

      <thing-detail-default
        v-if="!isButtonThing && (view.opened === view.items.detail.name || view.opened === view.items.settings.name)"
        ref="detail"
        :thing="thing"
      />

      <thing-settings
        v-if="view.opened === view.items.settings.name"
        ref="settings"
        v-body-scroll-lock="true"
        :thing="thing"
        class="fb-iot-things-thing-detail-view__container-settings"
        @removed="thingRemoved"
      />
    </template>
  </div>
</template>

<script>
import get from 'lodash/get'

import {
  THINGS_HASH_DETAIL,
  THINGS_HASH_SETTINGS,
} from '@/configuration/routes'

import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import Hardware from '~/models/devices-node/Hardware'
import Thing from '~/models/Thing'

const ThingDetailDefault = () => ({
  component: import('@/components/things/Phone/DetailDefault'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const ThingDetailButton = () => ({
  component: import('@/components/things/Phone/DetailButton'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const ThingSettings = () => ({
  component: import('@/components/things/Settings'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})

const viewSettings = {
  opened: 'detail', // Detail is by default
  items: {
    detail: {
      name: 'detail',
      route: {
        hash: THINGS_HASH_DETAIL,
      },
    },
    settings: {
      name: 'settings',
      route: {
        hash: THINGS_HASH_SETTINGS,
      },
    },
  },
}

export default {

  name: 'ThingDetailPage',

  components: {
    ThingDetailDefault,
    ThingDetailButton,

    ThingSettings,
  },

  transition: 'fade',

  data() {
    return {
      id: this.$route.params.id,
      view: Object.assign({}, viewSettings),
    }
  },

  computed: {

    /**
     * @returns {String}
     */
    windowSize() {
      return this.$store.state.template.windowSize
    },

    /**
     * View thing data
     *
     * @returns {Thing}
     */
    thing() {
      return Thing
        .query()
        .with('device')
        .with('channel')
        .where('channel_id', this.id)
        .first()
    },

    /**
     * Get thing hardware info
     *
     * @returns {(Hardware|null)}
     */
    hardware() {
      return Hardware
        .query()
        .where('device_id', this.thing.device_id)
        .first()
    },

    /**
     * Check if thing is button type
     *
     * @returns {Boolean}
     */
    isButtonThing() {
      return this.hardware !== null &&
        this.hardware.isManufacturerFastyBird &&
        (this.hardware.model === '8ch_buttons' || this.hardware.model === '16ch_buttons')
    },

    /**
     * Flag signalizing that things are loading from server
     *
     * @returns {Boolean}
     */
    fetchingThings() {
      return Thing.getters('fetching')()
    },

    /**
     * Flag signalizing that thing is loading from server
     *
     * @returns {Boolean}
     */
    fetchingThing() {
      return Thing.getters('getting')(this.id)
    },

  },

  watch: {

    '$route'(val) {
      if (this._.get(val, 'hash', '') !== '') {
        for (const viewName in this.view.items) {
          if (
            Object.prototype.hasOwnProperty.call(this.view.items, viewName) &&
            this.view.items[viewName].name !== this.view.opened &&
            val.hash.includes(this._.get(this.view.items[viewName], 'route.hash', ''))
          ) {
            this.openView(this.view.items[viewName].name)

            return
          }
        }
      } else if (this.view.opened !== this.view.items.detail.name && this._.get(this.$refs, 'detail')) {
        const component = this._.get(this.$refs, 'detail')

        this.$scrollTo(component.$el, 500, {
          container: '.fb-default-layout__content',
          onDone: () => {
            this.openView(this.view.items.detail.name)
          },
        })
      }
    },

    windowSize(val) {
      if (val !== 'xs') {
        if (this.$route.hash !== '') {
          if (this.$route.hash.includes(THINGS_HASH_SETTINGS)) {
            this.$router.push(this.localePath({
              name: this.$routes.things.list,
              hash: `${THINGS_HASH_SETTINGS}-${this.id}`,
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
        }
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

          if (thing) {
            store.dispatch('template/resetStore', null, {
              root: true,
            })

            store.dispatch('template/setLeftButton', {
              name: app.i18n.t('application.buttons.back.title'),
              icon: 'arrow-left',
            }, {
              root: true,
            })

            store.dispatch('template/setRightButton', {
              name: app.i18n.t('application.buttons.edit.title'),
            }, {
              root: true,
            })

            store.dispatch('template/setFullRowHeading', null, {
              root: true,
            })

            store.dispatch('template/setHeading', {
              heading: app.$tThingChannel(thing),
              subHeading: app.$tThingDevice(thing),
            }, {
              root: true,
            })

            store.dispatch('template/setHeadingIcon', {
              icon: app.$thingIcon(thing),
            }, {
              root: true,
            })

            store.dispatch('app/bottomMenuCollapse', null, {
              root: true,
            })
          } else {
            error({ statusCode: 404, message: 'Thing Not Found' })
          }
        })
        .catch((e) => {
          if (get(e, 'exception.response.status', 0) === 404) {
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
      Thing.query().count() === 0 &&
      !this.fetchingThings &&
      !this.fetchingThing &&
      !Thing.getters('firstLoadFinished')()
    ) {
      Thing.dispatch('get', {
        id: this.id,
      })
        .catch((e) => {
          if (this._.get(e, 'exception.response.status', 0) === 404) {
            this.$nuxt.error({ statusCode: 404, message: 'Thing Not Found' })
          } else {
            this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          }
        })
    }

    if (!this.fetchingThing && !this.fetchingThings && this.thing === null) {
      this.$nuxt.error({ statusCode: 404, message: 'Thing Not Found' })
    }
  },

  mounted() {
    this._checkRoute()

    this.$nextTick(() => {
      this._setBlocksHeight('detail')
    })

    window.addEventListener('resize', this._windowResizeHandler)
  },

  updated() {
    this._setBlocksHeight('detail')
  },

  beforeDestroy() {
    window.removeEventListener('resize', this._windowResizeHandler)
  },

  methods: {

    /**
     * Thing was removed, navigate to things list
     */
    thingRemoved() {
      this.$router.push(this.localePath(this.$routes.things.list))
    },

    /**
     * Open selected view
     *
     * @param {String} view
     */
    openView(view) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        switch (view) {
          case this.view.items.settings.name:
            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: this.id,
              },
              hash: this.view.items.settings.route.hash,
            }))

            this.$nextTick(() => {
              if (this._.get(this.$refs, 'settings')) {
                const component = this._.get(this.$refs, 'settings')

                this._setBlocksHeight('settings', 'height')

                // Scroll view to setting part
                this.$scrollTo(component.$el, 500, {
                  container: '.fb-default-layout__content',
                })
              }
            })
            break

          default:
            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: this.id,
              },
            }))
            break
        }

        this.view.opened = view
      }
    },

    /**
     * Check route and if is needed open detail window
     *
     * @private
     */
    _checkRoute() {
      if (this.$route.hash !== '') {
        if (this.$route.hash.includes(THINGS_HASH_SETTINGS)) {
          this.openView(this.view.items.settings.name)
        }
      }
    },

    /**
     * Update blocks height according to resized window
     *
     * @private
     */
    _windowResizeHandler() {
      this._setBlocksHeight('detail')
      this._setBlocksHeight('settings', 'height')

      if (this._.get(this.$refs, this.view.opened)) {
        const component = this._.get(this.$refs, this.view.opened)

        this.$scrollTo(component.$el, 1, {
          container: '.fb-default-layout__content',
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

        component.$el.style[attribute] = `${document.getElementsByClassName('fb-default-layout__content')[0].clientHeight}px`
      }
    },

  },

  validate({ app, params }) {
    return app.$validateUUID(params.id)
  },

  head() {
    return {
      title: this.$t('meta.things.detail.title', { thing: this.$tThingChannel(this.thing) }),
    }
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
