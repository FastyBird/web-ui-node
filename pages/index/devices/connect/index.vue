<template>
  <div class="fb-devices-connect-view__container">
    <client-only>
      <fb-layout-header-button
        :label="leftBtnText"
        :type="menuItemTypes.BUTTON"
        @click="handleLeftBtnCallback"
        small
        left
      />

      <fb-layout-header-button
        v-if="rightBtnShow"
        :label="rightBtnText"
        :type="menuItemTypes.BUTTON"
        @click="handleRightBtnCallback"
        small
        right
      />

      <fb-layout-header-spacer small />

      <devices-connect-general
        v-if="step === 1 && device !== null"
        :device="device"
        :remote-form-submit.sync="remoteFormSubmit"
        @saved="handleNextStep"
        class="fb-devices-connect-view__step-1"
      />

      <devices-connect-communication-protocol
        v-if="step === 2"
        :protocol.sync="protocol"
        class="fb-devices-connect-view__step-2"
      />

      <devices-connect-credentials
        v-if="step === 3"
        :device="device"
        :remote-form-submit.sync="remoteFormSubmit"
        @saved="handleRegisterDevice"
        class="fb-devices-connect-view__step-3"
      />

      <div
        v-if="step === 4"
        :class="[{'fb-devices-connect-view__step-4-error': working.status === processingResults.ERROR}]"
        class="fb-devices-connect-view__step-4"
      >
        <template v-if="working.status === processingResults.REGISTERING">
          <fb-ui-spinner :size="sizeTypes.LARGE" />

          <p>
            {{ $t('devices.texts.registeringDevice') }}
          </p>
        </template>

        <template v-else-if="working.status === processingResults.GRANTING_ACCESS">
          <fb-ui-spinner :size="sizeTypes.LARGE" />

          <p>
            {{ $t('devices.texts.grantingAccess') }}
          </p>
        </template>

        <template v-else-if="working.status === processingResults.ERROR">
          <font-awesome-icon icon="exclamation-triangle" />

          <p>
            {{ $t('devices.texts.registeringDeviceError') }}
          </p>
        </template>
      </div>

      <div
        v-if="step === 5"
        class="fb-devices-connect-view__step-5"
      >
        <fb-ui-spinner :size="sizeTypes.LARGE" />

        <p>
          {{ $t('devices.texts.waitingForDevice') }}
        </p>
      </div>

      <fb-ui-loading-box slot="placeholder">
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
  onMounted,
  onUnmounted,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import get from 'lodash/get'

import {
  FbFormResultTypes,
  FbMenuItemTypes,
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import DevicesConnectGeneral from '~/components/devices/Connect/General/index.vue'
import DevicesConnectCommunicationProtocol from '~/components/devices/Connect/CommunicationProtocol/index.vue'
import DevicesConnectCredentials from '~/components/devices/Connect/Credentials/index.vue'

import useDeviceConnect, { ProcessingResultTypes } from '~/components/devices/Connect/connect'

import {
  DEVICES_HASH_CONNECT,
} from '~/configuration/routes'

export default defineComponent({

  name: 'DeviceConnectPage',

  transition: 'fade',

  components: {
    DevicesConnectGeneral,
    DevicesConnectCommunicationProtocol,
    DevicesConnectCredentials,
  },

  setup(props: {}, context: SetupContext) {
    const isMounted = ref<boolean>(false)

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    const remoteFormSubmit = ref<boolean>(false)

    const remoteFormResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const {
      step,
      protocol,
      working,
      device,
      registerDevice,
      initialiseDevice,
      destroyDevice,
    } = useDeviceConnect()

    const rightBtnShow = computed<boolean>((): boolean => {
      return step.value !== 4 && step.value !== 5
    })

    const rightBtnText = computed<string>((): string => {
      if (step.value === 3) {
        return context.root.$t('application.buttons.done.title').toString()
      }

      return context.root.$t('application.buttons.next.title').toString()
    })

    const leftBtnText = computed<string>((): string => {
      switch (step.value) {
        case 1:
        case 4:
          return context.root.$t('application.buttons.cancel.title').toString()

        case 5:
          return context.root.$t('application.buttons.close.title').toString()

        default:
          return context.root.$t('application.buttons.back.title').toString()
      }
    })

    function setHeading(): void {
      context.root.$store.dispatch('app/setHeading', {
        heading: context.root.$t('devices.headings.deviceBasicInfo'),
        subHeading: context.root.$t('devices.subHeadings.deviceBasicInfo'),
        icon: 'plug',
      }, {
        root: true,
      })
    }

    function handlePreviousStep(): void {
      step.value--

      if (step.value <= 0) {
        step.value = 1
      }
    }

    function handleNextStep(): void {
      step.value++

      if (step.value > 5) {
        step.value = 5
      }
    }

    function handleClose(): void {
      context.root.$router.push(context.root.localePath(context.root.$routes.devices.list))
    }

    function handleRightBtnCallback(): void {
      if (step.value === 1) {
        remoteFormSubmit.value = true
      } else if (step.value === 2) {
        step.value++
      } else if (step.value === 3) {
        remoteFormSubmit.value = true
      }
    }

    function handleLeftBtnCallback(): void {
      if (step.value === 1) {
        handleClose()
      } else if (step.value === 2) {
        handlePreviousStep()
      } else if (step.value === 3) {
        handlePreviousStep()
      } else if (step.value === 4) {
        // TODO: process cancel process
      } else if (step.value === 5) {
        handleClose()
      }
    }

    async function handleRegisterDevice(): Promise<void> {
      handleNextStep()

      try {
        await registerDevice()

        handleNextStep()
      } catch (e) {
        if (get(e, 'exception', null) !== null) {
          context.root.handleException(e.exception, context.root.$t('devices.messages.deviceNotAdded').toString())
        } else {
          context.root.$flashMessage(context.root.$t('devices.messages.deviceNotAdded').toString(), 'error')
        }
      }
    }

    onMounted((): void => {
      isMounted.value = true

      context.root.$bus.$emit('wait-page_reloading', false)

      initialiseDevice()
    })

    onUnmounted((): void => {
      destroyDevice()
    })

    watch(
      (): string => step.value,
      (val): void => {
        switch (val) {
          case 1:
            context.root.$store.dispatch('app/setHeading', {
              heading: context.root.$t('devices.headings.deviceBasicInfo'),
              subHeading: context.root.$t('devices.subHeadings.deviceBasicInfo'),
              icon: 'plug',
            }, {
              root: true,
            })
            break

          case 2:
            context.root.$store.dispatch('app/setHeading', {
              heading: context.root.$t('devices.headings.connectionToServer'),
              subHeading: context.root.$t('devices.subHeadings.connectionToServer'),
              icon: 'plug',
            }, {
              root: true,
            })
            break

          case 3:
            context.root.$store.dispatch('app/setHeading', {
              heading: context.root.$t('devices.headings.accessCredentials'),
              subHeading: context.root.$t('devices.subHeadings.accessCredentials'),
              icon: 'plug',
            }, {
              root: true,
            })
            break

          case 4:
            context.root.$store.dispatch('app/setHeading', {
              heading: context.root.$t('devices.headings.processingDevice'),
              subHeading: context.root.$t('devices.subHeadings.processingDevice'),
              icon: 'plug',
            }, {
              root: true,
            })
            break

          case 5:
            context.root.$store.dispatch('app/setHeading', {
              heading: context.root.$t('devices.headings.finished'),
              subHeading: context.root.$t('devices.subHeadings.finished'),
              icon: 'plug',
            }, {
              root: true,
            })
            break
        }
      },
    )

    watch(
      (): string => windowSize.value,
      (val): void => {
        if (val !== FbSizeTypes.EXTRA_SMALL && isMounted.value) {
          context.root.$router.push(context.root.localePath({
            name: context.root.$routes.devices.list,
            hash: `${DEVICES_HASH_CONNECT}`,
          }))
        }
      },
    )

    setHeading()

    return {
      step,
      remoteFormSubmit,
      remoteFormResult,
      working,
      protocol,
      device,
      leftBtnText,
      rightBtnText,
      rightBtnShow,
      handleRightBtnCallback,
      handleLeftBtnCallback,
      handleNextStep,
      handleRegisterDevice,
      processingResults: ProcessingResultTypes,
      menuItemTypes: FbMenuItemTypes,
      sizeTypes: FbSizeTypes,
    }
  },

  head() {
    return {
      title: this.$t('meta.devices.connect.title'),
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
