<template>
  <div :class="['fb-devices-list-view__container', {'fb-devices-list-view__container-loading': (isLoading)}, {'fb-devices-list-view__container-empty': (noResults)}]">
    <fb-layout-header-heading
      :heading="$t('devices.headings.allDevices')"
      :sub-heading="$tc('devices.subHeadings.allDevices', devices.length, { count: devices.length })"
    />

    <client-only>
      <fb-ui-loading-box
        v-if="isLoading"
        class="fb-devices-list-view__loading"
      >
        <p>
          {{ $t('devices.texts.loadingDevices') }}
        </p>
      </fb-ui-loading-box>

      <list-layout
        v-else
        :search-placeholder="$t('devices.fields.search.placeholder')"
      >
        <fb-ui-no-results
          v-if="noResults"
          slot="items"
        >
          <font-awesome-icon
            slot="icon"
            icon="plug"
          />

          <font-awesome-icon
            slot="second-icon"
            icon="exclamation-triangle"
          />

          {{ $t('devices.texts.noDevices') }}
        </fb-ui-no-results>

        <template v-else>
          <list-item
            v-for="device in devices"
            slot="items"
            :key="device.id"
            variant="list"
            @click="oneClick($event, device)"
          >
            <devices-icon
              slot="icon"
              :device="device"
            />

            <template slot="heading">
              {{ device.title }}
            </template>

            <template
              v-if="device.comment !== null"
              slot="sub-heading"
            >
              {{ device.comment }}
            </template>
          </list-item>
        </template>

        <div
          v-if="!view.detail.opened || openedDetail === null"
          slot="detail"
          class="fb-devices-list-view__detail-info"
        >
          <fb-ui-content ml="md">
            <fb-ui-media-item>
              <font-awesome-icon
                slot="left"
                icon="plug"
              />

              <template slot="heading">
                {{ $t('devices.headings.allDevices') }}
              </template>

              <template slot="description">
                {{ $tc('devices.subHeadings.allDevices', devices.length, { count: devices.length }) }}
              </template>
            </fb-ui-media-item>

            <fb-ui-media-item>
              <font-awesome-icon
                slot="left"
                icon="plus"
              />

              <template slot="heading">
                {{ $t('devices.headings.addNewDevice') }}
              </template>

              <template slot="description">
                {{ $t('devices.subHeadings.addNewDevice') }}
              </template>

              <fb-ui-button
                slot="action"
                variant="outline-primary"
                @click.prevent="openView(viewTypes.CONNECT)"
              >
                {{ $t('devices.buttons.addNew.title') }}
              </fb-ui-button>
            </fb-ui-media-item>

            <fb-ui-media-item>
              <font-awesome-icon
                slot="left"
                icon="sync-alt"
              />

              <template slot="heading">
                {{ $t('devices.headings.syncDevices') }}
              </template>

              <template slot="description">
                {{ $t('devices.subHeadings.syncDevices') }}
              </template>

              <fb-ui-button
                slot="action"
                variant="outline-default"
                @click.prevent="synchroniseDevices"
              >
                {{ $t('devices.buttons.sync.title') }}
              </fb-ui-button>
            </fb-ui-media-item>
          </fb-ui-content>
        </div>

        <template v-if="view.detail.opened && openedDetail !== null">
          <desktop-detail-heading slot="heading">
            <h2 slot="heading">
              {{ openedDetail.title }}
            </h2>

            <small
              v-if="openedDetail.comment !== null"
              slot="sub-heading"
            >
              {{ openedDetail.comment }}
            </small>

            <font-awesome-icon
              slot="icon"
              :icon="openedDetail.icon"
            />

            <template slot="buttons">
              <fb-ui-button
                variant="link"
                size="xs"
                @click.prevent="openView(viewTypes.DEVICE_SETTINGS, openedDetail.id)"
              >
                <font-awesome-icon icon="cog" />
                {{ $t('application.buttons.edit.title') }}
              </fb-ui-button>

              <fb-ui-button
                variant="link"
                size="xs"
                @click.prevent="closeView(viewTypes.DETAIL)"
              >
                <font-awesome-icon icon="times" />
                {{ $t('application.buttons.close.title') }}
              </fb-ui-button>
            </template>
          </desktop-detail-heading>

          <devices-detail
            slot="detail"
            :device="openedDetail"
            @close="closeView(viewTypes.DETAIL)"
            @editChannel="openChannelSettings"
          />
        </template>
      </list-layout>

      <off-canvas
        v-if="windowSize !== 'xs' && isMounted"
        :show="view.deviceSettings.opened || view.channelSettings.opened"
        @close="closeView([viewTypes.DEVICE_SETTINGS, viewTypes.CHANNEL_SETTINGS])"
      >
        <off-canvas-body v-if="openedDeviceSettings !== null || openedChannelSettings !== null">
          <template
            v-if="view.deviceSettings.opened"
            slot="heading"
          >
            {{ openedDeviceSettings.title }}
          </template>

          <template
            v-if="view.deviceSettings.opened && openedDeviceSettings.comment !== null"
            slot="sub-heading"
          >
            {{ openedDeviceSettings.comment }}
          </template>

          <template
            v-if="view.channelSettings.opened"
            slot="heading"
          >
            {{ openedChannelSettings.title }}
          </template>

          <template
            v-if="view.channelSettings.opened && openedChannelSettings.comment !== null"
            slot="sub-heading"
          >
            {{ openedChannelSettings.comment }}
          </template>

          <button
            slot="left-button"
            class="button"
            @click.prevent="closeView([viewTypes.DEVICE_SETTINGS, viewTypes.CHANNEL_SETTINGS])"
          >
            <font-awesome-icon icon="times" />
          </button>

          <transition
            slot="body"
            name="fade"
            mode="out-in"
          >
            <devices-settings-device
              v-if="view.deviceSettings.opened"
              :device="openedDeviceSettings"
            />

            <devices-settings-channel
              v-if="view.channelSettings.opened"
              :channel="openedChannelSettings"
            />
          </transition>
        </off-canvas-body>
      </off-canvas>

      <devices-desktop-connect
        v-if="view.connect.opened && windowSize !== 'xs'"
        @close="closeView(viewTypes.CONNECT)"
      />

      <fb-ui-loading-box
        slot="placeholder"
        class="fb-devices-list-view__loading"
      >
        <p>
          {{ $t('devices.texts.loadingDevices') }}
        </p>
      </fb-ui-loading-box>
    </client-only>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import {
  DEVICES_HASH_DETAIL,
  DEVICES_HASH_SETTINGS,
} from '~/configuration/routes'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'
import Channel from '~/models/devices-node/channels/Channel'
import { ChannelInterface } from '~/models/devices-node/channels/types'

import DevicesDetail from '~/components/devices/Detail/index.vue'
import DevicesSettingsDevice from '~/components/devices/Settings/Device/index.vue'
import DevicesSettingsChannel from '~/components/devices/Settings/Channel/index.vue'
import DevicesDesktopConnect from '~/components/devices/Desktop/Connect/index.vue'
import DevicesIcon from '~/components/devices/Icon/index.vue'

enum ViewTypes {
  CONNECT = 'connect',
  DETAIL = 'detail',
  DEVICE_SETTINGS = 'deviceSettings',
  CHANNEL_SETTINGS = 'channelSettings',
}

interface DevicesIndexPageViewConnectInterface {
  opened: boolean
}

interface DevicesIndexPageViewDetailInterface {
  opened: boolean
  id: string | null,
}

interface DevicesIndexPageViewDeviceSettingsInterface {
  opened: boolean
  id: string | null
}

interface DevicesIndexPageViewChannelSettingsInterface {
  opened: boolean
  id: string | null
}

interface DevicesIndexPageViewInterface {
  connect: DevicesIndexPageViewConnectInterface
  detail: DevicesIndexPageViewDetailInterface
  deviceSettings: DevicesIndexPageViewDeviceSettingsInterface
  channelSettings: DevicesIndexPageViewChannelSettingsInterface
}

interface DevicesIndexPageClickInterface {
  delay: number
  clicks: number
  timer: number
}

export default defineComponent({

  name: 'DevicesIndexPage',

  components: {
    DevicesDesktopConnect,

    DevicesDetail,
    DevicesSettingsDevice,
    DevicesSettingsChannel,
    DevicesIcon,
  },

  transition: 'fade',

  setup(props: { }, context: SetupContext) {
    const view = reactive<DevicesIndexPageViewInterface>({
      connect: {
        opened: false,
      },
      detail: {
        opened: false,
        id: null,
      },
      deviceSettings: {
        opened: false,
        id: null,
      },
      channelSettings: {
        opened: false,
        id: null,
      },
    })

    const click = reactive<DevicesIndexPageClickInterface>({
      delay: 200,
      clicks: 0,
      timer: 0,
    })

    const isMounted = ref<boolean>(false)

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const devices = computed<Array<DeviceInterface>>((): Array<DeviceInterface> => {
      return Device
        .query()
        .orderBy('title')
        .get()
    })

    const fetchingDevices = computed<boolean>((): boolean => Device.getters('fetching')())

    const isLoading = computed<boolean>((): boolean => fetchingDevices.value && devices.value.length === 0)

    const noResults = computed<boolean>((): boolean => !fetchingDevices.value && devices.value.length === 0)

    const openedDetail = computed<DeviceInterface | null>((): DeviceInterface | null => {
      if (view.detail.opened && view.detail.id !== null) {
        return Device.find(view.detail.id)
      }

      return null
    })

    const openedDeviceSettings = computed<DeviceInterface | null>((): DeviceInterface | null => {
      if (view.deviceSettings.opened && view.deviceSettings.id !== null) {
        return Device.find(view.deviceSettings.id)
      }

      return null
    })

    const openedChannelSettings = computed<ChannelInterface | null>((): ChannelInterface | null => {
      if (view.channelSettings.opened && view.channelSettings.id !== null) {
        return Channel.find(view.channelSettings.id)
      }

      return null
    })

    // Close opened view
    function closeView(type: ViewTypes | Array<ViewTypes>) {
      let toClose: Array<string>

      if (!Array.isArray(type)) {
        toClose = [type]
      } else {
        toClose = type
      }

      toClose
        .forEach((name) => {
          if (Object.prototype.hasOwnProperty.call(view, name)) {
            switch (name) {
              case ViewTypes.DETAIL:
                view.detail.opened = false
                view.detail.id = null

                context.root.$router.push(context.root.localePath(context.root.$routes.devices.list))
                break

              case ViewTypes.DEVICE_SETTINGS:
                view.deviceSettings.opened = false
                view.deviceSettings.id = null
                break

              case ViewTypes.CHANNEL_SETTINGS:
                view.channelSettings.opened = false
                view.channelSettings.id = null
                break

              case ViewTypes.CONNECT:
                view.connect.opened = false
                break
            }
          }
        })
    }

    // Open selected view
    function openView(type: ViewTypes, id?: string) {
      if (Object.prototype.hasOwnProperty.call(view, type)) {
        switch (type) {
          case ViewTypes.DETAIL:
            if (windowSize.value === 'xs') {
              if (typeof id !== 'undefined') {
                context.root.$bus.$emit('wait-page_reloading', 10)

                context.root.$router.push(context.root.localePath({
                  name: context.root.$routes.devices.detail,
                  params: {
                    id,
                  },
                }))
              }

              return
            } else {
              context.root.$router.push(context.root.localePath({
                name: context.root.$routes.devices.list,
                hash: `${DEVICES_HASH_DETAIL}-${id}`,
              }))
            }
            break

          case ViewTypes.DEVICE_SETTINGS:
            if (windowSize.value === 'xs') {
              if (typeof id !== 'undefined') {
                context.root.$bus.$emit('wait-page_reloading', 10)

                context.root.$router.push(context.root.localePath({
                  name: context.root.$routes.devices.detail,
                  params: {
                    id,
                  },
                  hash: DEVICES_HASH_SETTINGS,
                }))
              }

              return
            }
            break

          case ViewTypes.CHANNEL_SETTINGS:
            if (windowSize.value === 'xs') {
              if (typeof id !== 'undefined') {
                context.root.$bus.$emit('wait-page_reloading', 10)

                context.root.$router.push(context.root.localePath({
                  name: context.root.$routes.devices.detail,
                  params: {
                    id,
                  },
                  hash: DEVICES_HASH_SETTINGS,
                }))
              }

              return
            }
            break

          case ViewTypes.CONNECT:
            if (windowSize.value === 'xs') {
              context.root.$bus.$emit('wait-page_reloading', 10)

              context.root.$router.push(context.root.localePath(context.root.$routes.devices.connect))

              return
            }
            break
        }

        view[type].opened = true

        if (
          (
            type === ViewTypes.DEVICE_SETTINGS ||
            type === ViewTypes.CHANNEL_SETTINGS ||
            type === ViewTypes.DETAIL
          ) &&
          typeof id !== 'undefined'
        ) {
          view[type].id = id

          if (
            !Device.query().where('id', id).exists() &&
            !Channel.query().where('id', id).exists()
          ) {
            closeView(type)
          }
        }
      }
    }

    function openChannelSettings(device: DeviceInterface, channel: ChannelInterface) {
      openView(ViewTypes.CHANNEL_SETTINGS, channel.id)
    }

    // Double click and single click event handler
    function oneClick(event: UIEvent, item?: DeviceInterface) {
      const path = context.root.getEventElementsPath(event)

      const isButton = path.find((pathItem): boolean => {
        return 'getAttribute' in pathItem &&
          typeof pathItem.getAttribute === 'function' &&
          (
            pathItem.getAttribute('role') === 'button' ||
            pathItem.getAttribute('role') === 'dialog'
          )
      })

      if (isButton) {
        return
      }

      click.clicks++

      if (click.clicks === 1) {
        click.timer = window.setTimeout(() => {
          openView(ViewTypes.DETAIL, item?.id)

          click.clicks = 0
        }, click.delay)
      } else {
        window.clearTimeout(click.timer)

        click.clicks = 0

        openView(ViewTypes.DEVICE_SETTINGS, item?.id)
      }
    }

    // Check route and if is needed open detail window
    function checkRoute() {
      if (context.root.$route.hash !== '') {
        if (context.root.$route.hash.includes(DEVICES_HASH_DETAIL)) {
          openView(ViewTypes.DETAIL, context.root.$route.hash.substring(DEVICES_HASH_DETAIL.length + 1))
        }
      }
    }

    onBeforeMount((): void => {
      if (
        Device.query().count() === 0 &&
        !fetchingDevices.value &&
        !Device.getters('firstLoadFinished')()
      ) {
        Device.dispatch('fetch', {
          includeChannels: true,
        })
          .catch(() => {
            context.root.$nuxt.error({
              statusCode: 503,
              message: 'Something went wrong',
            })
          })
      }
    })

    onMounted((): void => {
      if (!fetchingDevices.value) {
        checkRoute()
      }

      // Hide overlay loader
      context.root.$bus.$emit('wait-page_reloading', false)

      isMounted.value = true
    })

    function synchroniseDevices(): void {
      // do sync here
    }

    watch(
      (): string => windowSize.value,
      (val): void => {
        if (val === 'xs') {
          if (view.detail.opened && view.detail.id !== null) {
            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.devices.detail,
              params: {
                id: view.detail.id,
              },
            }))
          } else if (view.deviceSettings.opened && view.deviceSettings.id !== null) {
            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.devices.detail,
              params: {
                id: view.deviceSettings.id,
              },
              hash: DEVICES_HASH_SETTINGS,
            }))
          } else if (view.connect.opened) {
            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.devices.connect,
            }))
          }
        }
      },
    )

    watch(
      (): boolean => fetchingDevices.value,
      (val): void => {
        if (!val) {
          checkRoute()
        }
      },
    )

    return {
      view,
      viewTypes: ViewTypes,
      isMounted,
      windowSize,
      devices,
      isLoading,
      noResults,
      openedDetail,
      openedDeviceSettings,
      openedChannelSettings,
      openView,
      openChannelSettings,
      closeView,
      oneClick,
      synchroniseDevices,
    }
  },

  head() {
    return {
      title: this.$t('meta.devices.list.title'),
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
