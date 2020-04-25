<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-default__container"
  >
    <list-items-container
      v-if="analogSensors.length || binarySensors.length"
      :heading="$tc('things.headings.sensors', (analogSensors.length + binarySensors.length))"
    >
      <analog-sensor
        v-for="property in analogSensors"
        :key="property.id"
        :thing="thing"
        :property="property"
      />

      <binary-sensor
        v-for="property in binarySensors"
        :key="property.id"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <list-items-container
      v-if="binaryActors.length"
      :heading="$tc('things.headings.actors', binaryActors.length)"
    >
      <binary-actor
        v-for="property in binaryActors"
        :key="property.id"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <list-items-container
      v-if="switches.length"
      :heading="$tc('things.headings.switches', switches.length)"
    >
      <switch-actor
        v-for="property in switches"
        :key="property.id"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <no-results
      v-if="!switches.length && !analogSensors.length && !analogActors.length && !binarySensors.length && !binaryActors.length"
      :message="$t('things.texts.noProperties')"
      icon="cube"
      second-icon="plug"
    />
  </div>
</template>

<script>
import ChannelProperty from '~/models/devices-node/ChannelProperty'

const AnalogSensor = () => import('./../../Property/AnalogSensor')
const BinaryActor = () => import('./../../Property/BinaryActor')
const BinarySensor = () => import('./../../Property/BinarySensor')
const SwitchActor = () => import('./../../Property/SwitchActor')

export default {

  name: 'ThingsDetailDefault',

  components: {
    AnalogSensor,
    BinaryActor,
    BinarySensor,
    SwitchActor,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  computed: {

    analogSensors() {
      return ChannelProperty
        .query()
        .where('channel_id', this.thing.channel_id)
        .where('datatype', ['integer', 'float'])
        .where('is_settable', false)
        .get()
    },

    analogActors() {
      return ChannelProperty
        .query()
        .where('channel_id', this.thing.channel_id)
        .where('datatype', ['integer', 'float'])
        .where('is_settable', true)
        .get()
    },

    binarySensors() {
      return ChannelProperty
        .query()
        .where('channel_id', this.thing.channel_id)
        .where('datatype', 'boolean')
        .where('is_settable', false)
        .get()
    },

    binaryActors() {
      return ChannelProperty
        .query()
        .where('channel_id', this.thing.channel_id)
        .where('datatype', 'boolean')
        .where('is_settable', true)
        .get()
    },

    switches() {
      return ChannelProperty
        .query()
        .where('channel_id', this.thing.channel_id)
        .where('property', 'switch')
        .get()
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
