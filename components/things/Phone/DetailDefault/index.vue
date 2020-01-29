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
        link: this.localePath(this.$routes.things.list),
        icon: 'arrow-left',
      }, {
        root: true,
      })

      if (this.$route.hash.includes(THINGS_HASH_SETTINGS)) {
        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.close.title'),
          callback: () => {
            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: this.thing.id,
              },
            }))
          },
        }, {
          root: true,
        })
      } else {
        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.edit.title'),
          callback: () => {
            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: this.thing.id,
              },
              hash: THINGS_HASH_SETTINGS,
            }))
          },
        }, {
          root: true,
        })
      }

      this.$store.dispatch('header/setFullRowHeading', null, {
        root: true,
      })

      this.$store.dispatch('header/setHeading', {
        heading: this.$tThing(this.thing),
        subHeading: this.$tThingDevice(this.thing),
      }, {
        root: true,
      })

      this.$store.dispatch('header/setHeadingIcon', {
        icon: this.$thingIcon(this.thing),
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

}
</script>
