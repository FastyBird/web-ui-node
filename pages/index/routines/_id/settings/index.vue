<template>
  <div class="fb-routines-routine-settings-view__container">
    <fb-loading-box
      v-if="fetchingRoutine && routine === null"
      :text="$t('texts.loading')"
    />

    <routines-settings-routine
      v-if="routine !== null"
      :routine="routine"
      @removed="routineRemoved"
    />
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    ROUTINES_LIST_LINK,
    ROUTINES_ROUTINE_DETAIL_LINK,

    ROUTINES_HASH_SETTINGS,
  } from '@/configuration/routes'

  import FbComponentLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@/node_modules/@fastybird-com/theme/components/UI/FbComponentLoadingError'

  const RoutinesSettingsRoutine = () => ({
    component: import('@/components/routines/Settings'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  export default {

    name: 'RoutineSettingsPage',

    components: {
      RoutinesSettingsRoutine,
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
       * View routine data
       *
       * @returns {Routine}
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
          this.$router.push(`${this.localePath({ name: ROUTINES_LIST_LINK })}${ROUTINES_HASH_SETTINGS}${this.id}`)
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
              link: app.localePath({ name: ROUTINES_ROUTINE_DETAIL_LINK, params: { id: routine.id } }),
              icon: 'arrow-left',
            }, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: routine.label,
              subHeading: routine.comment,
            }, {
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
        this.$router.push(`${this.localePath({ name: ROUTINES_LIST_LINK })}${ROUTINES_HASH_SETTINGS}${this.id}`)

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

      if (!this.fetchingRoutine && !this.fetchingRoutines && this.routine === null) {
        this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

        return
      }

      if (this.routine) {
        this._configureNavigation()
      }
    },

    methods: {

      ...mapActions('header', [
        'setLeftButton',
        'setHeading',
        'resetStore',
      ]),

      /**
       * Routine was removed, navigate to routine list
       */
      routineRemoved() {
        // TODO: finish routine remove process
      },

      /**
       * Configure page header for small devices
       *
       * @private
       */
      _configureNavigation() {
        this.resetStore()

        this.setLeftButton({
          name: this.$t('application.buttons.back.title'),
          link: this.localePath({ name: ROUTINES_ROUTINE_DETAIL_LINK, params: { id: this.routine.id } }),
          icon: 'arrow-left',
        })

        this.setHeading({
          heading: this.routine.name,
          subHeading: this.routine.comment,
        })
      },

    },

    head() {
      return {
        title: this.$t('meta.title', { routine: this.routine.label }),
      }
    },

  }
</script>

<i18n src="./locales.json" />
