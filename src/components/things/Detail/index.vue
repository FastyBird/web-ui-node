<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail__container"
  >
    <fb-loading-box
      v-if="fetchingChannels"
      :text="$t('texts.loading')"
    />

    <things-detail-channels-container-switch-channels
      v-if="switchChannels.length"
      :thing="thing"
      :channels="switchChannels"
    />

    <things-detail-channels-container-analog-sensor-channels
      v-if="analogSensorsChannels.length"
      :thing="thing"
      :channels="analogSensorsChannels"
    />

    <things-detail-channels-container-binary-sensor-channels
      v-if="binarySensorsChannels.length"
      :thing="thing"
      :channels="binarySensorsChannels"
    />

    <things-detail-channels-container-binary-actor-channels
      v-if="binaryActorsChannels.length"
      :thing="thing"
      :channels="binaryActorsChannels"
    />

    <things-detail-channels-container-light-channels
      v-if="lightChannels.length"
      :thing="thing"
      :channels="lightChannels"
    />

    <things-detail-channels-container-energy-channels
      v-if="energyChannels.length"
      :thing="thing"
      :channels="energyChannels"
    />

    <template
      v-if="!fetchingChannels && !switchChannels.length && !analogSensorsChannels.length && !analogActorsChannels.length && !binarySensorsChannels.length && !binaryActorsChannels.length && !lightChannels.length && !energyChannels.length"
    >
      <div class="text-center p-a-lg">
        <span class="icon-with-child">
          <font-awesome-icon
            icon="cube"
            class="icon-5x text-muted m-y-lg"
          />
          <span
            class="bg-primary circle sq-32 icon-2x icon-child m-y-lg"
            style="padding-top: 1px;"
          >
            <font-awesome-icon icon="plug" />
          </span>
        </span>
      </div>

      <p class="text-center m-t-md m-b-lg">
        {{ $t('texts.noChannels') }}
      </p>
    </template>
  </div>
</template>

<script>
  import FbComponentLoading from '@fastybird-com/theme/components/UI/FbComponentLoading'
  import FbComponentLoadingError from '@fastybird-com/theme/components/UI/FbComponentLoadingError'

  const ThingsDetailChannelsContainerAnalogSensorChannels = () => ({
    component: import('./ChannelsContainer/AnalogSensorsChannels'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const ThingsDetailChannelsContainerBinaryActorChannels = () => ({
    component: import('./ChannelsContainer/BinaryActorsChannels'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const ThingsDetailChannelsContainerBinarySensorChannels = () => ({
    component: import('./ChannelsContainer/BinarySensorsChannels'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const ThingsDetailChannelsContainerEnergyChannels = () => ({
    component: import('./ChannelsContainer/EnergyMetersChannels'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const ThingsDetailChannelsContainerLightChannels = () => ({
    component: import('./ChannelsContainer/LightActorsChannels'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })
  const ThingsDetailChannelsContainerSwitchChannels = () => ({
    component: import('./ChannelsContainer/SwitchActorsChannels'),
    loading: FbComponentLoading,
    error: FbComponentLoadingError,
    timeout: 5000,
  })

  import {
    CHANNEL_TYPE_ANALOG_SENSOR,
    CHANNEL_TYPE_ANALOG_ACTOR,
    CHANNEL_TYPE_BINARY_SENSOR,
    CHANNEL_TYPE_BINARY_ACTOR,
    CHANNEL_TYPE_LIGHT,
    CHANNEL_TYPE_ENERGY,
    CHANNEL_TYPE_SWITCH,
  } from '@/constants'

  export default {

    name: 'ThingsDetail',

    components: {
      ThingsDetailChannelsContainerAnalogSensorChannels,
      ThingsDetailChannelsContainerBinaryActorChannels,
      ThingsDetailChannelsContainerBinarySensorChannels,
      ThingsDetailChannelsContainerEnergyChannels,
      ThingsDetailChannelsContainerLightChannels,
      ThingsDetailChannelsContainerSwitchChannels,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channels: {
        type: Array,
        required: true,
      },

    },

    computed: {

      /**
       * Flag signalizing that thing channels are loading from server
       *
       * @returns {Boolean}
       */
      fetchingChannels() {
        if (this.$store.state.entities.channel.semaphore.fetching.items.indexOf(this.thing.id) !== -1) {
          return true
        }

        this.thing.channel_ids.forEach(item => {
          if (this.$store.state.entities.channel.semaphore.fetching.item.indexOf(item.id) !== -1) {
            return true
          }
        })

        return false
      },

      /**
       * Get all analog sensors channels
       *
       * @returns {Array}
       */
      analogSensorsChannels() {
        return this._.filter(this.channels, { 'structure_type': CHANNEL_TYPE_ANALOG_SENSOR })
      },

      /**
       * Get all analog actors channels
       *
       * @returns {Array}
       */
      analogActorsChannels() {
        return this._.filter(this.channels, { 'structure_type': CHANNEL_TYPE_ANALOG_ACTOR })
      },

      /**
       * Get all binary sensors channels
       *
       * @returns {Array}
       */
      binarySensorsChannels() {
        return this._.filter(this.channels, { 'structure_type': CHANNEL_TYPE_BINARY_SENSOR })
      },

      /**
       * Get all binary actors channels
       *
       * @returns {Array}
       */
      binaryActorsChannels() {
        return this._.filter(this.channels, { 'structure_type': CHANNEL_TYPE_BINARY_ACTOR })
      },

      /**
       * Get all light channels
       *
       * @returns {Array}
       */
      lightChannels() {
        return this._.filter(this.channels, { 'structure_type': CHANNEL_TYPE_LIGHT })
      },

      /**
       * Get all energy meter channels
       *
       * @returns {Array}
       */
      energyChannels() {
        return this._.filter(this.channels, { 'structure_type': CHANNEL_TYPE_ENERGY })
      },

      /**
       * Get all relay switch channels
       *
       * @returns {Array}
       */
      switchChannels() {
        return this._.filter(this.channels, { 'structure_type': CHANNEL_TYPE_SWITCH })
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import './index.scss';
</style>

<i18n src="./locales.json" />
