<template>
  <div :class="['fb-devices-detail-view__container', {'fb-devices-detail-view__container-loading': (isLoading)}]">
    <client-only>
      <fb-ui-loading-box
        v-if="isLoading"
        class="fb-devices-detail-view__loading"
      >
        <p>
          {{ $t('devices.texts.loadingDevice') }}
        </p>
      </fb-ui-loading-box>

      <template v-else>
        <fb-layout-header-button
          v-if="!view.settings.opened"
          :type="menuItemTypes.BUTTON"
          @click="handleCloseView(viewTypes.DETAIL)"
          small
          left
        >
          <template slot="icon">
            <font-awesome-icon icon="angle-left" />
          </template>
        </fb-layout-header-button>

        <fb-layout-header-button
          v-if="view.settings.opened"
          :label="$t('application.buttons.cancel.title')"
          :type="menuItemTypes.BUTTON"
          @click="handleCloseView(viewTypes.SETTINGS)"
          small
          left
        />

        <fb-layout-header-button
          v-if="!view.settings.opened"
          :label="$t('application.buttons.edit.title')"
          :type="menuItemTypes.BUTTON"
          @click="handleOpenView(viewTypes.SETTINGS)"
          small
          right
        />

        <fb-layout-header-button
          v-if="view.settings.opened"
          :label="$t('application.buttons.done.title')"
          :type="menuItemTypes.BUTTON"
          @click="handleSubmitUpdate"
          small
          right
        />

        <fb-layout-header-spacer small />

        <expandable-box :show="view.detail.opened">
          <devices-detail
            :device="device"
          />
        </expandable-box>

        <expandable-box :show="view.settings.opened">
          <devices-phone-settings-device
            :device="device"
            :remote-form-submit.sync="remoteFormSubmit"
            :remote-form-result.sync="remoteFormResult"
            :remote-form-reset.sync="remoteFormReset"
            @removed="handleDeviceRemoved"
            class="fb-devices-detail-view__container-settings"
          />
        </expandable-box>
      </template>

      <fb-ui-loading-box
        slot="placeholder"
        class="fb-devices-list-view__loading"
      >
        <p>
          {{ $t('devices.texts.loadingDevice') }}
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

import get from 'lodash/get'

import {
  FbFormResultTypes,
  FbSizeTypes,
  FbMenuItemTypes,
} from '@fastybird/web-ui-theme'

import {
  DEVICES_HASH_DETAIL,
  DEVICES_HASH_SETTINGS,
} from '~/configuration/routes'

import Device from '~/models/devices-module/devices/Device'
import { DeviceInterface } from '~/models/devices-module/devices/types'

import DevicesDetail from '~/components/devices/Detail/index.vue'

import DevicesPhoneSettingsDevice from '~/components/devices/Phone/Settings/Device/index.vue'

enum ViewTypes {
  DETAIL = 'detail',
  SETTINGS = 'settings',
}

export default defineComponent({

  name: 'DeviceDetailPage',

  transition: 'fade',

  components: {
    DevicesDetail,

    DevicesPhoneSettingsDevice,
  },

  setup(props: {}, context: SetupContext) {
    if (!context.root.$validateUUID(context.root.$route.params.id)) {
      context.root.$nuxt.error({
        statusCode: 404,
        message: 'Device Not Found',
      })
    }

    const view = reactive({
      detail: {
        opened: !context.root.$route.hash.includes(DEVICES_HASH_SETTINGS),
      },
      settings: {
        opened: context.root.$route.hash.includes(DEVICES_HASH_SETTINGS),
      },
    })

    const detailComponent = ref<HTMLElement | null>(null)

    const settingsComponent = ref<HTMLElement | null>(null)

    const isMounted = ref<boolean>(false)

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const device = computed<DeviceInterface | null>((): DeviceInterface | null => {
      return Device
        .query()
        .with('device')
        .with('channels')
        .where('id', context.root.$route.params.id)
        .first()
    })

    const fetchingDevices = computed<boolean>((): boolean => Device.getters('fetching')())

    const fetchingDevice = computed<boolean>((): boolean => Device.getters('getting')(context.root.$route.params.id))

    const isLoading = computed<boolean>((): boolean => fetchingDevices.value || fetchingDevice.value || device.value === null)

    const remoteFormSubmit = ref<boolean>(false)

    const remoteFormResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const remoteFormReset = ref<boolean>(false)

    function handleDeviceRemoved(): void {
      context.root.$router.push(context.root.localePath(context.root.$routes.devices.list))
    }

    function handleOpenView(type: ViewTypes): void {
      switch (type) {
        case ViewTypes.DETAIL:
          break

        case ViewTypes.SETTINGS:
          view.detail.opened = false

          remoteFormReset.value = true

          context.root.$nextTick((): void => {
            view.settings.opened = true

            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.devices.detail,
              params: {
                id: context.root.$route.params.id,
              },
              hash: DEVICES_HASH_SETTINGS,
            }))
          })
          break
      }
    }

    function handleCloseView(type: ViewTypes): void {
      switch (type) {
        case ViewTypes.DETAIL:
          context.root.$router.push(context.root.localePath({ name: context.root.$routes.devices.list }))
          break

        case ViewTypes.SETTINGS:
          view.detail.opened = true

          context.root.$nextTick((): void => {
            view.settings.opened = false

            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.devices.detail,
              params: {
                id: context.root.$route.params.id,
              },
            }))
          })
          break
      }
    }

    function handleSubmitUpdate(): void {
      remoteFormSubmit.value = true
    }

    onBeforeMount((): void => {
      if (
        Device.query().count() === 0 &&
        !fetchingDevices.value &&
        !fetchingDevice.value &&
        !Device.getters('firstLoadFinished')()
      ) {
        Device.dispatch('get', {
          id: context.root.$route.params.id,
          includeChannels: true,
        })
          .catch((e): void => {
            if (get(e, 'exception.response.status', 0) === 404) {
              context.root.$nuxt.error({
                statusCode: 404,
                message: 'Device Not Found',
              })
            } else {
              context.root.$nuxt.error({
                statusCode: 503,
                message: 'Something went wrong',
              })
            }
          })
      }

      if (!fetchingDevice.value && device.value === null) {
        context.root.$nuxt.error({
          statusCode: 404,
          message: 'Device Not Found',
        })
      }
    })

    onMounted((): void => {
      isMounted.value = true

      context.root.$bus.$emit('wait-page_reloading', false)
    })

    watch(
      (): string => windowSize.value,
      (val): void => {
        if (val !== FbSizeTypes.EXTRA_SMALL && isMounted.value) {
          context.root.$router.push(context.root.localePath({
            name: context.root.$routes.devices.list,
            hash: `${DEVICES_HASH_DETAIL}-${context.root.$route.params.id}`,
          }))
        }
      },
    )

    watch(
      (): boolean => fetchingDevice.value,
      (val): void => {
        if (!val && device.value === null && isMounted.value) {
          context.root.$nuxt.error({
            statusCode: 404,
            message: 'Device Not Found',
          })
        }
      },
    )

    watch(
      (): DeviceInterface | null => device.value,
      (val): void => {
        if (val !== null) {
          context.root.$store.dispatch('app/setHeading', {
            heading: val.name,
            subHeading: val.comment,
            icon: device.value ? device.value.icon : null,
          }, {
            root: true,
          })
        }
      },
    )

    watch(
      (): FbFormResultTypes => remoteFormResult.value,
      (val): void => {
        if (val === FbFormResultTypes.WORKING && isMounted.value) {
          handleCloseView(ViewTypes.SETTINGS)
        }
      },
    )

    return {
      id: context.root.$route.params.id,
      view,
      isMounted,
      device,
      isLoading,
      fetchingDevices,
      fetchingDevice,
      detailComponent,
      settingsComponent,
      remoteFormSubmit,
      remoteFormResult,
      remoteFormReset,
      handleOpenView,
      handleCloseView,
      handleSubmitUpdate,
      handleDeviceRemoved,
      viewTypes: ViewTypes,
      menuItemTypes: FbMenuItemTypes,
    }
  },

  // @ts-ignore
  validate({ app, params }) {
    return app.$validateUUID(params.id)
  },

  head() {
    return {
      title: this.$t('meta.devices.detail.title', { device: this._.get(this.device, 'name') }),
    }
  },

  meta: {
    hideTabs: true,
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
