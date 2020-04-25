<template>
  <off-canvas-body
    v-if="thing"
    :heading="$tThingChannel(thing)"
    :sub-heading="$tThingDevice(thing)"
  >
    <template slot="left-button">
      <button
        class="button"
        @click.prevent="handleLeftButton"
      >
        <font-awesome-icon
          v-if="view.opened === view.items.detail.name"
          icon="times"
        />
        <font-awesome-icon
          v-else
          icon="arrow-left"
        />
      </button>
    </template>

    <template slot="right-button">
      <button
        v-if="view.opened === view.items.detail.name"
        class="button"
        @click.prevent="openView(view.items.settings.name)"
      >
        <font-awesome-icon icon="cogs" />
      </button>
      <button
        v-if="view.opened === view.items.settings.name"
        class="button"
        @click.prevent="$emit('close')"
      >
        <font-awesome-icon icon="times" />
      </button>
    </template>

    <transition
      slot="body"
      name="fade"
      mode="out-in"
    >
      <template v-if="view.opened === view.items.detail.name">
        <thing-detail-button
          v-if="isButtonThing"
          :thing="thing"
          :style="`height: ${offCanvasHeight}px`"
          class="fb-iot-things-list-view__off-canvas-body"
        />

        <thing-detail-default
          v-else
          :thing="thing"
          :style="`height: ${offCanvasHeight}px`"
          class="fb-iot-things-list-view__off-canvas-body"
        />
      </template>

      <thing-settings
        v-if="view.opened === view.items.settings.name"
        :thing="thing"
        :style="`height: ${offCanvasHeight}px`"
        class="fb-iot-things-list-view__off-canvas-body"
        @removed="$emit('close')"
      />
    </transition>
  </off-canvas-body>
</template>

<script>
import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

import {
  THINGS_HASH_DETAIL,
  THINGS_HASH_SETTINGS,
} from '@/configuration/routes'

import Hardware from '~/models/devices-node/Hardware'
import Thing from '~/models/Thing'

const ThingDetailDefault = () => ({
  component: import('@/components/things/Detail/Things/Default'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const ThingDetailButton = () => ({
  component: import('./Button'),
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
  opened: 'detail',
  items: {
    detail: {
      name: 'detail',
      route: {
        hash: THINGS_HASH_DETAIL,
        length: 8,
      },
    },
    settings: {
      name: 'settings',
      route: {
        hash: THINGS_HASH_SETTINGS,
        length: 10,
      },
    },
  },
}

export default {

  name: 'ThingsDesktopDetail',

  components: {
    ThingDetailDefault,
    ThingDetailButton,
    ThingSettings,
  },

  props: {

    id: {
      type: String,
      required: true,
    },

    settings: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      thing: null,
      hardware: null,
      isButtonThing: false,
      view: Object.assign({}, viewSettings),
      offCanvasHeight: null,
    }
  },

  created() {
    this.thing = Thing
      .query()
      .with('device')
      .with('channel')
      .where('channel_id', this.id)
      .first()

    this.hardware = Hardware
      .query()
      .where('device_id', this.thing.device_id)
      .first()

    this.isButtonThing = this.hardware !== null &&
      this.hardware.isManufacturerFastyBird &&
      (this.hardware.model === '8ch_buttons' || this.hardware.model === '16ch_buttons')

    this.view.opened = this.settings ? 'settings' : 'detail'
  },

  mounted() {
    this._calculateWindowHeight()

    window.addEventListener('resize', this._calculateWindowHeight)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this._calculateWindowHeight)
  },

  methods: {

    /**
     * Switch detail display according to actual state
     */
    handleLeftButton() {
      if (this.view.opened === this.view.items.detail.name) {
        this.$emit('close')
      } else if (this.view.opened === this.view.items.settings.name) {
        this.openView(this.view.items.detail.name)
      }
    },

    /**
     * Open selected view
     *
     * @param {String} view
     */
    openView(view) {
      if (Object.prototype.hasOwnProperty.call(this.view.items, view)) {
        switch (view) {
          case this.view.items.detail.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({
                name: this.$routes.things.detail,
                params: {
                  id: this.thing.id,
                },
              }))
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: `${this.view.items.detail.route.hash}-${this.thing.id}`,
              }))
            }
            break

          case this.view.items.settings.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({
                name: this.$routes.things.detail,
                params: {
                  id: this.thing.id,
                },
                hash: THINGS_HASH_SETTINGS,
              }))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.things.list,
                hash: `${this.view.items.settings.route.hash}-${this.thing.id}`,
              }))
            }
            break
        }

        this.view.opened = view
      }
    },

    /**
     * Calculate viewport size after window resizing
     *
     * @private
     */
    _calculateWindowHeight() {
      this.offCanvasHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    },

  },

}
</script>
