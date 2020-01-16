<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-default__container"
  >
    <list-items-container
      v-if="analogSensorsProperties.length"
      :heading="$tc('things.headings.analogSensors', analogSensorsProperties.length)"
    >
      <analog-sensor
        v-for="property in analogSensorsProperties"
        :key="property.id"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <list-items-container
      v-if="binarySensorsProperties.length"
      :heading="$tc('things.headings.binarySensors', binarySensorsProperties.length)"
    >
      <binary-sensor
        v-for="property in binarySensorsProperties"
        :key="property.id"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <list-items-container
      v-if="binaryActorsProperties.length"
      :heading="$tc('things.headings.binaryActors', binaryActorsProperties.length)"
    >
      <binary-actor
        v-for="property in binaryActorsProperties"
        :key="property.id"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <list-items-container
      v-if="energyProperties.length"
      :heading="$tc('things.headings.energy', energyProperties.length)"
    >
      <energy-meter
        v-for="property in energyProperties"
        :key="property.id"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <list-items-container
      v-if="environmentProperties.length"
      :heading="$tc('things.headings.environment', environmentProperties.length)"
    >
      <environment-meter
        v-for="property in environmentProperties"
        :key="property.id"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <list-items-container
      v-if="switchProperties.length"
      :heading="$tc('things.headings.switches', switchProperties.length)"
    >
      <switch-actor
        v-for="property in switchProperties"
        :key="property.id"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <no-results
      v-if="!switchProperties.length && !analogSensorsProperties.length && !analogActorsProperties.length && !binarySensorsProperties.length && !binaryActorsProperties.length && !lightProperties.length && !energyProperties.length && !environmentProperties.length"
      :message="$t('things.texts.noProperties')"
      icon="cube"
      second-icon="plug"
    />
  </div>
</template>

<script>
import AnalogSensor from './../../Property/AnalogSensor'
import BinaryActor from './../../Property/BinaryActor'
import BinarySensor from './../../Property/BinarySensor'
import EnergyMeter from './../../Property/EnergyMeter'
import EnvironmentMeter from './../../Property/EnvironmentMeter'
import SwitchActor from './../../Property/SwitchActor'

export default {

  name: 'ThingsDetailDefault',

  components: {
    AnalogSensor,
    BinaryActor,
    BinarySensor,
    EnergyMeter,
    EnvironmentMeter,
    SwitchActor,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  computed: {

    /**
     * Get all analog sensors properties
     *
     * @returns {Array}
     */
    analogSensorsProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isAnalogSensor')
    },

    /**
     * Get all analog actors properties
     *
     * @returns {Array}
     */
    analogActorsProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isAnalogActor')
    },

    /**
     * Get all binary sensors properties
     *
     * @returns {Array}
     */
    binarySensorsProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isBinarySensor')
    },

    /**
     * Get all binary actors properties
     *
     * @returns {Array}
     */
    binaryActorsProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isBinaryActor')
    },

    /**
     * Get all light properties
     *
     * @returns {Array}
     */
    lightProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isLight')
    },

    /**
     * Get all energy meter properties
     *
     * @returns {Array}
     */
    energyProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnergy')
    },

    /**
     * Get all energy meter properties
     *
     * @returns {Array}
     */
    environmentProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnvironment')
    },

    /**
     * Get all relay switch properties
     *
     * @returns {Array}
     */
    switchProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isSwitch')
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
