<template>
  <list-item
    :variant="$windowSize.isExtraSmall() ? listSizeTypes.LIST : listSizeTypes.DEFAULT"
    class="fb-devices-list-channel-property__container"
  >
    <template v-if="property.isAnalogSensor">
      <font-awesome-icon
        slot="icon"
        :icon="property.icon"
      />

      <template slot="heading">
        {{ property.title }}
      </template>

      <template slot="detail">
        <template v-if="device.isReady">
          <span class="fb-devices-list-channel-property__value">{{ property.analogValue }}</span>
          <span class="fb-devices-list-channel-property__unit">{{ property.unit }}</span>
        </template>
        <template v-else>
          <span class="fb-devices-list-channel-property__value">{{ $t('application.states.notAvailable') }}</span>
        </template>
      </template>
    </template>

    <template v-if="property.isBinarySensor">
      <font-awesome-icon
        slot="icon"
        :icon="property.icon"
      />

      <template slot="heading">
        {{ property.title }}
      </template>

      <template slot="detail">
        <template v-if="!device.isReady">
          {{ $t('application.states.notAvailable') }}
        </template>
        <template v-else-if="property.binaryValue">
          {{ $t('application.states.on') }}
        </template>
        <template v-else>
          {{ $t('application.states.off') }}
        </template>
      </template>
    </template>

    <template v-if="property.isBinaryActor">
      <font-awesome-icon
        slot="icon"
        :icon="property.icon"
      />

      <template slot="heading">
        {{ property.title }}
      </template>

      <devices-actor-switch
        slot="detail"
        :device="device"
        :property="property"
      />
    </template>

    <template v-if="property.isSwitch">
      <font-awesome-icon
        slot="icon"
        :icon="property.icon"
      />

      <template slot="heading">
        {{ property.title }}
      </template>

      <devices-actor-switch
        slot="detail"
        :device="device"
        :property="property"
      />
    </template>
  </list-item>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-module/devices/types'
import { ChannelInterface } from '~/models/devices-module/channels/types'
import { ChannelPropertyInterface } from '~/models/devices-module/channel-properties/types'

import DevicesActorSwitch from '~/components/devices/Actors/Switch/index.vue'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

export default defineComponent({

  name: 'DevicesListChannelProperty',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    channel: {
      type: Object as PropType<ChannelInterface>,
      required: true,
    },

    property: {
      type: Object as PropType<ChannelPropertyInterface>,
      required: true,
    },

  },

  components: {
    DevicesActorSwitch,
  },

  setup() {
    return {
      listSizeTypes: ListItemSizeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
