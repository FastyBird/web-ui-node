<template>
  <div class="fb-triggers-list-view__container">
    <triggers-list-container>
      <template slot="items">
        <triggers-list-item
          v-for="trigger in triggers"
          :key="trigger.id"
          :trigger="trigger"
          class="col-md-6 col-lg-4"
          @click="oneClick"
        />
      </template>
    </triggers-list-container>

    <!-- TRIGGER DETAIL FOR LARGE DEVICES //-->
    <off-canvas
      v-if="view.opened.type !== null && windowSize !== 'xs'"
      :heading="detailHeading()"
      :sub-heading="detailSubHeading()"
      @close="closeView(view.opened.type)"
    >
      <template slot="left-button">
        <button
          class="button"
          @click.prevent="closeView(view.opened.type)"
        >
          <font-awesome-icon icon="times" />
        </button>
      </template>

      <transition
        slot="body"
        name="fade"
        mode="out-in"
      >
        <triggers-detail
          v-if="view.opened.type === view.detail.name"
          :trigger="viewTrigger"
          :style="`height: ${offCanvasHeight}px`"
          class="fb-triggers-list-view__off-canvas-body"
          @removed="closeView"
        />
      </transition>
    </off-canvas>

    <fb-loading-box
      v-if="fetchingTriggers && triggers.length === 0"
      :text="$t('texts.loading')"
    />

    <div
      v-show="!fetchingTriggers && triggers.length === 0"
      class="p-x-md"
    >
      <div class="row">
        <div class="col-8 offset-2 col-sm-6 offset-sm-3 col-md-4 offset-md-4 col-xl-2 offset-xl-5 p-t-lg">
          <div class="text-center p-a-lg">
            <span class="icon-with-child">
              <font-awesome-icon
                icon="sliders-h"
                class="icon-5x text-muted m-y-lg"
              />
              <span
                class="bg-primary circle sq-32 icon-2x icon-child m-y-lg"
                style="padding-top: 1px;"
              >
                <font-awesome-icon icon="plus" />
              </span>
            </span>
          </div>

          <p class="text-center m-b-lg">
            {{ $t('texts.noTriggers') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    TRIGGERS_LIST_LINK,
    TRIGGERS_TRIGGER_DETAIL_LINK,
    TRIGGERS_CREATE_LINK,

    TRIGGERS_HASH_DETAIL,
  } from '@/configuration/routes'

  import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

  import TriggersListContainer from '@/components/triggers/List/Container'
  import TriggersListItem from '@/components/triggers/List/Item'

  // Trigger detail
  const TriggersDetail = () => ({
    component: import('@/components/triggers/Detail'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  // Off canvas details view
  const OffCanvas = () => ({
    component: import('@/components/layout/OffCanvas'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  export default {

    name: 'TriggersListPage',

    components: {
      TriggersListItem,
      TriggersListContainer,
      TriggersDetail,

      OffCanvas,
    },

    transition: 'fade',

    data() {
      return {
        loading: {
          detail: null,
        },
        view: {
          opened: {
            type: null,
          },
          detail: {
            name: 'detail',
            id: null,
            route: {
              hash: TRIGGERS_HASH_DETAIL,
              length: 8,
            },
          },
        },
        click: {
          delay: 200,
          clicks: 0,
          timer: null,
        },
        offCanvasHeight: null,
      }
    },

    computed: {

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

      /**
       * Get all created & loaded triggers
       *
       * @returns {Array}
       */
      triggers() {
        return this.$store.getters['entities/trigger/query']()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .orderBy('name')
          .all()
      },

      /**
       * View thing data
       *
       * @returns {(Trigger|null)}
       */
      viewTrigger() {
        if (this.view.opened.type === null) {
          return null
        }

        let triggerId = 0

        switch (this.view.opened.type) {
          case this.view.detail.name:
            triggerId = this.view.detail.id
            break
        }

        return this.$store.getters['entities/trigger/query']()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .where('id', triggerId)
          .first()
      },

      /**
       * Flag signalizing that triggers are loading from server
       *
       * @returns {Boolean}
       */
      fetchingTriggers() {
        return this._.get(this.$store, 'state.entities.trigger.semaphore.fetching.items', false)
      },

    },

    watch: {

      '$route'(val) {
        if (this._.get(val, 'hash', '') === '') {
          this.closeView()
        } else if (this._.get(val, 'hash', '') !== '') {
          for (const viewName in this.view) {
            if (
              this.view.hasOwnProperty(viewName)
              && viewName !== 'opened'
              && val.hash.indexOf(this._.get(this.view[viewName], 'route.hash', '')) !== -1
            ) {
              this.openView(viewName, val.hash.substring(this._.get(this.view[viewName], 'route.length', 0)))

              return
            }
          }
        }
      },

      windowSize(val) {
        if ((val === 'xs')) {
          if (this.view.opened.type === this.view.detail.name) {
            this.$router.push(this.localePath({ name: TRIGGERS_TRIGGER_DETAIL_LINK, params: { id: this.view.detail.id } }))

            return
          }
        }

        this._calculateWindowHeight()
      },

      fetchingTriggers(val) {
        if (!val) {
          this._checkRoute()
        }
      },

    },

    fetch({ app, store }) {
      if (!store.getters['entities/trigger/firstLoadFinished']()) {
        return store.dispatch('entities/trigger/fetch', null, {
          root: true,
        })
          .then(() => {
            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: app.i18n.t('application.headings.triggers.list'),
            }, {
              root: true,
            })

            store.dispatch('header/setRightButton', {
              name: app.i18n.t('application.buttons.add.title'),
              icon: 'plus',
              link: app.localePath({ name: TRIGGERS_CREATE_LINK }),
            }, {
              root: true,
            })
          })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }
    },

    beforeMount() {
      if (
        this.$store.getters['entities/trigger/query']().count() === 0 &&
        !this.fetchingTriggers &&
        !this.$store.getters['entities/trigger/firstLoadFinished']()
      ) {
        this.$store.dispatch('entities/trigger/fetch', null, {
          root: true,
        })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }

      this._configureHeader()
    },

    mounted() {
      this._calculateWindowHeight()

      if (!this.fetchingTriggers) {
        this._checkRoute()
      }
    },

    methods: {

      ...mapActions('header', [
        'setHeading',
        'setRightButton',
        'resetStore',
      ]),

      /**
       * Event fired by loaded component
       *
       * @param {String} component
       */
      componentLoaded(component) {
        if (this.loading.hasOwnProperty(component)) {
          this.loading[component] = null
        }
      },

      /**
       * Get detail window heading
       *
       * @returns {String}
       */
      detailHeading() {
        if (this.view.opened.type === this.view.detail.name) {
          return this.viewTrigger.name
        }

        return 'N/A'
      },

      /**
       * Get detail window sub-heading
       *
       * @returns {(String|null)}
       */
      detailSubHeading() {
        if (this.view.opened.type === this.view.detail.name) {
          return this.viewTrigger.hasComment ? this.viewTrigger.comment : null
        }

        return 'N/A'
      },

      openCreate() {
        this.$router.push(this.localePath({ name: TRIGGERS_CREATE_LINK }))
      },

      /**
       * Open triggers view
       *
       * @param {String} view
       * @param {String} id
       */
      openView(view, id) {
        for (const viewName in this.view) {
          if (this.view.hasOwnProperty(viewName)) {
            if (this.view[viewName].hasOwnProperty('id')) {
              this.view[viewName].id = null
            }
          }
        }

        switch (view) {
          case this.view.detail.name:
            if (this.windowSize === 'xs') {
              this.$router.push(this.localePath({ name: TRIGGERS_TRIGGER_DETAIL_LINK, params: { id } }))
            } else {
              this.$router.push(`${this.localePath({ name: TRIGGERS_LIST_LINK })}${this.view.detail.route.hash}${id}`)
            }
            break
        }

        if (this.view.hasOwnProperty(view)) {
          this.view.opened.type = view

          if (this.view[view].hasOwnProperty('id') && typeof id !== 'undefined') {
            this.view[view].id = id
          }
        }

        if (this.loading.hasOwnProperty(view) && typeof id !== 'undefined') {
          this.loading[view] = id
        }
      },

      /**
       * Close triggers view window
       *
       * @param {String} view
       */
      closeView(view) {
        this.$router.push(this.localePath({ name: TRIGGERS_LIST_LINK }))

        this.view.opened.type = null

        if (typeof view !== 'undefined' && this.view.hasOwnProperty(view)) {
          if (this.view[view].hasOwnProperty('id')) {
            this.view[view].id = null
          }
        }

        this.$el.focus()
      },

      /**
       * Double click and single click event handler
       *
       * @param {Object} event
       * @param {Object} item
       * @param {String} item.id
       */
      oneClick(event, item) {
        const path = this.getEventElementsPath(event)

        for (const pathItem of path) {
          if (typeof pathItem.getAttribute === 'function') {
            if (pathItem.getAttribute('role') === 'button' || pathItem.getAttribute('role') === 'dialog') {
              return
            }
          }
        }

        this.click.clicks++

        if (this.click.clicks === 1) {
          const that = this

          this.click.timer = setTimeout(() => {
            that.openView(this.view.detail.name, item.id)

            that.click.clicks = 0
          }, this.click.delay)
        }
      },

      /**
       * Check route and if is needed open detail window
       *
       * @private
       */
      _checkRoute() {
        if (this.$route.hash !== '') {
          if (this.$route.hash.search(this.view.detail.route.hash) !== -1) {
            const trigger = this._.find(this.triggers, { id: this.$route.hash.substring(this.view.detail.route.length) })

            if (trigger) {
              this.openView(this.view.detail.name, trigger)
            }
          }
        }
      },

      /**
       * Calculate viewport size after window resizing
       *
       * @private
       */
      _calculateWindowHeight() {
        this.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

        if (this.windowSize === 'xs') {
          this.offCanvasHeight = null
        } else {
          this.offCanvasHeight = this.viewportHeight - 50
        }
      },

      /**
       * Configure page header for small devices
       *
       * @private
       */
      _configureHeader() {
        this.resetStore()

        this.setHeading({
          heading: this.$t('application.headings.triggers.list'),
        })

        this.setRightButton({
          name: this.$t('application.buttons.add.title'),
          icon: 'plus',
          link: this.localePath({ name: TRIGGERS_CREATE_LINK }),
        })
      },

    },

    head() {
      return {
        title: this.$t('meta.title'),
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import './index.scss';
</style>

<i18n src="./locales.json" />
