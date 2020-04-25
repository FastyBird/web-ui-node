<template>
  <default-thing :thing="thing" />
</template>

<script>
import {
  THINGS_HASH_SETTINGS,
} from '@/configuration/routes'

import DefaultThing from '@/components/things/Detail/Things/Default'

export default {

  name: 'ThingsPhoneDetailDefault',

  components: {
    DefaultThing,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  watch: {

    '$route'() {
      this._configureNavigation()
    },

  },

  created() {
    this._configureNavigation()
  },

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked')
    this.$bus.$off('heading_right_button-clicked')
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

      if (this.$route.hash.includes(THINGS_HASH_SETTINGS)) {
        this.$store.dispatch('template/setRightButton', {
          name: this.$t('application.buttons.close.title'),
        }, {
          root: true,
        })
      } else {
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
        heading: this.$tThingChannel(this.thing),
        subHeading: this.$tThingDevice(this.thing),
      }, {
        root: true,
      })

      this.$store.dispatch('template/setHeadingIcon', {
        icon: this.$thingIcon(this.thing),
      }, {
        root: true,
      })

      this.$store.dispatch('app/bottomMenuCollapse', null, {
        root: true,
      })

      this.$bus.$on('heading_left_button-clicked', () => {
        this.$router.push(this.localePath(this.$routes.things.list))
      })

      this.$bus.$on('heading_right_button-clicked', () => {
        if (this.$route.hash.includes(THINGS_HASH_SETTINGS)) {
          this.$router.push(this.localePath({
            name: this.$routes.things.detail,
            params: {
              id: this.thing.id,
            },
          }))
        } else {
          this.$router.push(this.localePath({
            name: this.$routes.things.detail,
            params: {
              id: this.thing.id,
            },
            hash: THINGS_HASH_SETTINGS,
          }))
        }
      })
    },

  },

}
</script>
