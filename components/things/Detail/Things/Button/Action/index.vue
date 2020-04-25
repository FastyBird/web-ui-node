<template>
  <content-loading
    v-if="fetchingThings || !thing"
    :height="53"
    class="fb-iot-things-trigger-action__preloading"
  >
    <circle
      cx="25"
      cy="50%"
      r="20"
    />
    <rect
      x="75"
      y="10"
      rx="4"
      ry="4"
      width="100"
      height="15"
    />
    <rect
      x="75"
      y="35"
      rx="4"
      ry="4"
      width="50"
      height="10"
    />
    <rect
      x="320"
      y="20"
      rx="4"
      ry="4"
      width="50"
      height="10"
    />
  </content-loading>

  <list-item
    v-else-if="thing"
    :show-status="true"
    :status="enabled"
  >
    <template slot="icon">
      <font-awesome-icon :icon="$thingIcon(thing)" />
    </template>

    <template slot="heading">
      {{ $tThingChannel(thing) }}
    </template>

    <template slot="sub-heading">
      <span
        v-for="(row, index) in properties"
        :key="index"
        class="fb-iot-things-trigger-action__action"
      >{{ $t(`things.vendors.${hardware.manufacturer}.actions.${row.operation}`, { property: $tChannelProperty(thing, row.property).toLowerCase() }) }}</span>
    </template>

    <template slot="detail-large">
      <fb-form-checkbox
        v-model="enabled"
        name="enabled"
      />

      <fb-button
        size="sm"
        variant="link"
        @click="remove"
      >
        {{ $t('application.buttons.remove.title') }}
      </fb-button>
    </template>
  </list-item>
</template>

<script>
import Hardware from '~/models/devices-node/Hardware'
import Device from '~/models/devices-node/Device'
import Channel from '~/models/devices-node/Channel'
import ChannelProperty from '~/models/devices-node/ChannelProperty'
import Thing from '~/models/Thing'

export default {

  name: 'ThingsDetailButtonTriggerAction',

  props: {

    action: {
      type: Object,
      required: true,
      validator: (value) => {
        return !(
          !Object.prototype.hasOwnProperty.call(value, 'channel') ||
          !Object.prototype.hasOwnProperty.call(value, 'device') ||
          !Object.prototype.hasOwnProperty.call(value, 'enabled') ||
          !Object.prototype.hasOwnProperty.call(value, 'rows') ||
          !Array.isArray(value.rows) ||
          !value.rows.length
        )
      },
    },

  },

  data() {
    return {
      enabled: true,
    }
  },

  computed: {

    /**
     * Action thing
     *
     * @returns {(Thing|null)}
     */
    thing() {
      const device = Device
        .query()
        .where('identifier', this.action.device)
        .first()

      if (device === null) {
        return null
      }

      const channel = Channel
        .query()
        .where('device_id', device.id)
        .where('channel', this.action.channel)
        .first()

      if (channel === null) {
        return null
      }

      return Thing
        .query()
        .with('device')
        .with('channel')
        .where('channel_id', channel.id)
        .first()
    },

    /**
     * Get thing hardware info
     *
     * @returns {(Hardware|null)}
     */
    hardware() {
      if (this.thing === null) {
        return null
      }

      return Hardware
        .query()
        .where('device_id', this.thing.device_id)
        .first()
    },

    /**
     * Mapped properties with values
     *
     * @returns {Array}
     */
    properties() {
      if (this.thing === null) {
        return []
      }

      const mapped = []

      this.action.rows
        .forEach((row) => {
          const property = ChannelProperty
            .query()
            .where('channel_id', this.thing.channel_id)
            .where('property', row.property)
            .first()

          if (property !== null) {
            mapped.push({
              operation: row.operation,
              property,
            })
          }
        })

      return mapped
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

  watch: {

    enabled() {
      this.$emit('toggle')
    },

  },

  created() {
    this.enabled = this.action.enabled
  },

  methods: {

    remove() {
      this.$emit('remove')
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
