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
        {{ $tThingChannel(thing) }}
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

import ChannelProperty from '~/models/devices-node/ChannelProperty'
import Thing from '~/models/things/Thing'

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

    typeActor: {
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
      const things = []

      if (this.typeActor) {
        const properties = ChannelProperty
          .query()
          .where('isSettable', true)
          .get()

        properties.forEach((property) => {
          const thing = Thing
            .query()
            .with('device')
            .with('channel')
            .where('channel_id', property.channel_id)
            .first()

          if (thing) {
            things.push(thing)
          }
        })
      }

      if (this.typeSensor) {
        const properties = ChannelProperty
          .query()
          .where('isSettable', false)
          .get()

        properties.forEach((property) => {
          const thing = Thing
            .query()
            .with('device')
            .with('channel')
            .where('channel_id', property.channel_id)
            .first()

          if (thing) {
            things.push(thing)
          }
        })
      }

      return this._.uniqBy(orderBy(
        things,
        [
          v => this.$tThingChannel(v),
          v => this.$tThingDevice(v),
        ],
        ['asc'],
      ), 'id')
    },

    /**
     * Flag signalizing that things are loading from server
     *
     * @returns {Boolean}
     */
    fetchingThings() {
      return Thing.getters('fetching')()
    },

  },

  beforeMount() {
    if (
      Thing.query().count() === 0 &&
      !this.fetchingThings &&
      !Thing.getters('firstLoadFinished')()
    ) {
      Thing.dispatch('fetch')
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
        return item.device === thing.device.identifier && item.channel === thing.channel.channel
      }) !== 'undefined'
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
