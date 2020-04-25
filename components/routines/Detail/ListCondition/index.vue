<template>
  <list-item v-if="fetchingThings || !thing">
    <template slot="icon">
      <fb-spinner size="sm" />
    </template>

    <template slot="heading">
      {{ $t('routines.texts.loadingThing') }}
    </template>

    <template slot="detail">
      &nbsp;
    </template>
  </list-item>

  <list-item
    v-else-if="thing"
    :show-status="true"
    :status="condition.enabled"
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
        class="fb-routines-condition__condition"
      >{{ $t(`routines.conditions.${row.operator}`, { property: $tChannelProperty(thing, row.property), value: row.operand }) }}</span>
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
import Thing from '~/models/Thing'

export default {

  name: 'RoutinesDetailListCondition',

  props: {

    condition: {
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
     * Condition thing
     *
     * @returns {(Thing|null)}
     */
    thing() {
      const device = Device
        .query()
        .where('identifier', this.condition.device)
        .first()

      if (device === null) {
        return null
      }

      const channel = Channel
        .query()
        .where('device_id', device.id)
        .where('channel', this.condition.channel)
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
     * Mapped properties with values
     *
     * @returns {Array}
     */
    properties() {
      if (this.thing === null) {
        return []
      }

      const mapped = []

      this.condition.rows
        .forEach((row) => {
          const property = ChannelProperty
            .query()
            .where('channel_id', this.thing.channel_id)
            .where('property', row.property)
            .first()

          if (property !== null) {
            mapped.push({
              operand: row.operand,
              operator: row.operator,
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

    'condition.enabled'(val) {
      this.enabled = val
    },

  },

  created() {
    this.enabled = this.condition.enabled
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
