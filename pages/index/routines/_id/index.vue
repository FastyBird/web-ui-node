<template>
  <div class="fb-routines-detail-view__container">
    <fb-loading-box
      v-if="fetchingRoutine && routine === null"
      :text="$t('texts.loading')"
    />

    <template v-if="routine !== null">
      <div class="fb-routines-detail-view__navigation">
        <fb-button
          variant="outline-primary"
          uppercase
          pill
          class="fb-routines-detail-view__add-button"
          @click="openAdd"
        >
          <font-awesome-icon icon="plus" />
        </fb-button>
      </div>

      <routines-detail
        :routine="routine"
        @removed="routineRemoved"
      />
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import {
    ROUTINES_LIST_LINK,

    ROUTINES_HASH_DETAIL,
  } from '@/configuration/routes'

  import RoutinesDetail from '@/components/routines/Detail'

  export default {

    name: 'RoutineDetailPage',

    components: {
      RoutinesDetail,
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

      routine() {
        return this.$store.getters['entities/trigger/query']()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .where('id', this.id)
          .first()
      },

      /**
       * Flag signalizing that routines are loading from server
       *
       * @returns {Boolean}
       */
      fetchingRoutines() {
        return this.$store.getters['entities/trigger/fetching']()
      },

      /**
       * Flag signalizing that routine is loading from server
       *
       * @returns {Boolean}
       */
      fetchingRoutine() {
        return this.$store.getters['entities/trigger/getting'](this.id)
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(`${this.localePath({ name: ROUTINES_LIST_LINK })}${ROUTINES_HASH_DETAIL}${this.id}`)
        }
      },

      fetchingRoutine(val) {
        if (!val) {
          if (this.routine === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

            return
          }

          this._configureNavigation()
        }
      },

    },

    fetch({ app, store, params, error }) {
      if (store.getters['entities/trigger/query']().count() === 0) {
        return store.dispatch('entities/trigger/get', {
          id: params.id,
        }, {
          root: true,
        })
          .then(() => {
            const routine = store.getters['entities/trigger/find'](params.id)

            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/setLeftButton', {
              name: app.i18n.t('application.buttons.back.title'),
              link: app.localePath({ name: ROUTINES_LIST_LINK }),
              icon: 'arrow-left',
            }, {
              root: true,
            })

            store.dispatch('header/setRightButton', {
              name: app.i18n.t('application.buttons.settings.title'),
              link: app.localePath({ name: ROUTINES_LIST_LINK }),
              icon: 'cogs',
            }, {
              root: true,
            })

            store.dispatch('header/setFullRowHeading', null, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: routine.name,
              subHeading: 'Automatic routine',
            }, {
              root: true,
            })

            store.dispatch('header/setHeadingIcon', {
              icon: app.$routineIcon(routine),
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
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)

            error({ statusCode: 404, message: 'Page Not Found' })
          })
      }
    },

    beforeMount() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(`${this.localePath({ name: ROUTINES_LIST_LINK })}${ROUTINES_HASH_DETAIL}${this.id}`)

        return
      }

      if (
        this.$store.getters['entities/trigger/query']().count() === 0 &&
        !this.fetchingRoutines &&
        !this.fetchingRoutine &&
        !this.$store.getters['entities/trigger/firstLoadFinished']()
      ) {
        this.$store.dispatch('entities/trigger/get', {
          id: this.id,
        }, {
          root: true,
        })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }

      if (!this.fetchingRoutine && this.routine === null) {
        this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

        return
      }

      if (this.routine) {
        this._configureNavigation()
      }
    },

    methods: {

      /**
       * Routine was removed, navigate to routines list
       */
      routineRemoved() {
        this.$router.push(this.localePath({ name: ROUTINES_LIST_LINK }))
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
          link: this.localePath({ name: ROUTINES_LIST_LINK }),
          icon: 'arrow-left',
        }, {
          root: true,
        })

        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.settings.title'),
          link: this.localePath({ name: ROUTINES_LIST_LINK }),
          icon: 'cogs',
        }, {
          root: true,
        })

        this.$store.dispatch('header/setFullRowHeading', null, {
          root: true,
        })

        this.$store.dispatch('header/setHeading', {
          heading: this.routine.name,
          subHeading: 'Automatic routine',
        }, {
          root: true,
        })

        this.$store.dispatch('header/setHeadingIcon', {
          icon: this.$routineIcon(this.routine),
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
        title: this.$t('meta.title', { routine: this._.get(this.routine, 'name') }),
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>

<i18n src="./locales.json" />
