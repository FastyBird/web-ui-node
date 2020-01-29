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
const AnalogSensor = () => import('./../../Property/AnalogSensor')
const BinaryActor = () => import('./../../Property/BinaryActor')
const BinarySensor = () => import('./../../Property/BinarySensor')
const EnergyMeter = () => import('./../../Property/EnergyMeter')
const EnvironmentMeter = () => import('./../../Property/EnvironmentMeter')
const SwitchActor = () => import('./../../Property/SwitchActor')

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

  data() {
    return {
      analogSensorsProperties: [],
      analogActorsProperties: [],
      binarySensorsProperties: [],
      binaryActorsProperties: [],
      lightProperties: [],
      energyProperties: [],
      environmentProperties: [],
      switchProperties: [],
    }
  },

  created() {
    this.analogSensorsProperties = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isAnalogSensor')
    this.analogActorsProperties = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isAnalogActor')
    this.binarySensorsProperties = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isBinarySensor')
    this.binaryActorsProperties = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isBinaryActor')
    this.lightProperties = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isLight')
    this.energyProperties = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnergy')
    this.environmentProperties = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnvironment')
    this.switchProperties = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isSwitch')
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
