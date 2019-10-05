<template>
  <div class="fb-triggers-detail-view__container">
    <fb-loading-box
      v-if="fetchingTrigger && trigger === null"
      :text="$t('texts.loading')"
    />

    <triggers-detail
      v-if="trigger !== null"
      :trigger="trigger"
      @removed="triggerRemoved"
    />
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    TRIGGERS_LIST_LINK,

    TRIGGERS_HASH_DETAIL,
  } from '@/configuration/routes'

  import TriggersDetail from '@/components/triggers/Detail'

  export default {

    name: 'TriggerDetailPage',

    components: {
      TriggersDetail,
    },

    transition: 'fade',

    data() {
      return {
        id: this.$route.params.id,
      }
    },

    computed: {

      ...mapState({
        route: state => state.route,
      }),

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

      trigger() {
        return this.$store.getters['entities/trigger/query']()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .where('id', this.id)
          .first()
      },

      /**
       * Flag signalizing that triggers are loading from server
       *
       * @returns {Boolean}
       */
      fetchingTriggers() {
        return this.$store.getters['entities/trigger/fetching']()
      },

      /**
       * Flag signalizing that trigger is loading from server
       *
       * @returns {Boolean}
       */
      fetchingTrigger() {
        return this.$store.getters['entities/trigger/getting'](this.id)
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(`${this.localePath({ name: TRIGGERS_LIST_LINK })}${TRIGGERS_HASH_DETAIL}${this.id}`)
        }
      },

      fetchingTrigger(val) {
        if (!val) {
          if (this.trigger === null) {
            this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

            return
          }

          this._configureHeader()
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
            const trigger = store.getters['entities/trigger/find'](params.id)

            store.dispatch('header/resetStore', null, {
              root: true,
            })

            store.dispatch('header/setLeftButton', {
              name: app.i18n.t('application.buttons.back.title'),
              link: app.localePath({ name: TRIGGERS_LIST_LINK }),
              icon: 'angle-left',
            }, {
              root: true,
            })

            store.dispatch('header/setHeading', {
              heading: trigger.name,
              subHeading: trigger.comment,
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
        this.$router.push(`${this.localePath({ name: TRIGGERS_LIST_LINK })}${TRIGGERS_HASH_DETAIL}${this.id}`)

        return
      }

      if (
        this.$store.getters['entities/trigger/query']().count() === 0 &&
        !this.fetchingTriggers &&
        !this.fetchingTrigger &&
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

      if (!this.fetchingTrigger && this.trigger === null) {
        this.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })

        return
      }

      if (this.trigger) {
        this._configureHeader()
      }
    },

    methods: {

      ...mapActions('header', [
        'setLeftButton',
        'setHeading',
        'resetStore',
      ]),

      /**
       * Trigger was removed, navigate to triggers list
       */
      triggerRemoved() {
        this.$router.push(this.localePath({ name: TRIGGERS_LIST_LINK }))
      },

      /**
       * Configure page header for small devices
       *
       * @private
       */
      _configureHeader() {
        this.resetStore()

        this.setLeftButton({
          name: this.$t('application.buttons.back.title'),
          link: this.localePath({ name: TRIGGERS_LIST_LINK }),
          icon: 'angle-left',
        })

        this.setHeading({
          heading: this.trigger.name,
          subHeading: this.trigger.comment,
        })
      },

    },

    head() {
      return {
        title: this.$t('meta.title', { trigger: this._.get(this.trigger, 'name') }),
      }
    },

  }
</script>

<i18n src="./locales.json" />
