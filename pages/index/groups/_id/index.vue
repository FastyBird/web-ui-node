<template>
  <div class="fb-iot-groups-group-detail-view__container">
    <fb-loading-box
      v-if="(fetchingGroup && group === null) || fetchingThings"
      :text="$t('texts.loading')"
    />

    <groups-detail-group
      v-if="group !== null && !fetchingThings"
      :group="group"
      :things="things"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import {
    GROUPS_LIST_LINK,

    GROUPS_HASH_DETAIL,
  } from '@/configuration/routes'

  import GroupsDetailGroup from '@/components/groups/Detail'

  export default {

    name: 'GroupDetailPage',

    components: {
      GroupsDetailGroup,
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
        return this.$store.getters['entities/thing/query']()
          .with('properties')
          .where('id', this.group.things_ids)
          .orderBy('name')
          .all()
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
          this.$router.push(`${this.localePath({ name: GROUPS_LIST_LINK })}${GROUPS_HASH_DETAIL}${this.id}`)
        }
      },

      fetchingGroup(val) {
        if (!val) {
          if (this.group === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

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
              link: app.localePath({ name: GROUPS_LIST_LINK }),
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
            // eslint-disable-next-line
            console.log(e)

            error({ statusCode: 404, message: 'Page Not Found' })
          })
      }
    },

    beforeMount() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(`${this.localePath({ name: GROUPS_LIST_LINK })}${GROUPS_HASH_DETAIL}${this.id}`)

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
            // eslint-disable-next-line
            console.log(e)
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
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }

      if (!this.fetchingGroup && !this.fetchingGroups && this.group === null) {
        this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

        return
      }

      if (this.group) {
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
          link: this.localePath({ name: GROUPS_LIST_LINK }),
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

    },

    head() {
      return {
        title: this.$t('meta.title', { group: this.group.label }),
      }
    },

  }
</script>

<i18n src="./locales.json" />
