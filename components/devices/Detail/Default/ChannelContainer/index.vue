<template>
  <div class="fb-devices-detail-default-channel-container__container">
    <fb-ui-items-container>
      <template slot="heading">
        {{ $t('devices.headings.channel', { channel: channel.title }) }}
      </template>

      <devices-list-channel-property
        v-for="property in properties"
        :key="property.id"
        :device="device"
        :channel="channel"
        :property="property"
      />

      <no-results
        v-if="!properties.length"
        icon="cube"
      >
        {{ $t('devices.texts.noProperties') }}
      </no-results>

      <template slot="buttons">
        <fb-ui-button
          v-if="editMode"
          :variant="buttonVariantTypes.OUTLINE_PRIMARY"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="handleOpenWindow(windowScreenTypes.RENAME)"
        >
          <font-awesome-icon icon="pencil-alt" />
          {{ $t('application.buttons.rename.title') }}
        </fb-ui-button>

        <fb-ui-button
          v-if="editMode && channel.control.includes('reset')"
          :disabled="!device.isReady"
          :variant="buttonVariantTypes.OUTLINE_DANGER"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="handleOpenWindow(windowScreenTypes.RESET_CONFIRMATION)"
        >
          <font-awesome-icon icon="sync-alt" />
          {{ $t('application.buttons.reset.title') }}
        </fb-ui-button>

        <fb-ui-button
          v-if="editMode"
          :variant="buttonVariantTypes.OUTLINE_PRIMARY"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="handleOpenWindow(windowScreenTypes.CONFIGURE)"
        >
          <font-awesome-icon icon="cogs" />
          {{ $t('application.buttons.configure.title') }}
        </fb-ui-button>
      </template>
    </fb-ui-items-container>

    <devices-desktop-settings-channel-rename
      v-if="windowScreen.rename.opened"
      :device="device"
      :channel="channel"
      @close="handleCloseWindow(windowScreenTypes.RENAME)"
    />

    <devices-settings-channel-reset
      v-if="windowScreen.resetConfirmation.opened"
      :device="device"
      :channel="channel"
      @reseted="handleCloseWindow(windowScreenTypes.RESET_CONFIRMATION)"
      @close="handleCloseWindow(windowScreenTypes.RESET_CONFIRMATION)"
    />

    <off-canvas
      :show="editMode && windowScreen.configure.opened"
      @close="handleCloseWindow(windowScreenTypes.CONFIGURE)"
    >
      <off-canvas-body>
        <template slot="heading">
          {{ channel.title }}
        </template>

        <template
          slot="sub-heading"
          v-if="device.hasComment"
        >
          {{ device.title }}
        </template>

        <off-canvas-button
          slot="left-button"
          @click.prevent="handleCloseWindow(windowScreenTypes.CONFIGURE)"
        >
          <font-awesome-icon icon="times" />
        </off-canvas-button>

        <transition
          slot="body"
          name="fade"
          mode="out-in"
        >
          <devices-desktop-settings-channel
            :device="device"
            :channel="channel"
          />
        </transition>
      </off-canvas-body>
    </off-canvas>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  reactive,
} from '@vue/composition-api'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import { DeviceInterface } from '~/models/devices-module/devices/types'
import { ChannelInterface } from '~/models/devices-module/channels/types'
import ChannelProperty from '~/models/devices-module/channel-properties/ChannelProperty'
import {
  ActorNameTypes,
  PropertyDatatypeTypes,
  SensorNameTypes,
} from '~/models/devices-module/properties/types'

import DevicesListChannelProperty from '~/components/devices/ListChannelProperty/index.vue'

import DevicesDesktopSettingsChannel from '~/components/devices/Desktop/Settings/Channel/index.vue'
import DevicesDesktopSettingsChannelRename from '~/components/devices/Desktop/Settings/Channel/Rename/index.vue'

import DevicesSettingsChannelReset from '~/components/devices/Settings/Channel/Reset/index.vue'

enum WindowScreenTypes {
  RENAME = 'rename',
  CONFIGURE = 'configure',
  RESET_CONFIRMATION = 'resetConfirmation',
}

interface DevicesDetailDefaultChannelContainerWindowInterface {
  rename: {
    opened: boolean
  }
  configure: {
    opened: boolean
  }
  resetConfirmation: {
    opened: boolean
  }
}

interface DevicesDetailDefaultChannelContainerPropsInterface {
  device: DeviceInterface
  channel: ChannelInterface
}

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

    editMode: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    DevicesListChannelProperty,

    DevicesDesktopSettingsChannel,
    DevicesDesktopSettingsChannelRename,

    DevicesSettingsChannelReset,
  },

  setup(props: DevicesDetailDefaultChannelContainerPropsInterface) {
    const windowScreen = reactive<DevicesDetailDefaultChannelContainerWindowInterface>({
      rename: {
        opened: false,
      },
      configure: {
        opened: false,
      },
      resetConfirmation: {
        opened: false,
      },
    })

    const properties = computed<Array<ChannelProperty>>((): Array<ChannelProperty> => {
      const analogSensors = ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', (value: SensorNameTypes): boolean => {
          return [
            SensorNameTypes.SENSOR,
            SensorNameTypes.AIR_QUALITY,
            SensorNameTypes.LIGHT_LEVEL,
            SensorNameTypes.NOISE_LEVEL,
            SensorNameTypes.TEMPERATURE,
            SensorNameTypes.HUMIDITY,
          ].includes(value)
        })
        .where('datatype', [PropertyDatatypeTypes.INTEGER, PropertyDatatypeTypes.FLOAT])
        .where('isSettable', false)
        .orderBy('title')
        .get()

      const analogActors = ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', (value: ActorNameTypes): boolean => {
          return [
            ActorNameTypes.ACTOR,
            ActorNameTypes.SWITCH,
          ].includes(value) && value !== ActorNameTypes.SWITCH
        })
        .where('datatype', [PropertyDatatypeTypes.INTEGER, PropertyDatatypeTypes.FLOAT])
        .where('isSettable', true)
        .orderBy('title')
        .get()

      const binarySensors = ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', (value: SensorNameTypes): boolean => {
          return [
            SensorNameTypes.SENSOR,
            SensorNameTypes.AIR_QUALITY,
            SensorNameTypes.LIGHT_LEVEL,
            SensorNameTypes.NOISE_LEVEL,
            SensorNameTypes.TEMPERATURE,
            SensorNameTypes.HUMIDITY,
          ].includes(value)
        })
        .where('datatype', PropertyDatatypeTypes.BOOLEAN)
        .where('isSettable', false)
        .orderBy('title')
        .get()

      const binaryActors = ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', (value: ActorNameTypes): boolean => {
          return [
            ActorNameTypes.ACTOR,
            ActorNameTypes.SWITCH,
          ].includes(value) && value !== ActorNameTypes.SWITCH
        })
        .where('datatype', PropertyDatatypeTypes.BOOLEAN)
        .where('isSettable', true)
        .orderBy('title')
        .get()

      const switches = ChannelProperty
        .query()
        .where('channelId', props.channel.id)
        .where('property', ActorNameTypes.SWITCH)
        .orderBy('title')
        .get()

      return analogSensors.concat(binarySensors, analogActors, binaryActors, switches)
    })

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    return {
      windowScreen,
      properties,
      handleOpenWindow,
      handleCloseWindow,
      windowScreenTypes: WindowScreenTypes,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
