<template>
  <list-item
    :show-status="true"
    :status="thing.state"
    class="fb-things-list-item__container"
    @click="oneClick"
  >
    <template slot="icon">
      <icon-with-child :primary-icon="thing.device.icon" />
    </template>

    <template slot="heading">
      {{ thing.channel.title }}
    </template>

    <template slot="sub-heading">
      {{ thing.device.title }}
    </template>

    <template
      v-if="switchProperty || environmentProperty"
      slot="detail"
    >
      <switch-actor
        v-if="switchProperty"
        :device="thing.device"
        :property="switchProperty"
      />

      <div v-else-if="environmentProperty">
        <template v-if="thing.state">
          <span class="fb-things-list-item__value">{{ environmentProperty.formattedValue }}</span>
          <span class="fb-things-list-item__unit">{{ environmentProperty.unit }}</span>
        </template>
        <template v-else>
          <span class="fb-things-list-item__value">{{ $t('application.states.notAvailable') }}</span>
        </template>
      </div>
    </template>
  </list-item>
</template>

<script>
import SwitchActor from '~/components/devices/Actors/Switch'

import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'
import Hardware from '~/models/devices-node/hardwares/Hardware'

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
        .where('channelId', this.thing.channelId)
        .where('property', 'switch')
        .first()
    },

    environmentProperty() {
      const hardware = Hardware
        .query()
        .where('deviceId', this.thing.deviceId)
        .first()

      if (
        hardware !== null &&
        hardware.isManufacturerItead &&
        hardware.model === 'sonoff_sc'
      ) {
        return ChannelProperty
          .query()
          .where('channelId', this.thing.channelId)
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
