<template>
  <off-canvas-body
    v-if="routine"
    :heading="routine.name"
    :sub-heading="subHeading"
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
      <routine-detail
        v-if="view.opened === view.items.detail.name"
        :routine="routine"
        :style="`height: ${offCanvasHeight}px`"
        class="fb-routines-list-view__off-canvas-body"
      />

      <routine-settings
        v-if="view.opened === view.items.settings.name"
        :routine="routine"
        :style="`height: ${offCanvasHeight}px`"
        class="fb-routines-list-view__off-canvas-body"
        @removed="$emit('close')"
      />
    </transition>
  </off-canvas-body>
</template>

<script>
import {
  ROUTINES_HASH_DETAIL,
  ROUTINES_HASH_SETTINGS,
} from '@/configuration/routes'

import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

const RoutineDetail = () => ({
  component: import('./Routine'),
  loading: FbComponentLoading,
  error: FbComponentLoadingError,
  timeout: 5000,
})
const RoutineSettings = () => ({
  component: import('@/components/routines/Settings'),
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
        hash: ROUTINES_HASH_DETAIL,
        length: 8,
      },
    },
    settings: {
      name: 'settings',
      route: {
        hash: ROUTINES_HASH_SETTINGS,
        length: 10,
      },
    },
  },
}

export default {

  name: 'RoutinesDesktopDetail',

  components: {
    RoutineDetail,
    RoutineSettings,
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
      view: Object.assign({}, viewSettings),
      offCanvasHeight: null,
    }
  },

  computed: {

    /**
     * User account details
     *
     * @returns {(Account|null)}
     */
    account() {
      return this.$store.getters['entities/account/query']()
        .first()
    },

    /**
     * View routine data
     *
     * @returns {Trigger}
     */
    routine() {
      return this.$store.getters['entities/trigger/query']()
        .with('actions')
        .with('conditions')
        .with('notifications')
        .where('id', this.id)
        .first()
    },

    /**
     * Routine schedule condition
     *
     * @returns {(Condition|null)}
     */
    schedule() {
      const condition = this._.get(this.routine, 'conditions', []).find(item => item.isTime)

      if (typeof condition === 'undefined') {
        return null
      }

      return condition
    },

    /**
     * Get window sub-heading
     *
     * @returns {String}
     */
    subHeading() {
      let days = ''

      if (this.schedule !== null) {
        if (this.schedule.days.length === 7) {
          days = this.$t('routines.texts.everyday')
        } else {
          days = []

          for (const day of this.schedule.days) {
            switch (day) {
              case 1:
                days.push(this.$t('application.days.mon.short'))
                break

              case 2:
                days.push(this.$t('application.days.tue.short'))
                break

              case 3:
                days.push(this.$t('application.days.wed.short'))
                break

              case 4:
                days.push(this.$t('application.days.thu.short'))
                break

              case 5:
                days.push(this.$t('application.days.fri.short'))
                break

              case 6:
                days.push(this.$t('application.days.sat.short'))
                break

              case 7:
                days.push(this.$t('application.days.sun.short'))
                break
            }
          }

          days = days.join(', ')
        }
      }

      return this.routine.isAutomatic ? (this.schedule !== null ? this.$t('routines.headings.scheduledRoutine', { days, time: this.$dateFns.format(this.schedule.time, this._.get(this.account, 'timeFormat', 'HH:mm')) }) : this.$t('routines.headings.automaticRoutine')) : this.$t('routines.headings.manualRoutine')
    },

  },

  created() {
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
                name: this.$routes.routines.detail,
                params: {
                  id: this.routine.id,
                },
              }))
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.routines.list,
                hash: `${this.view.items.detail.route.hash}-${this.routine.id}`,
              }))
            }
            break

          case this.view.items.settings.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({
                name: this.$routes.routines.detail,
                params: {
                  id: this.routine.id,
                },
                hash: ROUTINES_HASH_SETTINGS,
              }))

              return
            } else {
              this.$router.push(this.localePath({
                name: this.$routes.routines.list,
                hash: `${this.view.items.settings.route.hash}-${this.routine.id}`,
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
