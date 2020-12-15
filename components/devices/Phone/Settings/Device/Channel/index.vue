<template>
  <div class="">
    <list-item :variant="listItemTypes.LIST">
      <template slot="heading">
        {{ channel.title }}
      </template>

      <template slot="detail-large">
        <fb-ui-button
          :variant="buttonVariantTypes.OUTLINE_DANGER"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="handleOpenWindow(windowScreenTypes.EDIT)"
        >
          <font-awesome-icon icon="pencil-alt" />
          {{ $t('application.buttons.edit.title') }}
        </fb-ui-button>

        <fb-ui-button
          v-if="channel.control.includes('reset')"
          :variant="buttonVariantTypes.OUTLINE_PRIMARY"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="handleOpenWindow(windowScreenTypes.RESET_CONFIRMATION)"
        >
          <font-awesome-icon icon="sync-alt" />
          {{ $t('application.buttons.reset.title') }}
        </fb-ui-button>
      </template>
    </list-item>

    <devices-settings-channel-reset
      v-if="windowScreen.resetConfirmation.opened"
      :device="device"
      :channel="channel"
      @close="handleCloseWindow(windowScreenTypes.RESET_CONFIRMATION)"
      @reseted="handleCloseWindow(windowScreenTypes.RESET_CONFIRMATION)"
    />

    <devices-phone-settings-channel
      v-if="windowScreen.edit.opened"
      :device="device"
      :channel="channel"
      @close="handleCloseWindow(windowScreenTypes.EDIT)"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
} from '@vue/composition-api'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import { DeviceInterface } from '~/models/devices-module/devices/types'
import { ChannelInterface } from '~/models/devices-module/channels/types'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

import DevicesPhoneSettingsChannel from '~/components/devices/Phone/Settings/Channel/index.vue'

import DevicesSettingsChannelReset from '~/components/devices/Settings/Channel/Reset/index.vue'

enum WindowScreenTypes {
  EDIT = 'edit',
  RESET_CONFIRMATION = 'resetConfirmation',
}

interface DevicesPhoneSettingsDeviceChannelWindowInterface {
  edit: {
    opened: boolean
  }
  resetConfirmation: {
    opened: boolean
  }
}

export default defineComponent({

  name: 'DevicesPhoneSettingsDeviceChannel',

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
    DevicesPhoneSettingsChannel,

    DevicesSettingsChannelReset,
  },

  setup() {
    const windowScreen = reactive<DevicesPhoneSettingsDeviceChannelWindowInterface>({
      edit: {
        opened: false,
      },
      resetConfirmation: {
        opened: false,
      },
    })

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    return {
      windowScreen,
      handleOpenWindow,
      handleCloseWindow,
      windowScreenTypes: WindowScreenTypes,
      sizeTypes: FbSizeTypes,
      listItemTypes: ListItemSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
