<template>
  <content-loading
    v-if="fetchingThings || !thing"
    :height="53"
    class="fb-iot-things-detail-button-trigger-action__preloading"
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
    :status="action.enabled"
  >
    <template slot="icon">
      <font-awesome-icon :icon="$thingIcon(thing)" />
    </template>

    <template slot="heading">
      {{ $tThingChannel(thing) }}
    </template>

    <template slot="sub-heading">
      <span class="fb-iot-things-detail-button-trigger-action__action">{{ $t(`things.triggers.${action.value}`, { property: $tChannelProperty(thing, property).toLowerCase() }) }}</span>
    </template>

    <template slot="detail-large">
      <fb-form-checkbox
        v-model="enabled"
        name="enabled"
        @change="toggle"
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
import Device from '~/models/devices-node/Device'
import Channel from '~/models/devices-node/Channel'
import ChannelProperty from '~/models/devices-node/ChannelProperty'
import Thing from '~/models/things/Thing'

export default {

  name: 'ThingsDetailButtonTriggerAction',

  props: {

    action: {
      type: Object,
      required: true,
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
     * Action thing property
     *
     * @returns {(ChannelProperty|null)}
     */
    property() {
      if (this.thing === null) {
        return null
      }

      return ChannelProperty
        .query()
        .where('channel_id', this.thing.channel_id)
        .where('property', this.action.property)
        .first()
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

    'action.enabled'(val) {
      this.enabled = val
    },

  },

  created() {
    this.enabled = this.action.enabled
  },

  methods: {

    toggle() {
      this.$emit('toggle')
    },

    remove() {
      this.$emit('remove')
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
