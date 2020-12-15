<template>
  <list-layout
    :search-placeholder="$t('devices.fields.search.placeholder')"
    :class="['fb-devices-list-devices__container', {'fb-devices-list-devices__container-empty': noResults}]"
  >
    <template slot="items">
      <no-results
        v-if="noResults"
        icon="plug"
      >
        {{ $t('devices.texts.noDevices') }}
      </no-results>

      <swipe-list
        ref="list"
        v-else
        :items="items"
        :disabled="!$windowSize.isExtraSmall()"
      >
        <template v-slot="{ item }">
          <devices-list-device
            :key="item.id"
            :device="item"
            @click="handleOpen(item)"
          />
        </template>

        <template v-slot:right="{ item }">
          <div
            @click.prevent="handleOpenRemoveConfirmation(item)"
            class="fb-devices-list-devices__item-remove"
          >
            <font-awesome-icon icon="trash" />
          </div>
        </template>
      </swipe-list>

      <devices-settings-device-remove
        v-if="windowScreen.removeConfirmation.opened"
        :device="windowScreen.removeConfirmation.device"
        @close="handleCloseWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
        @removed="handleCloseWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
      />
    </template>

    <template slot="detail">
      <slot
        :previous="previousItem"
        :next="nextItem"
        :total="items.length"
        :page="page"
      />
    </template>
  </list-layout>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  reactive,
  SetupContext,
} from '@vue/composition-api'

// @ts-ignore
import { SwipeList } from 'vue-swipe-actions'

import { orderBy } from 'natural-orderby'

import Device from '~/models/devices-module/devices/Device'
import { DeviceInterface } from '~/models/devices-module/devices/types'

import DevicesListDevice from '~/components/devices/ListDevice/index.vue'

import DevicesSettingsDeviceRemove from '~/components/devices/Settings/Device/Remove/index.vue'

enum WindowScreenTypes {
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface DevicesListDevicesWindowInterface {
  removeConfirmation: {
    opened: boolean
    device: DeviceInterface | null
  }
}

interface DevicesListDevicesPropsInterface {
  activeItem: string
}

export default defineComponent({

  name: 'DevicesListDevices',

  props: {

    activeItem: {
      type: String,
      default: null,
    },

  },

  components: {
    DevicesListDevice,
    DevicesSettingsDeviceRemove,

    SwipeList,
  },

  setup(props: DevicesListDevicesPropsInterface, context: SetupContext) {
    const windowScreen = reactive<DevicesListDevicesWindowInterface>({
      removeConfirmation: {
        opened: false,
        device: null,
      },
    })

    const fetchingDevices = computed<boolean>((): boolean => Device.getters('fetching')())

    const items = computed<Array<DeviceInterface>>((): Array<DeviceInterface> => {
      return orderBy(
        Device
          .query()
          .orderBy('title')
          .get(),
        [
          v => v.title,
        ],
        ['asc'],
      )
    })

    const previousItem = computed((): string | null => {
      const index = items.value.findIndex(({ id }) => id === props.activeItem) - 1

      if (index <= items.value.length && index >= 0 && typeof items.value[index] !== 'undefined') {
        return items.value[index].id
      }

      return null
    })

    const nextItem = computed((): string | null => {
      const index = items.value.findIndex(({ id }) => id === props.activeItem) + 1

      if (index <= items.value.length && index >= 0 && typeof items.value[index] !== 'undefined') {
        return items.value[index].id
      }

      return null
    })

    const page = computed<number>((): number => {
      const index = items.value.findIndex(({ id }) => id === props.activeItem)

      if (index !== -1) {
        return index + 1
      }

      return 0
    })

    const noResults = computed<boolean>((): boolean => !fetchingDevices.value && items.value.length === 0)

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    function handleOpenRemoveConfirmation(device: DeviceInterface): void {
      // @ts-ignore
      windowScreen.removeConfirmation.device = device

      handleOpenWindow(WindowScreenTypes.REMOVE_CONFIRMATION)
    }

    function handleOpen(item: DeviceInterface): void {
      context.emit('open', item.id)
    }

    onBeforeMount((): void => {
      if (
        !fetchingDevices.value &&
        !Device.getters('firstLoadFinished')()
      ) {
        Device.dispatch('fetch', {
          includeChannels: true,
        })
          .catch(() => {
            context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          })
      }
    })

    return {
      windowScreen,
      fetchingDevices,
      items,
      previousItem,
      nextItem,
      page,
      noResults,
      handleCloseWindow,
      handleOpenRemoveConfirmation,
      handleOpen,
      windowScreenTypes: WindowScreenTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
