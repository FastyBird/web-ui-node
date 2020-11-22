<template>
  <div class="fb-devices-phone-settings-device__container">
    <h3 class="fb-devices-phone-settings-device__heading">
      {{ $t('devices.headings.aboutDevice') }}
    </h3>

    <fb-ui-content
      :ph="sizeTypes.SMALL"
      :pv="sizeTypes.SMALL"
    >
      <devices-settings-device-rename
        :device="device"
        :remote-form-submit.sync="reRemoteFormSubmit"
        :remote-form-result.sync="reRemoteFormResult"
        :remote-form-reset.sync="reRemoteFormReset"
      />
    </fb-ui-content>

    <fb-ui-items-container
      v-if="channels.length"
      class="fb-devices-phone-settings-device__channels"
    >
      <template slot="heading">
        {{ $t('devices.headings.channels') }}
      </template>

      <devices-phone-settings-device-channel
        v-for="channel in channels"
        :key="channel.id"
        :device="device"
        :channel="channel"
      />
    </fb-ui-items-container>

    <fb-ui-items-container>
      <template slot="heading">
        {{ $t('devices.headings.generalSettings') }}
      </template>

      <list-item
        :variant="listItemTypes.DEFAULT"
        @click="handleOpenWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
        class="fb-devices-phone-settings-device__item fb-devices-phone-settings-device__item-remove"
      >
        <template slot="heading">
          {{ $t('devices.buttons.removeDevice.title') }}
        </template>
      </list-item>
    </fb-ui-items-container>

    <devices-settings-device-remove
      v-if="windowScreen.removeConfirmation.opened"
      :device="device"
      :transparent-bg="false"
      @close="handleCloseWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
      @removed="handleRemoved"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  watch,
} from '@vue/composition-api'

import {
  FbFormResultTypes,
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import Channel from '~/models/devices-node/channels/Channel'

import { ChannelInterface } from '~/models/devices-node/channels/types'
import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

import DevicesPhoneSettingsDeviceChannel from '~/components/devices/Phone/Settings/Device/Channel/index.vue'

import DevicesSettingsDeviceRename from '~/components/devices/Settings/Device/Rename/index.vue'
import DevicesSettingsDeviceRemove from '~/components/devices/Settings/Device/Remove/index.vue'

enum WindowScreenTypes {
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface DevicesPhoneSettingsWindowInterface {
  removeConfirmation: {
    opened: boolean
  }
}

interface DevicesPhoneSettingsPropsInterface {
  device: DeviceInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
  remoteFormReset: boolean
}

export default defineComponent({

  name: 'DevicesPhoneSettingsDevice',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    remoteFormSubmit: {
      type: Boolean,
      default: false,
    },

    remoteFormResult: {
      type: String as PropType<FbFormResultTypes>,
      default: FbFormResultTypes.NONE,
    },

    remoteFormReset: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    DevicesPhoneSettingsDeviceChannel,

    DevicesSettingsDeviceRename,
    DevicesSettingsDeviceRemove,
  },

  setup(props: DevicesPhoneSettingsPropsInterface, context) {
    const reRemoteFormSubmit = ref<boolean>(false)

    const reRemoteFormResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const reRemoteFormReset = ref<boolean>(false)

    const isMounted = ref<boolean>(false)

    const windowScreen = reactive<DevicesPhoneSettingsWindowInterface>({
      removeConfirmation: {
        opened: false,
      },
    })

    const channels = computed<Array<ChannelInterface>>((): Array<ChannelInterface> => {
      return Channel
        .query()
        .where('deviceId', props.device.id)
        .orderBy('title')
        .get()
    })

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    function handleRemoved(): void {
      handleCloseWindow(WindowScreenTypes.REMOVE_CONFIRMATION)

      context.emit('removed')
    }

    onMounted((): void => {
      isMounted.value = true
    })

    watch(
      (): boolean => reRemoteFormSubmit.value,
      (val): void => {
        if (isMounted.value) {
          context.emit('update:remoteFormSubmit', val)
        }
      },
    )

    watch(
      (): FbFormResultTypes => reRemoteFormResult.value,
      (val): void => {
        if (isMounted.value) {
          context.emit('update:remoteFormResult', val)
        }
      },
    )

    watch(
      (): boolean => reRemoteFormReset.value,
      (val): void => {
        if (isMounted.value) {
          context.emit('update:remoteFormReset', val)
        }
      },
    )

    watch(
      (): boolean => props.remoteFormSubmit,
      (val): void => {
        if (isMounted.value) {
          reRemoteFormSubmit.value = val
        }
      },
    )

    watch(
      (): FbFormResultTypes => props.remoteFormResult,
      (val): void => {
        if (isMounted.value) {
          reRemoteFormResult.value = val
        }
      },
    )

    watch(
      (): boolean => props.remoteFormReset,
      (val): void => {
        if (isMounted.value) {
          reRemoteFormReset.value = val
        }
      },
    )

    return {
      reRemoteFormSubmit,
      reRemoteFormResult,
      reRemoteFormReset,
      windowScreen,
      channels,
      handleOpenWindow,
      handleCloseWindow,
      handleRemoved,
      windowScreenTypes: WindowScreenTypes,
      sizeTypes: FbSizeTypes,
      listItemTypes: ListItemSizeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
