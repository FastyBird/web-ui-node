<template>
  <layout name="LayoutDefault">
    <template v-if="!$store.state.entities.trigger.semaphore.fetching.items">
      <triggers-detail
        v-if="trigger !== null"
        :trigger="trigger"
        @removed="triggerRemoved"
      />
    </template>

    <fb-loading-box
      v-if="$store.state.entities.trigger.semaphore.fetching.items"
      :text="$t('texts.loading')"
    />
  </layout>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import {
    TRIGGERS_LIST_LINK,

    TRIGGERS_HASH_DETAIL,

    ERR_404_LINK,
  } from '@/router'

  const TriggersDetail = () => import('@/components/triggers/Detail')

  import Trigger from '@/plugins/io-server/store/modules/triggers/Trigger'

  export default {

    name: 'TriggerDetailView',

    components: {
      TriggersDetail,
    },

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
        return Trigger
          .query()
          .with('actions')
          .with('conditions')
          .with('notifications')
          .where('id', this.id)
          .first()
      },

      /**
       * Flag signalizing that thing is loading from server
       *
       * @returns {Boolean}
       */
      fetchingTrigger() {
        return this.$store.state.entities.trigger.semaphore.fetching.items
          || this.$store.state.entities.trigger.semaphore.fetching.item.indexOf(this.id) !== -1
      },

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(`${TRIGGERS_LIST_LINK}${TRIGGERS_HASH_DETAIL}${this.id}`)
        }
      },

      fetchingTrigger(val) {
        if (!val) {
          if (this.trigger === null) {
            this.$router.replace(ERR_404_LINK)

            return
          }

          this._configureHeader()
        }
      },

    },

    created() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(`${TRIGGERS_LIST_LINK}${TRIGGERS_HASH_DETAIL}${this.id}`)

        return
      }

      if (Trigger.query().count() === 0) {
        if (!this.fetchingThing) {
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
      }

      if (!this.fetchingTrigger && this.trigger === null) {
        this.$router.replace(ERR_404_LINK)

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
        this.$router.push(TRIGGERS_LIST_LINK)
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
          link: TRIGGERS_LIST_LINK,
          icon: 'angle-left',
        })

        this.setHeading({
          heading: this.trigger.name,
          subHeading: this.trigger.comment,
        })
      },

    },

    metaInfo() {
      return {
        title: this.$t('meta.title', { trigger: this._.get(this.trigger, 'name') }),
      }
    },

  }
</script>

<i18n src="./locales.json" />
