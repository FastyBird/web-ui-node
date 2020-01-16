<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-light__container"
  >
    <property-container
      v-if="hasSwitch"
      :thing="thing"
      class="fb-iot-things-detail-channel-light__channel"
    >
      <template slot="icon">
        <font-awesome-icon
          icon="lightbulb"
          class="fb-iot-things-channels-light__channel-icon m-t-md"
        />
      </template>

      <div slot="channel">
        <switch-actor :channel="channel" />
      </div>
    </property-container>

    <property-container
      :thing="thing"
      class="fb-iot-things-detail-channel-light__channel"
    >
      <template slot="icon">
        <font-awesome-icon
          icon="lightbulb"
          class="fb-iot-things-channels-light__channel-icon m-t-md"
        />
      </template>

      <div
        slot="name"
        class="fb-iot-things-detail-channel-light__heading"
      >
        <h5 class="fw-b m-y-0">
          {{ $t('channels.light.title') }}
        </h5>
        <small>{{ $tThing(thing) }}</small>
      </div>

      <div
        slot="channel"
        @click.prevent="showSettings()"
      >
        <div class="fb-iot-things-detail-channel-light__preview sq-36 cursor-pointer text-center">
          <template v-if="!thing.state">
            {{ $t('application.states.notAvailable') }}
          </template>
        </div>
      </div>
    </property-container>

    <property-container
      :thing="thing"
      class="fb-iot-things-detail-channel-light__channel fb-iot-things-detail-channel-light__channel-brightness"
    >
      <template slot="icon">
        <font-awesome-icon
          icon="sun"
          class="fb-iot-things-channels-light__channel-icon m-t-md"
        />
      </template>

      <div slot="name">
        <span class="d-ib">Brightness</span>
        <vue-slider
          ref="brightness"
          v-model="slider.model.brightness"
          :tooltip="false"
          :height="15"
          :dot-size="25"
          :min="0"
          :max="255"
          :disabled="!thing.state"
          :bg-style="slider.style.brightness"
        />
      </div>
    </property-container>

    <light-actor
      v-if="show.light"
      :thing="thing"
      :channel="channel"
      @close="closeSettings()"
    />
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'

import PropertyContainer from '../../PropertyContainer'

import SwitchActor from '@/components/things/Actors/Switch'
import LightActor from '@/components/things/Actors/Light'

export default {

  name: 'ThingsDetailChannelLightActor',

  components: {
    PropertyContainer,

    SwitchActor,
    LightActor,

    VueSlider,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

    property: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      activeTab: 'white',
      hasSwitch: this.channel.stateProperty !== undefined,
      slider: {
        style: {
          brightness: {
            background: 'linear-gradient(to right, #232526, #fff)',
            border: '1px solid #dcdcdc',
          },
        },
        model: {
          brightness: 0,
        },
      },
      show: {
        light: false,
      },
    }
  },

  methods: {

    showSettings() {
      this.show.light = true
    },

    closeSettings() {
      this.show.light = false
    },

  },

}
</script>

<style>

  .vue-slider-component .vue-slider-process {
    background: none;
  }

</style>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
