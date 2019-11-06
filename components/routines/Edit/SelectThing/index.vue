<template>
  <fb-loading-box
    v-if="fetchingThings && things.length === 0"
    :text="$t('texts.loading')"
  />

  <div
    v-else-if="!fetchingThings && things.length === 0"
    class="p-x-md"
  >
    <div class="row">
      <div class="col-8 offset-2 col-sm-6 offset-sm-3 col-md-4 offset-md-4 col-xl-2 offset-xl-5 p-t-lg">
        <div class="text-center p-a-lg">
          <span class="icon-with-child">
            <font-awesome-icon
              icon="plug"
              class="icon-5x text-muted m-y-lg"
            />
            <span
              class="bg-primary circle sq-32 icon-2x icon-child m-y-lg"
              style="padding-top: 1px;"
            >
              <font-awesome-icon icon="plus" />
            </span>
          </span>
        </div>

        <p class="text-center m-b-lg">
          {{ $t('texts.noThings') }}
        </p>
      </div>
    </div>
  </div>

  <div
    v-else
    class="fb-routines-select-thing__container p-t-sm"
  >
    <layout-list-item
      v-for="thing in things"
      :key="thing.id"
      :data-state="isThingSelected(thing) ? 'on' : 'off'"
      @click="select(thing)"
    >
      <template slot="icon">
        <font-awesome-icon :icon="$thingIcon(thing)" />
      </template>

      <template slot="heading">
        {{ thing.label }}
      </template>

      <template
        v-if="thing.hasComment"
        slot="sub-heading"
      >
        {{ thing.comment }}
      </template>

      <template slot="detail">
        <font-awesome-icon
          v-if="isThingSelected(thing)"
          icon="check"
          class="text-primary m-r-md"
        />

        <font-awesome-icon
          icon="chevron-right"
          role="button"
        />
      </template>
    </layout-list-item>
  </div>
</template>

<script>
  import LayoutListItem from '@/components/layout/ListItem'

  export default {

    name: 'RoutinesEditSelectThing',

    components: {
      LayoutListItem,
    },

    props: {

      items: {
        type: Array,
        default: () => {
          return []
        },
        validator: (value) => {
          value.forEach(item => {
            if (
              !item.hasOwnProperty('enabled') ||
              !item.hasOwnProperty('thing') ||
              !item.hasOwnProperty('properties') ||
              !Array.isArray(item.rows) ||
              !item.properties.length
            ) {
              return false
            }
          })

          return true
        },
      },

      onlySettable: {
        type: Boolean,
        default: false,
      },

    },

    computed: {

      /**
       * Find all registered things with channels with settable properties
       *
       * @returns {Array}
       */
      things() {
        const items = []

        const things = this.$store.getters['entities/thing/query']()
          .orderBy('label')
          .all()

        for (const thing of things) {
          const query = this.$store.getters['entities/channel/query']()
            .with('properties')
            .where('thing_id', thing.id)

          if (this.onlySettable) {
            query
              .whereHas('properties', (subQuery) => {
                subQuery.where('is_settable', true)
              })
          }

          const channels = query.all()

          if (channels.length) {
            items.push(thing)
          }
        }

        return items
      },

      /**
       * Flag signalizing that things are loading from server
       *
       * @returns {Boolean}
       */
      fetchingThings() {
        return this.$store.getters['entities/thing/fetching']()
      },

    },

    beforeMount() {
      if (
        this.$store.getters['entities/thing/query']().count() === 0 &&
        !this.fetchingThings &&
        !this.$store.getters['entities/thing/firstLoadFinished']()
      ) {
        this.$store.dispatch('entities/thing/fetch', {}, {
          root: true,
        })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }
    },

    created() {
      this.$store.dispatch('header/resetStore', null, {
        root: true,
      })

      this.$store.dispatch('header/setLeftButton', {
        name: this.$t('application.buttons.back.title'),
        callback: () => {
          this.close()
        },
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
        heading: this.$t('headings.selectThing'),
      }, {
        root: true,
      })

      this.$store.dispatch('header/setHeadingIcon', {
        icon: 'project-diagram',
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

    mounted() {
      this.$emit('loaded')
    },

    methods: {

      /**
       * Close select thing window
       *
       * @param {Object} event
       */
      close(event) {
        event && event.preventDefault()

        this.$emit('close')
      },

      /**
       * Thing selected
       *
       * @param {Thing} thing
       */
      select(thing) {
        this.$emit('select', thing)
      },

      /**
       * Check if thing is already in list
       *
       * @param {Thing} thing
       */
      isThingSelected(thing) {
        return typeof this.items.find(item => {
          return item.thing === thing.id
        }) !== 'undefined'
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>

<i18n src="./locales.json" />
