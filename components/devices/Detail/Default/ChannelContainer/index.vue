<template>
  <div class="fb-devices-detail-default-channel__container">
    <list-item
      v-for="property in analogSensors"
      :key="property.id"
      @click="() => {}"
    >
      <font-awesome-icon
        slot="icon"
        :icon="property.icon"
      />

      <template slot="heading">
        {{ property.title }}
      </template>

      <template slot="detail">
        <template v-if="device.isReady">
          <span class="fb-devices-detail-default-channel__value">{{ property.analogValue }}</span>
          <span class="fb-devices-detail-default-channel__unit">{{ property.unit }}</span>
        </template>
        <template v-else>
          <span class="fb-devices-detail-default-channel__value">{{ $t('application.states.notAvailable') }}</span>
        </template>
      </template>
    </list-item>

    <list-item
      v-for="property in binarySensors"
      :key="property.id"
      @click="() => {}"
    >
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
    </list-item>

    <list-item
      v-for="property in binaryActors"
      :key="property.id"
      @click="() => {}"
    >
      <font-awesome-icon
        slot="icon"
        :icon="property.icon"
      />

      <template slot="heading">
        {{ property.title }}
      </template>

      <switch-actor
        slot="detail"
        :device="device"
        :property="property"
      />
    </list-item>

    <list-item
      v-for="property in switches"
      :key="property.id"
      @click="() => {}"
    >
      <font-awesome-icon
        slot="icon"
        :icon="property.icon"
      />

      <template slot="heading">
        {{ property.title }}
      </template>

      <switch-actor
        slot="detail"
        :device="device"
        :property="property"
      />
    </list-item>

    <fb-ui-no-results v-if="!switches.length && !analogSensors.length && !analogActors.length && !binarySensors.length && !binaryActors.length">
      <font-awesome-icon
        slot="icon"
        icon="cube"
      />

      <font-awesome-icon
        slot="second-icon"
        icon="plug"
      />

      {{ $t('devices.texts.noProperties') }}
    </fb-ui-no-results>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
} from '@vue/composition-api'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import { ChannelInterface } from '~/models/devices-node/channels/types'
import ChannelProperty from '~/models/devices-node/channel-properties/ChannelProperty'
import { PropertyDatatypeType } from '~/models/devices-node/properties/types'

import SwitchActor from '~/components/devices/Actors/Switch/index.vue'

interface DevicesDetailDefaultChannelContainerPropsInterface {
  device: DeviceInterface,
  channel: ChannelInterface,
}

const sensorsNames: Array<string> = [
  'sensor',
  'air_quality',
  'light_level',
  'noise_level',
  'temperature',
  'humidity',
]

const actorsNames: Array<string> = [
  'sensor',
]

export default defineComponent({

  name: 'DevicesDetailDefaultChannelContainer',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    channel: {
      type: Object as PropType<ChannelInterface>,
      required: true,
    },

  },

  components: {
    SwitchActor,
  },

  setup(props: DevicesDetailDefaultChannelContainerPropsInterface) {
    const analogSensors = computed<Array<ChannelProperty>>((): Array<ChannelProperty> => {
      return ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', (value: string): boolean => {
          return sensorsNames.includes(value)
        })
        .where('datatype', [PropertyDatatypeType.INTEGER, PropertyDatatypeType.FLOAT])
        .where('isSettable', false)
        .orderBy('title')
        .get()
    })

    const analogActors = computed<Array<ChannelProperty>>((): Array<ChannelProperty> => {
      return ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', (value: string): boolean => {
          return actorsNames.includes(value)
        })
        .where('datatype', [PropertyDatatypeType.INTEGER, PropertyDatatypeType.FLOAT])
        .where('isSettable', true)
        .orderBy('title')
        .get()
    })

    const binarySensors = computed<Array<ChannelProperty>>((): Array<ChannelProperty> => {
      return ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', (value: string): boolean => {
          return sensorsNames.includes(value)
        })
        .where('datatype', PropertyDatatypeType.BOOLEAN)
        .where('isSettable', false)
        .orderBy('title')
        .get()
    })

    const binaryActors = computed<Array<ChannelProperty>>((): Array<ChannelProperty> => {
      return ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', (value: string): boolean => {
          return actorsNames.includes(value)
        })
        .where('datatype', PropertyDatatypeType.BOOLEAN)
        .where('isSettable', true)
        .orderBy('title')
        .get()
    })

    const switches = computed<Array<ChannelProperty>>((): Array<ChannelProperty> => {
      return ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', 'switch')
        .orderBy('title')
        .get()
    })

    return {
      analogActors,
      analogSensors,
      binaryActors,
      binarySensors,
      switches,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
