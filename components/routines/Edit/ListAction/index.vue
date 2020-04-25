<template>
  <list-item
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
      >{{ $t(`routines.actions.${row.operation}`, { property: $tChannelProperty(thing, row.property).toLowerCase() }) }}</span>
    </template>

    <template slot="detail-large">
      <fb-form-checkbox
        v-model="enabled"
        name="enabled"
      />

      <fb-button
        size="sm"
        variant="link"
        @click="edit"
      >
        {{ $t('application.buttons.edit.title') }}
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

  name: 'RoutinesEditListAction',

  props: {

    action: {
      type: Object,
      required: true,
      validator: (value) => {
        return !(
          !Object.prototype.hasOwnProperty.call(value, 'device') ||
          !Object.prototype.hasOwnProperty.call(value, 'channel') ||
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

  },

  watch: {

    enabled() {
      this.$emit('toggle')
    },

  },

  methods: {

    edit() {
      this.$emit('edit')
    },

  },

}
</script>
