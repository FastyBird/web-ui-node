<template>
  <div class="fb-iot-groups-group-detail-view__container">
    <fb-loading-box
      v-if="(fetchingGroup && group === null) || fetchingThings"
      :text="$t('groups.texts.loadingGroup')"
    />

    <template v-else>
      <group-detail
        ref="detail"
        :group="group"
        :things="things"
      />

      <group-settings
        v-if="settings"
        ref="settings"
        v-body-scroll-lock="true"
        :group="group"
        class="fb-iot-groups-group-detail-view__container-settings"
        @removed="thingRemoved"
      />
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import { orderBy } from 'natural-orderby'

  import {
    GROUPS_HASH_DETAIL,
    GROUPS_HASH_SETTINGS,
  } from '@/configuration/routes'

  import GroupDetail from '@/components/groups/Detail'
  import GroupSettings from '@/components/groups/Settings'
  import get from 'lodash/get'

  export default {

    name: 'GroupDetailPage',

    components: {
      GroupDetail,
      GroupSettings,
    },

    transition: 'fade',

    data() {
      return {
        id: this.$route.params.id,
        settings: false,
      }
    },

    computed: {

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

      /**
       * View group data
       *
       * @returns {Group}
       */
      group() {
        return this.$store.getters['entities/group/query']()
          .where('id', this.id)
          .first()
      },

      /**
       * View group things data
       *
       * @returns {Array}
       */
      things() {
        const items = this.$store.getters['entities/thing/query']()
          .with('device')
          .with('device.properties')
          .with('device.socket')
          .with('channel')
          .with('channel.properties')
          .where('channel_id', this.group.channels_ids)
          .all()

        return orderBy(
          items,
          [
            v => v.label,
            v => v.comment,
          ],
          ['asc'],
        )
      },

      /**
       * Flag signalizing that groups are loading from server
       *
       * @returns {Boolean}
       */
      fetchingGroups() {
        return this.$store.getters['entities/group/fetching']()
      },

      /**
       * Flag signalizing that group is loading from server
       *
       * @returns {Boolean}
       */
      fetchingGroup() {
        return this.$store.getters['entities/group/getting'](this.id)
      },

      /**
       * Flag signalizing that group things are loading from server
       *
       * @returns {Boolean}
       */
      fetchingThings() {
        return this.$store.getters['entities/thing/fetching']()
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          if (this.$route.hash !== '') {
            if (this.$route.hash.indexOf(GROUPS_HASH_SETTINGS) !== -1) {
              this.$router.push(this.localePath({
                name: this.$routes.groups.list,
                hash: `${GROUPS_HASH_SETTINGS}-${this.id}`,
              }))
            }
          } else {
            this.$router.push(this.localePath({
              name: this.$routes.groups.list,
              hash: `${GROUPS_HASH_DETAIL}-${this.id}`,
            }))
          }
        }
      },

      fetchingGroup(val) {
        if (!val) {
          if (this.group === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Group Not Found' })

            return
          }

          this._configureNavigation()
        }
      },

    },

    fetch({ app, store, params, error }) {
      if (store.getters['entities/group/query']().count() === 0) {
        return store.dispatch('entities/group/get', {
          id: params.id,
        }, {
          root: true,
        })
          .then(() => {
            const group = store.getters['entities/group/find'](params.id)

            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/setLeftButton', {
              name: app.i18n.t('application.buttons.back.title'),
              link: app.localePath(app.$routes.groups.list),
              icon: 'arrow-left',
            }, {
              root: true,
            })

            store.dispatch('header/hideRightButton', null, {
              root: true,
            })

            store.dispatch('header/setFullRowHeading', null, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: group.label,
              subHeading: group.comment,
            }, {
              root: true,
            })

            store.dispatch('header/setHeadingIcon', {
              icon: app.$groupIcon(group),
            }, {
              root: true,
            })

            store.dispatch('bottomNavigation/resetStore', null, {
              root: true,
            })
          })
          .catch(e => {
            if (get(e, 'exception.response.status', 0) === 404) {
              error({ statusCode: 404, message: 'Group Not Found' })
            } else {
              error({ statusCode: 503, message: 'Something went wrong' })
            }
          })
      }
    },

    beforeMount() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(this.localePath({
          name: this.$routes.groups.list,
          hash: `${GROUPS_HASH_DETAIL}-${this.id}`,
        }))

        return
      }

      if (
        this.$store.getters['entities/group/query']().count() === 0 &&
        !this.fetchingGroups &&
        !this.fetchingGroup &&
        !this.$store.getters['entities/group/firstLoadFinished']()
      ) {
        this.$store.dispatch('entities/group/get', {
          id: this.id,
        }, {
          root: true,
        })
          .catch(e => {
            if (this._.get(e, 'exception.response.status', 0) === 404) {
              this.$nuxt.error({ statusCode: 404, message: 'Group Not Found' })
            } else {
              this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
            }
          })
      }

      if (
        this.things.length === 0 &&
        !this.fetchingThings &&
        !this.$store.getters['entities/thing/firstLoadFinished'](this.id)
      ) {
        this.$store.dispatch('entities/thing/fetch', null, {
          root: true,
        })
          .catch(() => {
            this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          })
      }

      if (!this.fetchingGroup && !this.fetchingGroups && this.group === null) {
        this.$nuxt.error({ statusCode: 404, message: 'Group Not Found' })

        return
      }

      if (this.group) {
        this._configureNavigation()
      }
    },

    mounted() {
      this._checkRoute()

      this._setBlocksHeight('detail')

      window.addEventListener('scroll', this._windowScrolledHandler)
      window.addEventListener('resize', this._windowResizeHandler)
    },

    beforeDestroy() {
      window.removeEventListener('scroll', this._windowScrolledHandler)
      window.removeEventListener('resize', this._windowResizeHandler)
    },

    methods: {

      /**
       * Group was removed, navigate to groups list
       */
      groupRemoved() {
        this.$router.push(this.localePath(this.$routes.groups.list))
      },

      /**
       * Open thing settings part
       */
      _openSettings() {
        this.$set(this, 'settings', true)

        this.$nextTick(() => {
          if (this._.get(this.$refs, 'settings')) {
            const component = this._.get(this.$refs, 'settings')

            this._setBlocksHeight('settings', 'height')

            // Scroll view to setting part
            this.$scrollTo(component.$el, 500, {
              offset: (-1 * this.$store.state.theme.marginTop),
            })
          }
        })
      },

      /**
       * Close thing settings part
       */
      _closeSettings() {
        if (this._.get(this.$refs, 'detail')) {
          const component = this._.get(this.$refs, 'detail')

          this.$scrollTo(component.$el, 500, {
            offset: (-1 * this.$store.state.theme.marginTop),
            onDone: () => {
              this.$set(this, 'settings', false)
              this._configureNavigationRightButton()
            },
          })
        }
      },

      /**
       * Check route and if is needed open detail window
       *
       * @private
       */
      _checkRoute() {
        if (this.$route.hash !== '') {
          if (this.$route.hash.indexOf(GROUPS_HASH_SETTINGS) !== -1) {
            this._openSettings()
          }
        }
      },

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
          link: this.localePath(this.$routes.groups.list),
          icon: 'arrow-left',
        }, {
          root: true,
        })

        this.$store.dispatch('header/hideRightButton', null, {
          root: true,
        })

        this.$store.dispatch('header/setFullRowHeading', null, {
          root: true,
        })

        this.$store.dispatch('header/setHeading', {
          heading: this.group.label,
          subHeading: this.group.comment,
        }, {
          root: true,
        })

        this.$store.dispatch('header/setHeadingIcon', {
          icon: this.$groupIcon(this.group),
        }, {
          root: true,
        })

        this.$store.dispatch('bottomNavigation/resetStore', null, {
          root: true,
        })
      },

      /**
       * Configure page header right navigation button
       *
       * @private
       */
      _configureNavigationRightButton() {
        this.$store.dispatch('header/setLeftButton', {
          name: this.$t('application.buttons.back.title'),
          link: this.localePath(this.$routes.groups.list),
          icon: 'arrow-left',
        }, {
          root: true,
        })

        if (
          this.settings &&
          this._.get(this.$refs, 'settings') &&
          this._.get(this.$refs, 'settings.$el').getBoundingClientRect().top <= (this.$store.state.theme.marginTop + 1)
        ) {
          this.$store.dispatch('header/setRightButton', {
            name: this.$t('application.buttons.close.title'),
            callback: () => {
              this._closeSettings()
            },
          }, {
            root: true,
          })

          this._setOpenedSettingsRoute()
        } else {
          this.$store.dispatch('header/setRightButton', {
            name: this.$t('application.buttons.edit.title'),
            callback: () => {
              this._openSettings()
            },
          }, {
            root: true,
          })

          this._setClosedSettingsRoute()
        }
      },

      /**
       * Update view according to view position
       *
       * @private
       */
      _windowScrolledHandler() {
        this._configureNavigationRightButton()
      },

      /**
       * Update blocks height according to resized window
       *
       * @private
       */
      _windowResizeHandler() {
        this._setBlocksHeight('detail')
        this._setBlocksHeight('settings', 'height')

        if (this.settings && this._.get(this.$refs, 'settings')) {
          const component = this._.get(this.$refs, 'settings')

          this.$scrollTo(component.$el, 1, {
            offset: (-1 * this.$store.state.theme.marginTop),
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

          component.$el.style[attribute] = `${document.querySelector('body').clientHeight}px`
        }
      },

      /**
       * Change route accordingly to view position
       *
       * @private
       */
      _setOpenedSettingsRoute() {
        this.$router.push(this.localePath({
          name: this.$routes.groups.detail,
          params: {
            id: this.id,
          },
          hash: GROUPS_HASH_SETTINGS,
        }))
      },

      /**
       * Change route accordingly to view position
       *
       * @private
       */
      _setClosedSettingsRoute() {
        this.$router.push(this.localePath({
          name: this.$routes.groups.detail,
          params: {
            id: this.id,
          },
        }))
      },

    },

    head() {
      return {
        title: this.$t('meta.groups.detail.title', { group: this.group.label }),
      }
    },

  }
</script>
