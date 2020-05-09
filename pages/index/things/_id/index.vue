<template>
  <div class="fb-things-thing-detail-view__container">
    <fb-loading-box
      v-if="fetchingThing && thing === null"
      :text="$t('texts.loading')"
    />

    <template v-else-if="thing !== null">
      <thing-detail-button
        v-if="isButtonThing && (view.opened === view.items.detail.name || view.opened === view.items.settings.name)"
        ref="detail"
        :thing="thing"
        @leftButtonAction="leftButtonAction"
        @rightButtonAction="rightButtonAction"
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
        class="fb-things-thing-detail-view__container-settings"
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
} from '~/configuration/routes'

import Hardware from '~/models/devices-node/Hardware'
import Thing from '~/models/things/Thing'

import ThingDetailDefault from '~/components/things/Phone/DetailDefault'
import ThingDetailButton from '~/components/things/Phone/DetailButton'
import ThingSettings from '~/components/things/Settings'

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

    thing(val) {
      if (val) {
        this._configureNavigation()

        this.$bus.$emit('device_fetched', this.thing.device_id)
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
            store.dispatch('template/resetHeadings', null, {
              root: true,
            })

            store.dispatch('template/resetButtons', null, {
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

    if (this.thing) {
      this._configureNavigation()
    }
  },

  mounted() {
    this.$nextTick(() => {
      this._setBlocksHeight('detail')

      this._checkRoute()

      this.$bus.$emit('device_fetched', this.thing.device_id)
    })

    this.$bus.$emit('wait-page_reloading', false)

    window.addEventListener('resize', this._windowResizeHandler)
  },

  updated() {
    this._setBlocksHeight('detail')
  },

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked', this.leftButtonAction)
    this.$bus.$off('heading_right_button-clicked', this.rightButtonAction)
    this.$bus.$off('heading_action_button-clicked', this.actionButtonAction)

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
            this.view.opened = view

            this.$nextTick(() => {
              if (this._.get(this.$refs, 'settings')) {
                const component = this._.get(this.$refs, 'settings')

                this._setBlocksHeight('settings')

                // Scroll view to setting part
                this.$scrollTo(component.$el, 500, {
                  container: '.fb-default-layout__content',
                  onDone: () => {
                    this.$router.push(this.localePath({
                      name: this.$routes.things.detail,
                      params: {
                        id: this.id,
                      },
                      hash: this.view.items.settings.route.hash,
                    }), () => {
                      // Reconfigure navigation after changes
                      this._configureNavigation()
                    })
                  },
                })
              }
            })
            break

          case this.view.items.detail.name:
            if (this._.get(this.$refs, 'detail')) {
              const component = this._.get(this.$refs, 'detail')

              this.$scrollTo(component.$el, 500, {
                container: '.fb-default-layout__content',
                onDone: () => {
                  this.$router.push(this.localePath({
                    name: this.$routes.things.detail,
                    params: {
                      id: this.id,
                    },
                  }), () => {
                    // Reconfigure navigation after changes
                    this._configureNavigation()
                  })

                  this.view.opened = view
                },
              })
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.things.detail,
                params: {
                  id: this.id,
                },
              }))

              this.view.opened = view

              // Reconfigure navigation after changes
              this._configureNavigation()
            }
            break
        }
      }
    },

    /**
     * Header left button action event
     */
    leftButtonAction() {
      if (this.windowSize === 'xs') {
        this.$bus.$emit('wait-page_reloading', 10)
      }

      this.$router.push(this.localePath({ name: this.$routes.things.list }))
    },

    /**
     * Header right button action event
     */
    rightButtonAction() {
      if (this.view.opened === this.view.items.settings.name) {
        this.openView(this.view.items.detail.name)
      } else {
        this.openView(this.view.items.settings.name)
      }
    },

    /**
     * Configure page header for small devices
     *
     * @private
     */
    _configureNavigation() {
      this.$store.dispatch('template/resetHeadings', null, {
        root: true,
      })

      this.$store.dispatch('template/resetButtons', null, {
        root: true,
      })

      this.$store.dispatch('template/setLeftButton', {
        name: this.$t('application.buttons.back.title'),
        icon: 'arrow-left',
      }, {
        root: true,
      })

      if (this.view.opened === this.view.items.settings.name) {
        this.$store.dispatch('template/setRightButton', {
          name: this.$t('application.buttons.close.title'),
        }, {
          root: true,
        })
      } else if (this.view.opened === this.view.items.detail.name || this.view.opened === this.view.items.type.name) {
        this.$store.dispatch('template/setRightButton', {
          name: this.$t('application.buttons.edit.title'),
        }, {
          root: true,
        })
      }

      this.$store.dispatch('template/setFullRowHeading', null, {
        root: true,
      })

      this.$store.dispatch('template/setHeading', {
        heading: this.$tThingChannel(this.thing),
        subHeading: this.$tThingDevice(this.thing),
      }, {
        root: true,
      })

      this.$store.dispatch('template/setHeadingIcon', {
        icon: this.$thingIcon(this.thing),
      }, {
        root: true,
      })

      this.$store.dispatch('app/bottomMenuCollapse', null, {
        root: true,
      })

      // Clear actions
      this.$bus.$off('heading_left_button-clicked')
      this.$bus.$off('heading_right_button-clicked')

      // Reassign actions
      this.$bus.$on('heading_left_button-clicked', this.leftButtonAction)
      this.$bus.$on('heading_right_button-clicked', this.rightButtonAction)
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
      this._setBlocksHeight('settings')

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
     *
     * @private
     */
    _setBlocksHeight(block) {
      if (this._.get(this.$refs, block)) {
        const component = this._.get(this.$refs, block)

        const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

        component.$el.style.minHeight = `${viewportHeight - this.$store.getters['template/bodyTopBottomMargin']()}px`
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
