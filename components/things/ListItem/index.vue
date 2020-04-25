<template>
  <list-item
    :show-status="true"
    :status="thing.state"
    class="fb-iot-things-list-item__container"
    @click="oneClick"
  >
    <template slot="icon">
      <icon-with-child :primary-icon="$thingIcon(thing)" />
    </template>

    <template slot="heading">
      {{ $tThingChannel(thing) }}
    </template>

    <template slot="sub-heading">
      {{ $tThingDevice(thing) }}
    </template>

    <template
      v-if="switchProperty || environmentProperty"
      slot="detail"
    >
      <switch-actor
        v-if="switchProperty"
        :thing="thing"
        :property="switchProperty"
      />

      <div v-else-if="environmentProperty">
        <template v-if="thing.state">
          <span class="fb-iot-things-list-item__value">{{ environmentProperty.formattedValue }}</span>
          <span class="fb-iot-things-list-item__unit">{{ environmentProperty.unit }}</span>
        </template>
        <template v-else>
          <span class="fb-iot-things-list-item__value">{{ $t('application.states.notAvailable') }}</span>
        </template>
      </div>
    </template>
  </list-item>
</template>

<script>
import SwitchActor from '@/components/things/Actors/Switch'

import ChannelProperty from '~/models/devices-node/ChannelProperty'
import Hardware from '~/models/devices-node/Hardware'

export default {

  name: 'ThingsListItem',

  components: {
    SwitchActor,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  computed: {

    switchProperty() {
      return ChannelProperty
        .query()
        .where('channel_id', this.thing.channel_id)
        .where('property', 'switch')
        .first()
    },

    environmentProperty() {
      const hardware = Hardware
        .query()
        .where('device_id', this.thing.device_id)
        .first()

      if (
        hardware !== null &&
        hardware.isManufacturerItead &&
        hardware.model === 'sonoff_sc'
      ) {
        return ChannelProperty
          .query()
          .where('channel_id', this.thing.channel_id)
          .where('property', 'temperature')
          .first()
      }

      return null
    },

  },

  methods: {

    /**
     * Double click and single click event handler
     *
     * @param {Object} event
     */
    oneClick(event) {
      this.$emit('click', event, this.thing)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
