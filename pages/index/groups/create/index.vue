<template>
  <div class="fb-iot-groups-group-create-view__container">
    <groups-create-group />
  </div>
</template>

<script>
import {
  GROUPS_HASH_CREATE,
} from '@/configuration/routes'

import GroupsCreateGroup from '@/components/groups/Create'

export default {

  name: 'GroupCreatePage',

  components: {
    GroupsCreateGroup,
  },

  transition: 'fade',

  computed: {

    /**
     * @returns {String}
     */
    windowSize() {
      return this.$store.state.template.windowSize
    },

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
    store.dispatch('template/resetStore', null, {
      root: true,
    })

    store.dispatch('template/setLeftButton', {
      name: app.i18n.t('application.buttons.back.title'),
      icon: 'arrow-left',
    }, {
      root: true,
    })

    store.dispatch('template/setFullRowHeading', null, {
      root: true,
    })

    store.dispatch('template/setHeading', {
      heading: app.i18n.t('application.headings.groups.add'),
    }, {
      root: true,
    })

    store.dispatch('template/setHeadingIcon', {
      icon: 'folder-plus',
    }, {
      root: true,
    })

    store.dispatch('app/bottomMenuCollapse', null, {
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

    this.$bus.$on('heading_left_button-clicked', () => {
      this.$router.push(this.localePath(this.$routes.groups.list))
    })
  },

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked')
  },

  methods: {

    /**
     * Configure page header for small devices
     *
     * @private
     */
    _configureNavigation() {
      this.$store.dispatch('template/resetStore', null, {
        root: true,
      })

      this.$store.dispatch('template/setLeftButton', {
        name: this.$t('application.buttons.back.title'),
        icon: 'arrow-left',
      }, {
        root: true,
      })

      this.$store.dispatch('template/setFullRowHeading', null, {
        root: true,
      })

      this.$store.dispatch('template/setHeading', {
        heading: this.$t('application.headings.groups.add'),
      }, {
        root: true,
      })

      this.$store.dispatch('template/setHeadingIcon', {
        icon: 'folder-plus',
      }, {
        root: true,
      })

      this.$store.dispatch('app/bottomMenuCollapse', null, {
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

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
