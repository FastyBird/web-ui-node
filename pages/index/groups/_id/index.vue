<template>
  <div class="fb-groups-group-detail-view__container">
    <fb-ui-loading-box
      v-if="fetchingGroup && group === null"
      :text="$t('groups.texts.loadingGroup')"
    />

    <template v-else>
      <group-detail
        ref="detail"
        :group="group"
        :things="[]"
      />

      <group-settings
        v-if="settings"
        ref="settings"
        v-body-scroll-lock="true"
        :group="group"
        class="fb-groups-group-detail-view__container-settings"
        @removed="groupRemoved"
      />
    </template>
  </div>
</template>

<script>
import { orderBy } from 'natural-orderby'

import get from 'lodash/get'

import {
  GROUPS_HASH_DETAIL,
  GROUPS_HASH_SETTINGS,
} from '~/configuration/routes'

import Group from '~/models/ui-node/Group'

import GroupDetail from '~/components/groups/Detail'
import GroupSettings from '~/components/groups/Settings'

const viewSettings = {
  opened: 'detail', // Detail is by default
  items: {
    detail: {
      name: 'detail',
      route: {
        hash: GROUPS_HASH_DETAIL,
      },
    },
    settings: {
      name: 'settings',
      route: {
        hash: GROUPS_HASH_SETTINGS,
      },
    },
  },
}

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
      view: Object.assign({}, viewSettings),
    }
  },

  computed: {

    /**
     * @returns {String}
     */
    windowSize() {
      return this.$store.state.app.windowSize
    },

    /**
     * View group data
     *
     * @returns {Group}
     */
    group() {
      return Group.find(this.id)
    },

    /**
     * Flag signalizing that groups are loading from server
     *
     * @returns {Boolean}
     */
    fetchingGroups() {
      return Group.getters('fetching')()
    },

    /**
     * Flag signalizing that group is loading from server
     *
     * @returns {Boolean}
     */
    fetchingGroup() {
      return Group.getters('getting')(this.id)
    },

  },

  watch: {

    group(val) {
      if (val) {
        this._configureNavigation()
      }
    },

    windowSize(val) {
      if (val !== 'xs') {
        if (this.$route.hash !== '') {
          if (this.$route.hash.includes(GROUPS_HASH_SETTINGS)) {
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
        }
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
          const group = Group.find(params.id)

          if (group) {
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
              heading: group.name,
              subHeading: group.comment,
            }, {
              root: true,
            })

            store.dispatch('template/setHeadingIcon', {
              icon: app.$groupIcon(group),
            }, {
              root: true,
            })

            store.dispatch('app/bottomMenuCollapse', null, {
              root: true,
            })
          } else {
            error({ statusCode: 404, message: 'Group Not Found' })
          }
        })
        .catch((e) => {
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
        hash: `${GROUPS_HASH_SETTINGS}-${this.id}`,
      }))

      return
    }

    if (
      Group.query().count() === 0 &&
      !this.fetchingGroups &&
      !this.fetchingGroup &&
      !Group.getters('firstLoadFinished')()
    ) {
      Group.dispatch('get', {
        id: this.id,
      })
        .catch((e) => {
          if (this._.get(e, 'exception.response.status', 0) === 404) {
            this.$nuxt.error({ statusCode: 404, message: 'Group Not Found' })
          } else {
            this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          }
        })
    }

    if (!this.fetchingGroup && !this.fetchingGroups && this.group === null) {
      this.$nuxt.error({ statusCode: 404, message: 'Group Not Found' })
    }

    if (this.group) {
      this._configureNavigation()
    }
  },

  mounted() {
    this.$nextTick(() => {
      this._setBlocksHeight('detail')

      this._checkRoute()
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
                      name: this.$routes.groups.detail,
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
                    name: this.$routes.groups.detail,
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
                name: this.$routes.groups.detail,
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

      this.$router.push(this.localePath({ name: this.$routes.groups.list }))
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
        heading: this.group.name,
        subHeading: this.group.comment,
      }, {
        root: true,
      })

      this.$store.dispatch('template/setHeadingIcon', {
        icon: this.$groupIcon(this.group),
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

  },

  validate({ app, params }) {
    return app.$validateUUID(params.id)
  },

  head() {
    return {
      title: this.$t('meta.groups.detail.title', { group: this.group.name }),
    }
  },

}
</script>
