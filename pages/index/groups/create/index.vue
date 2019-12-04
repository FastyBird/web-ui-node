<template>
  <div class="fb-iot-groups-group-create-view__container">
    <groups-create-group />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import {
    GROUPS_HASH_CREATE,
  } from '@/configuration/routes'

  import GroupsCreateGroup from '@/components/groups/Create'

  export default {

    name: 'GroupDetailPage',

    components: {
      GroupsCreateGroup,
    },

    transition: 'fade',

    computed: {

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

    },

    watch: {

      windowSize(val) {
        if (val !== 'xs') {
          this.$router.push(this.localePath({
            name: this.$routes.groups.list,
            hash: GROUPS_HASH_CREATE,
          }))
        }
      },

    },

    fetch({ app, store }) {
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
        heading: app.i18n.t('application.headings.groups.add'),
      }, {
        root: true,
      })

      store.dispatch('header/setHeadingIcon', {
        icon: 'folder-plus',
      }, {
        root: true,
      })

      store.dispatch('bottomNavigation/resetStore', null, {
        root: true,
      })

      store.dispatch('bottomNavigation/hideNavigation', null, {
        root: true,
      })
    },

    beforeMount() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(this.localePath({
          name: this.$routes.groups.list,
          hash: GROUPS_HASH_CREATE,
        }))
      }

      this._configureNavigation()
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
          heading: this.$t('application.headings.groups.add'),
        }, {
          root: true,
        })

        this.$store.dispatch('header/setHeadingIcon', {
          icon: 'folder-plus',
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
        title: this.$t('meta.groups.create.title'),
      }
    },

  }
</script>
