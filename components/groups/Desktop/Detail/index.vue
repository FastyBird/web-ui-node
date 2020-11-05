<template>
  <off-canvas-body
    v-if="group"
    :heading="group.name"
    :sub-heading="group.comment"
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
        class="button"
        @click.prevent="handleRightButton"
      >
        <font-awesome-icon
          v-if="view.opened === view.items.detail.name"
          icon="cogs"
        />
        <font-awesome-icon
          v-else
          icon="times"
        />
      </button>
    </template>

    <transition
      slot="body"
      name="fade"
      mode="out-in"
    >
      <group-detail
        v-if="view.opened === view.items.detail.name"
        :group="group"
        :style="`height: ${offCanvasHeight}px`"
        class="fb-groups-list-view__off-canvas-body"
      />

      <group-settings
        v-if="view.opened === view.items.settings.name"
        :group="group"
        :style="`height: ${offCanvasHeight}px`"
        class="fb-groups-list-view__off-canvas-body"
        @removed="$emit('close')"
      />
    </transition>
  </off-canvas-body>
</template>

<script>
import { FbUiComponentLoading, FbUiComponentLoadingError } from '@fastybird/web-ui-theme'

import {
  GROUPS_HASH_DETAIL,
  GROUPS_HASH_SETTINGS,
} from '~/configuration/routes'

import Group from '~/models/ui-node/Group'

const GroupDetail = () => ({
  component: import('~/components/groups/Detail'),
  loading: FbUiComponentLoading,
  error: FbUiComponentLoadingError,
  timeout: 10000,
})
const GroupSettings = () => ({
  component: import('~/components/groups/Settings'),
  loading: FbUiComponentLoading,
  error: FbUiComponentLoadingError,
  timeout: 10000,
})

const viewSettings = {
  opened: 'detail',
  items: {
    detail: {
      name: 'detail',
      route: {
        hash: GROUPS_HASH_DETAIL,
        length: 8,
      },
    },
    settings: {
      name: 'settings',
      route: {
        hash: GROUPS_HASH_SETTINGS,
        length: 10,
      },
    },
  },
}

export default {

  name: 'GroupsDesktopDetailContainer',

  components: {
    GroupDetail,
    GroupSettings,
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
      group: null,
      hardware: null,
      isButtonGroup: false,
      view: Object.assign({}, viewSettings),
      offCanvasHeight: null,
    }
  },

  created() {
    this.group = Group.find(this.id)

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

    handleRightButton() {
      if (this.view.opened === this.view.items.detail.name) {
        this.openView(this.view.items.settings.name)
      } else if (this.view.opened === this.view.items.settings.name) {
        this.$emit('close')
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
                name: this.$routes.groups.detail,
                params: {
                  id: this.group.id,
                },
              }))
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.groups.list,
                hash: `${this.view.items.detail.route.hash}-${this.group.id}`,
              }))
            }
            break

          case this.view.items.settings.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({
                name: this.$routes.groups.detail,
                params: {
                  id: this.group.id,
                },
                hash: GROUPS_HASH_SETTINGS,
              }))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.groups.list,
                hash: `${this.view.items.settings.route.hash}-${this.group.id}`,
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
