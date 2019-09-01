<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-light__container"
  >
    <things-detail-channel-container
      v-if="hasSwitch"
      :channel="channel"
      class="fb-iot-things-detail-channel-light__channel"
    >
      <template slot="icon">
        <device-icon
          name="lighting"
          class="fb-iot-things-detail-channel-light__icon"
        />
      </template>

      <div slot="channel">
        <things-detail-channel-switch :channel="channel" />
      </div>
    </things-detail-channel-container>

    <things-detail-channel-container
      :channel="channel"
      class="fb-iot-things-detail-channel-light__channel"
    >
      <template slot="icon">
        <device-icon
          name="lighting-special"
          class="fb-iot-things-detail-channel-light__icon"
        />
      </template>

      <div
        slot="name"
        class="fb-iot-things-detail-channel-light__heading"
      >
        <h5 class="fw-b m-y-0">
          {{ $t('channels.light.title') }}
        </h5>
        <small>{{ $tChannel(thing, channel) }}</small>
      </div>

      <div
        slot="channel"
        @click.prevent="showSettings()"
      >
        <div class="fb-iot-things-detail-channel-light__preview sq-36 cursor-pointer text-center">
          <template v-if="!thing.state">
            {{ $t('channels.light.preview.notAvailable') }}
          </template>
        </div>
      </div>
    </things-detail-channel-container>

    <things-detail-channel-container
      :channel="channel"
      class="fb-iot-things-detail-channel-light__channel fb-iot-things-detail-channel-light__channel-brightness"
    >
      <template slot="icon">
        <device-icon
          name="luminosity"
          class="fb-iot-things-detail-channel-light__icon m-t-md"
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
    </things-detail-channel-container>

    <things-channels-light
      v-if="show.light"
      :thing="thing"
      :channel="channel"
      @close="closeSettings()"
    />
  </div>
</template>

<script>
  import VueSlider from 'vue-slider-component'

  const ThingsDetailChannelContainer = () => import('../../ChannelContainer')
  const ThingsDetailChannelSwitch = () => import('../SwitchActor')

  const ThingsChannelsLight = () => import('../../../Channels/Light')

  import {
    PROPERTY_TYPE_STATE,
  } from '@/constants'

  export default {

    name: 'ThingsDetailChannelLight',

    components: {
      ThingsDetailChannelContainer,
      ThingsChannelsLight,
      ThingsDetailChannelSwitch,

      VueSlider,
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

    data() {
      return {
        activeTab: 'white',
        hasSwitch: this._.find(this.channel.properties, { 'property': PROPERTY_TYPE_STATE }) !== undefined,
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

<i18n src="./locales.json" />
