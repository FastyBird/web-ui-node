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

      icon() {
        if (this.channel.isEnergy) {
          return 'odometer'
        } else if (this.channel.isSwitch) {
          return 'plug'
        } else if (this.channel.isLight) {
          return 'lighting'
        } else if (this.channel.isAnalogSensor) {
          return 'generic-analog'
        } else if (this.channel.isBinarySensor) {
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
