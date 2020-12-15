<template>
  <div :class="['fb-devices-list-view__container', {'fb-devices-list-view__container-loading': (isLoading)}]">
    <client-only>
      <fb-layout-header-menu-button
        :label="$t('application.buttons.menu.title')"
        @toggleMenu="$bus.$emit('toggle-menu')"
        type="button"
        small
        left
      />

      <fb-layout-header-button
        :label="$t('application.buttons.new.title')"
        @click="handleOpenView(viewTypes.CONNECT)"
        type="button"
        small
        right
      />

      <fb-layout-header-spacer small />

      <fb-ui-loading-box
        v-if="isLoading"
        class="fb-devices-list-view__loading"
      >
        <p>
          {{ $t('devices.texts.loadingDevices') }}
        </p>
      </fb-ui-loading-box>

      <devices-list-devices
        v-else
        :active-item="openedDetail"
        @open="handleOpenDetail"
        v-slot="{ previous, next, page, total }"
      >
        <devices-desktop-info
          v-if="!view.detail.opened || openedDetail === null"
          :total="total"
          @connect="handleOpenView(viewTypes.CONNECT)"
          @synchronise="handleSynchroniseDevices"
        />

        <devices-desktop-detail
          v-else
          :id="openedDetail"
          :page="page"
          :total="total"
          @close="handleCloseDetail"
          @previous="handleOpenPreviousItem(previous)"
          @next="handleOpenNextItem(next)"
          @removed="handleCloseDetail"
        />
      </devices-list-devices>

      <devices-desktop-connect
        v-if="view.connect.opened && !$windowSize.isExtraSmall()"
        @close="handleCloseView(viewTypes.CONNECT)"
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
  onMounted,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import {
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import {
  DEVICES_HASH_CONNECT,
  DEVICES_HASH_DETAIL,
} from '~/configuration/routes'

import Device from '~/models/devices-module/devices/Device'

import DevicesListDevices from '~/components/devices/ListDevices/index.vue'

import DevicesDesktopDetail from '~/components/devices/Desktop/Detail/index.vue'
import DevicesDesktopInfo from '~/components/devices/Desktop/Info/index.vue'
import DevicesDesktopConnect from '~/components/devices/Desktop/Connect/index.vue'

enum ViewTypes {
  CONNECT = 'connect',
  DETAIL = 'detail',
}

interface DevicesIndexPageViewInterface {
  connect: {
    opened: boolean
  }
  detail: {
    opened: boolean
  }
}

export default defineComponent({

  name: 'DevicesIndexPage',

  components: {
    DevicesListDevices,

    DevicesDesktopDetail,
    DevicesDesktopInfo,
    DevicesDesktopConnect,
  },

  transition: 'fade',

  setup(props: {}, context: SetupContext) {
    const isMounted = ref<boolean>(false)

    const view = reactive<DevicesIndexPageViewInterface>({
      connect: {
        opened: false,
      },
      detail: {
        opened: false,
      },
    })

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const fetchingDevices = computed<boolean>((): boolean => Device.getters('fetching')())

    const devicesCount = computed<number>((): number => Device.query().count())

    const isLoading = computed<boolean>((): boolean => fetchingDevices.value)

    const openedDetail = ref<string | null>(null)

    context.root.$store.dispatch('app/setHeading', {
      heading: context.root.$t('devices.headings.allDevices'),
      subHeading: context.root.$tc('devices.subHeadings.allDevices', devicesCount.value, { count: devicesCount.value }),
      icon: 'magic',
    }, {
      root: true,
    })

    function handleCloseView(type: ViewTypes) {
      if (Object.prototype.hasOwnProperty.call(view, type)) {
        switch (type) {
          case ViewTypes.DETAIL:
            view.detail.opened = false

            context.root.$router.push(context.root.localePath(context.root.$routes.devices.list))
            break

          case ViewTypes.CONNECT:
            view.connect.opened = false

            context.root.$router.push(context.root.localePath(context.root.$routes.devices.list))
            break
        }
      }
    }

    function handleOpenView(type: ViewTypes) {
      if (Object.prototype.hasOwnProperty.call(view, type)) {
        switch (type) {
          case ViewTypes.DETAIL:
            if (openedDetail.value) {
              if (context.root.$windowSize.isExtraSmall()) {
                context.root.$router.push(context.root.localePath({
                  name: context.root.$routes.devices.detail,
                  params: {
                    id: openedDetail.value,
                  },
                }))
              } else {
                context.root.$router.push(context.root.localePath({
                  name: context.root.$routes.devices.list,
                  hash: `${DEVICES_HASH_DETAIL}-${openedDetail.value}`,
                }))
              }
            }
            break

          case ViewTypes.CONNECT:
            if (context.root.$windowSize.isExtraSmall()) {
              context.root.$router.push(context.root.localePath(context.root.$routes.devices.connect))
            } else {
              context.root.$router.push(context.root.localePath({
                name: context.root.$routes.devices.list,
                hash: DEVICES_HASH_CONNECT,
              }))
            }
            break
        }

        view[type].opened = true
      }
    }

    function handleCloseDetail(): void {
      openedDetail.value = null

      handleCloseView(ViewTypes.DETAIL)
    }

    function handleOpenDetail(id: string): void {
      if (Device.query().where('id', id).exists()) {
        openedDetail.value = id

        handleOpenView(ViewTypes.DETAIL)
      }
    }

    function handleOpenPreviousItem(id: string | null): void {
      if (id !== null) {
        handleOpenDetail(id)
      }
    }

    function handleOpenNextItem(id: string | null): void {
      if (id !== null) {
        handleOpenDetail(id)
      }
    }

    function checkRoute() {
      if (context.root.$route.hash !== '') {
        if (context.root.$route.hash.includes(DEVICES_HASH_DETAIL)) {
          handleOpenDetail(context.root.$route.hash.substring(DEVICES_HASH_DETAIL.length + 1))
        } else if (context.root.$route.hash.includes(DEVICES_HASH_CONNECT)) {
          handleOpenView(ViewTypes.CONNECT)
        }
      }
    }

    function handleSynchroniseDevices(): void {
      // TODO: do sync here
    }

    onMounted((): void => {
      if (!fetchingDevices.value) {
        checkRoute()
      }

      context.root.$bus.$emit('wait-page_reloading', false)

      isMounted.value = true
    })

    watch(
      (): string => windowSize.value,
      (val): void => {
        if (val === FbSizeTypes.EXTRA_SMALL && isMounted.value) {
          if (view.detail.opened && openedDetail.value !== null) {
            context.root.$router.push(context.root.localePath({
              name: context.root.$routes.devices.detail,
              params: {
                id: openedDetail.value,
              },
            }))
          } else if (view.connect.opened) {
            handleCloseView(ViewTypes.CONNECT)

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

    watch(
      () => devicesCount.value,
      (val): void => {
        context.root.$store.dispatch('app/setHeading', {
          heading: context.root.$t('devices.headings.allDevices'),
          subHeading: context.root.$tc('devices.subHeadings.allDevices', val, { count: val }),
          icon: 'plug',
        }, {
          root: true,
        })
      },
    )

    return {
      view,
      isLoading,
      openedDetail,
      handleOpenDetail,
      handleCloseDetail,
      handleOpenView,
      handleCloseView,
      handleSynchroniseDevices,
      handleOpenPreviousItem,
      handleOpenNextItem,
      viewTypes: ViewTypes,
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
