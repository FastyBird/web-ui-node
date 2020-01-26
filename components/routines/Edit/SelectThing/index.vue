<template>
  <fb-loading-box
    v-if="fetchingThings && things.length === 0"
    :text="$t('routines.texts.loadingThings')"
  />

  <no-results
    v-else-if="!fetchingThings && things.length === 0"
    :message="$t('routines.texts.noThings')"
    icon="plug"
    second-icon="exclamation-triangle"
  />

  <div
    v-else
    class="fb-routines-select-thing__container"
  >
    <list-item
      v-for="thing in things"
      :key="thing.id"
      :data-state="isSelected(thing) ? 'on' : 'off'"
      @click="$emit('select', thing)"
    >
      <template slot="icon">
        <font-awesome-icon :icon="$thingIcon(thing)" />
      </template>

      <template slot="heading">
        {{ $tThing(thing) }}
      </template>

      <template slot="sub-heading">
        {{ $tThingDevice(thing) }}
      </template>

      <template slot="detail">
        <font-awesome-icon
          v-if="isSelected(thing)"
          icon="check-circle"
        />

        <font-awesome-icon
          icon="chevron-right"
          role="button"
        />
      </template>
    </list-item>
  </div>
</template>

<script>
import { orderBy } from 'natural-orderby'

export default {

  name: 'RoutinesEditSelectThing',

  props: {

    items: {
      type: Array,
      default: () => {
        return []
      },
      validator: (value) => {
        value.forEach((item) => {
          if (!Object.prototype.hasOwnProperty.call(item, 'thing')) {
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

    typeThing: {
      type: Boolean,
      default: false,
    },

    typeSensor: {
      type: Boolean,
      default: false,
    },

  },

  computed: {

    /**
     * Find all registered things with settable properties
     *
     * @returns {Array}
     */
    things() {
      let things = this.$store.getters['entities/thing/query']()
        .with('device')
        .with('channel')
        .with('channel.properties')
        .all()

      if (this.typeThing) {
        things = this._.filter(things, (thing) => {
          const properties = this._.get(thing, 'channel.properties', [])
            .filter((property) => {
              return property.isAnalogActor || property.isBinaryActor || property.isSwitch
            })

          return typeof properties !== 'undefined' && properties.length
        })
      }

      if (this.typeSensor) {
        things = this._.filter(things, (thing) => {
          const properties = this._.get(thing, 'channel.properties', [])
            .filter((property) => {
              return property.isAnalogSensor || property.isBinarySensor || property.isEnergy || property.isEnvironment
            })

          return typeof properties !== 'undefined' && properties.length
        })
      }

      if (this.onlySettable) {
        things = this._.filter(things, (thing) => {
          const properties = this._.get(thing, 'channel.properties', [])
            .filter((property) => {
              return property.is_settable
            })

          return typeof properties !== 'undefined' && properties.length
        })
      }

      return orderBy(
        things,
        [
          v => this.$tThing(v),
          v => this.$tThingDevice(v),
        ],
        ['asc'],
      )
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
        .catch(() => {
          this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        })
    }
  },

  mounted() {
    this.$emit('loaded')
  },

  methods: {

    /**
     * Check if thing is already in list
     *
     * @param {Thing} thing
     */
    isSelected(thing) {
      return typeof this.items.find((item) => {
        return item.thing === thing.id
      }) !== 'undefined'
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
