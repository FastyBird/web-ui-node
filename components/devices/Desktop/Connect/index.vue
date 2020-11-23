<template>
  <fb-ui-modal-form
    :lock-submit-button="remoteFormResult !== formResultTypes.NONE"
    :state="remoteFormResult"
    :submit-btn-text="submitBtnText"
    :submit-btn-show="submitBtnShow"
    :cancel-btn-text="cancelBtnText"
    :variant="modalVariant"
    :data-step="step"
    @submit="handleSubmit"
    @cancel="handleCancel"
    @close="handleClose"
    class="fb-devices-desktop-connect__container"
  >
    <fb-ui-modal-header
      slot="modal-header"
      :variant="modalVariant"
      :ok-btn-text="submitBtnText"
      :ok-btn-show="submitBtnShow"
      :cancel-btn-text="cancelBtnText"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @close="handleClose"
    >
      <template v-if="step === 1">
        <font-awesome-icon
          slot="icon"
          icon="microchip"
          class="fb-devices-desktop-connect__icon"
        />

        <template slot="heading">
          {{ $t('devices.heading.deviceBasicInfo') }}
        </template>

        <template slot="description">
          {{ $t('devices.texts.deviceBasicInfo') }}
        </template>
      </template>

      <template v-if="step === 2">
        <font-awesome-icon
          slot="icon"
          icon="satellite-dish"
          class="fb-devices-desktop-connect__icon"
        />

        <template slot="heading">
          {{ $t('devices.heading.connectionToServer') }}
        </template>

        <template slot="description">
          {{ $t('devices.texts.connectionToServer') }}
        </template>
      </template>

      <template v-if="step === 3">
        <font-awesome-icon
          slot="icon"
          icon="key"
          class="fb-devices-desktop-connect__icon"
        />

        <template slot="heading">
          {{ $t('devices.heading.accessCredentials') }}
        </template>

        <template slot="description">
          {{ $t('devices.texts.accessCredentials') }}
        </template>
      </template>

      <template v-if="step === 4">
        <font-awesome-icon
          slot="icon"
          icon="plug"
          class="fb-devices-desktop-connect__icon"
        />

        <template slot="heading">
          {{ $t('devices.heading.processingDevice') }}
        </template>

        <template slot="description">
          {{ $t('devices.texts.processingDevice') }}
        </template>
      </template>

      <template v-if="step === 5">
        <font-awesome-icon
          slot="icon"
          icon="check"
          class="fb-devices-desktop-connect__icon"
        />

        <template slot="heading">
          {{ $t('devices.heading.finished') }}
        </template>

        <template slot="description">
          {{ $t('devices.texts.finished') }}
        </template>
      </template>
    </fb-ui-modal-header>

    <div slot="form">
      <devices-connect-general
        v-if="step === 1 && device !== null"
        :device="device"
        :remote-form-submit.sync="remoteFormSubmit"
        @saved="handleNextStep"
        class="fb-devices-desktop-connect__step-1"
      />

      <devices-connect-communication-protocol
        v-if="step === 2"
        :protocol.sync="protocol"
        class="fb-devices-desktop-connect__step-2"
      />

      <devices-connect-credentials
        v-if="step === 3"
        :device="device"
        :remote-form-submit.sync="remoteFormSubmit"
        @saved="handleRegisterDevice"
        class="fb-devices-desktop-connect__step-3"
      />

      <div
        v-if="step === 4"
        :class="[{'fb-devices-desktop-connect__step-4-error': working.status === processingResults.ERROR}]"
        class="fb-devices-desktop-connect__step-4"
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
        class="fb-devices-desktop-connect__step-5"
      >
        <fb-ui-spinner :size="sizeTypes.LARGE" />

        <p>
          {{ $t('devices.texts.waitingForDevice') }}
        </p>
      </div>
    </div>
  </fb-ui-modal-form>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  SetupContext,
} from '@vue/composition-api'

import get from 'lodash/get'

import {
  FbFormResultTypes,
  FbSizeTypes,
  FbUiModalVariantTypes,
} from '@fastybird/web-ui-theme'

import DevicesConnectGeneral from '~/components/devices/Connect/General/index.vue'
import DevicesConnectCommunicationProtocol from '~/components/devices/Connect/CommunicationProtocol/index.vue'
import DevicesConnectCredentials from '~/components/devices/Connect/Credentials/index.vue'

import useDeviceConnect, { ProcessingResultTypes } from '~/components/devices/Connect/connect'

export default defineComponent({

  name: 'DevicesDesktopConnect',

  components: {
    DevicesConnectGeneral,
    DevicesConnectCommunicationProtocol,
    DevicesConnectCredentials,
  },

  setup(props: {}, context: SetupContext) {
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

    const submitBtnShow = computed<boolean>((): boolean => {
      return step.value !== 4 && step.value !== 5
    })

    const submitBtnText = computed<string>((): string => {
      if (step.value === 3) {
        return context.root.$t('application.buttons.done.title').toString()
      }

      return context.root.$t('application.buttons.next.title').toString()
    })

    const cancelBtnText = computed<string>((): string => {
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
      context.emit('close')
    }

    function handleSubmit(): void {
      switch (step.value) {
        case 1:
          remoteFormSubmit.value = true
          break

        case 2:
          handleNextStep()
          break

        case 3:
          remoteFormSubmit.value = true
          break
      }
    }

    function handleCancel(): void {
      switch (step.value) {
        case 1:
        case 5:
          handleClose()
          break

        case 2:
        case 3:
          handlePreviousStep()
          break
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
      initialiseDevice()
    })

    onUnmounted((): void => {
      destroyDevice()
    })

    return {
      step,
      remoteFormSubmit,
      remoteFormResult,
      working,
      protocol,
      device,
      submitBtnText,
      submitBtnShow,
      cancelBtnText,
      handleSubmit,
      handleCancel,
      handleClose,
      handleNextStep,
      handleRegisterDevice,
      modalVariant: !context.root.$windowSize.isExtraLarge() ? FbUiModalVariantTypes.TABLET : FbUiModalVariantTypes.DEFAULT,
      processingResults: ProcessingResultTypes,
      formResultTypes: FbFormResultTypes,
      sizeTypes: FbSizeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
