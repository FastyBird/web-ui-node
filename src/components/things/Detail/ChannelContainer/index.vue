<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-container__container p-x-md p-y m-a-0 row"
  >
    <div class="col-2 p-l-sm fb-iot-things-detail-channel-container__icon">
      <template v-if="slotExists('icon')">
        <slot name="icon" />
      </template>
      <things-channels-icon
        v-else
        :icon="icon"
      />
    </div>
    <div class="col p-l-sm">
      <template v-if="slotExists('name')">
        <slot name="name" />
      </template>
      <template v-else>
        <h5 class="fw-b">
          {{ $tChannel(thing, channel) }}
        </h5>
      </template>
    </div>
    <div
      v-if="slotExists('channel')"
      class="col-3 text-right p-x-0"
    >
      <slot name="channel" />
    </div>
  </div>
</template>

<script>
  const ThingsChannelsIcon = () => import('../../Channels/Icon')

  import {
    CHANNEL_TYPE_ANALOG_SENSOR,
    CHANNEL_TYPE_BINARY_SENSOR,
    CHANNEL_TYPE_ENERGY,
    CHANNEL_TYPE_SWITCH,
    CHANNEL_TYPE_LIGHT,
  } from '@/constants'

  import Hardware from '@/store/modules/io-server/Hardware'

  export default {

    name: 'ThingsDetailChannelContainer',

    components: {
      ThingsChannelsIcon,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

    },

    computed: {

      /**
       * Get thing hardware info
       *
       * @returns {Hardware}
       */
      hardware() {
        return Hardware
          .query()
          .where('thing_id', this.thing.id)
          .first()
      },

      icon() {
        if (this.channel.structure_type === CHANNEL_TYPE_ENERGY) {
          return 'odometer'
        } else if (this.channel.structure_type === CHANNEL_TYPE_SWITCH) {
          return 'plug'
        } else if (this.channel.structure_type === CHANNEL_TYPE_LIGHT) {
          return 'lighting'
        } else if (this.channel.structure_type === CHANNEL_TYPE_ANALOG_SENSOR) {
          return 'generic-analog'
        } else if (this.channel.structure_type === CHANNEL_TYPE_BINARY_SENSOR) {
          return 'generic-digital'
        }

        return 'generic-analog'
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import './index.scss';
</style>
