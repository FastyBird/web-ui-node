<template>
  <div class="fb-devices-desktop-detail__container">
    <devices-desktop-detail-toolbar
      slot="toolbar"
      :device="device"
      :edit-mode="editMode"
      :page="page"
      :total="total"
      @toggleEdit="handleToggleEditMode"
      @previous="handlePreviousItem"
      @next="handleNextItem"
      @close="handleClose"
    />

    <devices-desktop-detail-header
      slot="heading"
      :device="device"
      :edit-mode="editMode"
    >
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
          v-if="editMode"
          :variant="buttonVariantTypes.OUTLINE_DANGER"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="handleOpenWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
        >
          <font-awesome-icon icon="trash-alt" />
          {{ $t('application.buttons.remove.title') }}
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
    </devices-desktop-detail-header>

    <devices-detail
      slot="detail"
      :device="device"
      :edit-mode="editMode"
    />

    <devices-desktop-settings-device-rename
      v-if="windowScreen.rename.opened"
      :device="device"
      @close="handleCloseWindow(windowScreenTypes.RENAME)"
    />

    <devices-settings-device-remove
      v-if="windowScreen.removeConfirmation.opened"
      :device="device"
      :transparent-bg="false"
      @removed="handleRemoved"
      @close="handleCloseWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
    />

    <off-canvas
      :show="editMode && windowScreen.configure.opened"
      @close="handleCloseWindow(windowScreenTypes.CONFIGURE)"
    >
      <off-canvas-body>
        <template slot="heading">
          {{ device.title }}
        </template>

        <template
          slot="sub-heading"
          v-if="device.hasComment"
        >
          {{ device.comment }}
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
          <devices-desktop-settings-device :device="device" />
        </transition>
      </off-canvas-body>
    </off-canvas>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'

import DevicesDetail from '~/components/devices/Detail/index.vue'

import DevicesDesktopDetailHeader from '~/components/devices/Desktop/DetailHeader/index.vue'
import DevicesDesktopDetailToolbar from '~/components/devices/Desktop/DetailToolbar/index.vue'
import DevicesDesktopSettingsDevice from '~/components/devices/Desktop/Settings/Device/index.vue'
import DevicesDesktopSettingsDeviceRename from '~/components/devices/Desktop/Settings/Device/Rename/index.vue'

import DevicesSettingsDeviceRemove from '~/components/devices/Settings/Device/Remove/index.vue'

enum WindowScreenTypes {
  RENAME = 'rename',
  REMOVE_CONFIRMATION = 'removeConfirmation',
  CONFIGURE = 'configure',
}

interface DevicesDesktopDetailWindowInterface {
  rename: {
    opened: boolean
  }
  configure: {
    opened: boolean
  }
  removeConfirmation: {
    opened: boolean
  }
}

interface DevicesDesktopDetailPropsInterface {
  id: string
  page: number
  total: number
}

export default defineComponent({

  name: 'DevicesDesktopDetail',

  props: {

    id: {
      type: String,
      required: true,
      validator: (value: string): boolean => {
        return Device.query().where('id', value).exists()
      },
    },

    page: {
      type: Number,
      default: 1,
    },

    total: {
      type: Number,
      default: 0,
    },

  },

  components: {
    DevicesDetail,

    DevicesDesktopDetailHeader,
    DevicesDesktopDetailToolbar,
    DevicesDesktopSettingsDevice,
    DevicesDesktopSettingsDeviceRename,

    DevicesSettingsDeviceRemove,
  },

  setup(props: DevicesDesktopDetailPropsInterface, context: SetupContext) {
    const device = computed<DeviceInterface | null>((): DeviceInterface | null => {
      return Device.find(props.id)
    })

    const editMode = ref<boolean>(false)

    const windowScreen = reactive<DevicesDesktopDetailWindowInterface>({
      rename: {
        opened: false,
      },
      configure: {
        opened: false,
      },
      removeConfirmation: {
        opened: false,
      },
    })

    function handleToggleEditMode(): void {
      editMode.value = !editMode.value
    }

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    function handlePreviousItem(): void {
      context.emit('previous')
    }

    function handleNextItem(): void {
      context.emit('next')
    }

    function handleClose(): void {
      context.emit('close')
    }

    function handleRemoved(): void {
      context.emit('removed')
    }

    watch(
      (): DeviceInterface | null => device.value,
      (): void => {
        editMode.value = false
      },
    )

    return {
      windowScreen,
      device,
      editMode,
      handleToggleEditMode,
      handleOpenWindow,
      handleCloseWindow,
      handlePreviousItem,
      handleNextItem,
      handleClose,
      handleRemoved,
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
