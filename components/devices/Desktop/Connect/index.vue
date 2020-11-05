<template>
  <fb-ui-modal-form
    :lock-submit-button="remoteFormResult !== formResultTypes.NONE"
    :state="remoteFormResult"
    class="fb-devices-desktop-connect__container"
    @cancel="closeWindow"
    @close="closeWindow"
  >
    <fb-ui-modal-header
      v-if="step === 1"
      slot="modal-header"
      @close="closeWindow"
    >
      <font-awesome-icon
        slot="icon"
        icon="microchip"
        class="fb-devices-desktop-connect__icon"
      />

      <template slot="heading">
        Device basic info
      </template>

      <template slot="description">
        Provide basic information about your new device to identify it in the system
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      v-if="step === 2"
      slot="modal-header"
      @close="closeWindow"
    >
      <font-awesome-icon
        slot="icon"
        icon="satellite-dish"
        class="fb-devices-desktop-connect__icon"
      />

      <template slot="heading">
        Connection to server
      </template>

      <template slot="description">
        Choose one from listed options how your new device will be connected to the server
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      v-if="step === 3"
      slot="modal-header"
      @close="closeWindow"
    >
      <font-awesome-icon
        slot="icon"
        icon="key"
        class="fb-devices-desktop-connect__icon"
      />

      <template slot="heading">
        Access credentials
      </template>

      <template slot="description">
        Provide device server access credentials
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      v-if="step === 4"
      slot="modal-header"
      @close="closeWindow"
    >
      <font-awesome-icon
        slot="icon"
        icon="plug"
        class="fb-devices-desktop-connect__icon"
      />

      <template slot="heading">
        Processing
      </template>

      <template slot="description">
        Your new device is now going to be registered on server
      </template>
    </fb-ui-modal-header>

    <fb-ui-modal-header
      v-if="step === 5"
      slot="modal-header"
      @close="closeWindow"
    >
      <font-awesome-icon
        slot="icon"
        icon="check"
        class="fb-devices-desktop-connect__icon"
      />

      <template slot="heading">
        Finished
      </template>

      <template slot="description">
        Your new device is now allowed to connect to the server
      </template>
    </fb-ui-modal-header>

    <div
      slot="form"
      class="fb-devices-desktop-connect__content"
    >
      <fb-ui-transition-expand>
        <div
          v-if="step === 1"
          class="fb-devices-desktop-connect__step-1"
        >
          <devices-connect-general
            v-if="device !== null"
            :device="device"
            :remote-submit.sync="remoteSubmit"
            @saved="nextStep"
          />
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <div
          v-if="step === 2"
          class="fb-devices-desktop-connect__step-2"
        >
          <devices-select-protocol :protocol.sync="protocol" />
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <div
          v-if="step === 3"
          class="fb-devices-desktop-connect__step-3"
        >
          <devices-connect-credentials
            :device="device"
            :remote-submit.sync="remoteSubmit"
            @saved="registerDevice"
          />
        </div>
      </fb-ui-transition-expand>

      <fb-ui-transition-expand>
        <div
          v-if="step === 4"
          class="fb-devices-desktop-connect__step-4"
        >
          <div
            v-if="working.status === processingResults.REGISTERING"
            class="fb-devices-desktop-connect__step-4-working"
          >
            <fb-ui-spinner size="lg" />

            <p>
              Registering device...
            </p>
          </div>

          <div
            v-else-if="working.status === processingResults.GRANTING_ACCESS"
            class="fb-devices-desktop-connect__step-4-working"
          >
            <fb-ui-spinner size="lg" />

            <p>
              Granting access to the server...
            </p>
          </div>

          <div
            v-else-if="working.status === processingResults.ERROR"
            class="fb-devices-desktop-connect__step-4-error"
          >
            <font-awesome-icon icon="exclamation-triangle" />

            <p>
              Something went wrong, device could not be registered
            </p>
          </div>
        </div>

        <div
          v-if="step === 5"
          class="fb-devices-desktop-connect__step-5"
        >
          <div class="fb-devices-desktop-connect__step-5-success">
            <fb-ui-spinner size="lg" />

            <p>
              Waiting for the device to connect to the server...
            </p>
          </div>
        </div>
      </fb-ui-transition-expand>
    </div>

    <template slot="modal-footer">
      <template v-if="step === 1">
        <fb-ui-button
          uppercase
          variant="link"
          size="lg"
          name="close"
          @click.prevent="$emit('close')"
        >
          {{ $t('application.buttons.close.title') }}
        </fb-ui-button>

        <fb-ui-button
          uppercase
          variant="outline-primary"
          size="lg"
          name="save"
          @click.prevent="submitBasicInfoForm"
        >
          {{ $t('application.buttons.next.title') }}
        </fb-ui-button>
      </template>

      <template v-if="step === 2">
        <fb-ui-button
          uppercase
          variant="link"
          size="lg"
          name="back"
          @click.prevent="previousStep"
        >
          {{ $t('application.buttons.back.title') }}
        </fb-ui-button>

        <fb-ui-button
          uppercase
          variant="outline-primary"
          size="lg"
          name="save"
          @click.prevent="nextStep"
        >
          {{ $t('application.buttons.next.title') }}
        </fb-ui-button>
      </template>

      <template v-if="step === 3">
        <fb-ui-button
          uppercase
          variant="link"
          size="lg"
          name="back"
          @click.prevent="previousStep"
        >
          {{ $t('application.buttons.back.title') }}
        </fb-ui-button>

        <fb-ui-button
          uppercase
          variant="outline-primary"
          size="lg"
          name="save"
          @click.prevent="submitCredentialsForm"
        >
          {{ $t('application.buttons.add.title') }}
        </fb-ui-button>
      </template>

      <template v-if="step === 4">
        <fb-ui-button
          :disabled="working.status !== processingResults.ERROR"
          uppercase
          variant="link"
          size="lg"
          name="close"
          @click.prevent="$emit('close')"
        >
          {{ $t('application.buttons.close.title') }}
        </fb-ui-button>
      </template>

      <template v-if="step === 5">
        <fb-ui-button
          uppercase
          variant="link"
          size="lg"
          name="close"
          @click.prevent="$emit('close')"
        >
          {{ $t('application.buttons.close.title') }}
        </fb-ui-button>
      </template>
    </template>
  </fb-ui-modal-form>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  SetupContext,
} from '@vue/composition-api'

import get from 'lodash/get'
import uuid from 'uuid'

import { FbFormResultType } from '@fastybird/web-ui-theme'

import Device from '~/models/devices-node/devices/Device'
import {
  DeviceEntityTypeType,
  DeviceInterface,
} from '~/models/devices-node/devices/types'

import Account from '~/models/auth-node/accounts/Account'
import Identity from '~/models/auth-node/identities/Identity'

import DevicesConnectGeneral from '~/components/devices/Connect/General/index.vue'
import DevicesSelectProtocol, { ProtocolType } from '~/components/devices/Connect/SelectProtocol/index.vue'
import DevicesConnectCredentials from '~/components/devices/Connect/Credentials/index.vue'

enum ProcessingResultType {
  NONE = 'none',
  REGISTERING = 'registering',
  GRANTING_ACCESS = 'granting_access',
  ERROR = 'error',
  OK = 'ok',
}

export default defineComponent({

  name: 'DevicesDesktopConnect',

  components: {
    DevicesConnectGeneral,
    DevicesSelectProtocol,
    DevicesConnectCredentials,
  },

  setup(props: { }, context: SetupContext) {
    const deviceId = uuid.v4().toString()

    const step = ref<number>(1)

    const protocol = ref<ProtocolType>(ProtocolType.MQTT)

    const remoteSubmit = ref<boolean>(false)
    const remoteFormResult = ref<FbFormResultType>(FbFormResultType.NONE)

    const working = reactive({
      status: ProcessingResultType.NONE,
      loadAccountAttempts: 0,
    })

    const device = computed<DeviceInterface | null>((): DeviceInterface | null => {
      return Device.find(deviceId)
    })

    onMounted((): void => {
      Device.dispatch('add', {
        id: deviceId,
        draft: true,
        data: {
          type: DeviceEntityTypeType.PHYSICAL,
          identifier: uuid.v4().toString(), // Random identifier also used as client id for MQTT
        },
      })
    })

    onUnmounted((): void => {
      if (device.value !== null && device.value.draft) {
        const account = Account.find(device.value.id)

        if (account !== null) {
          const identity = Identity.query().where('accountId', account.id).first()

          if (identity !== null) {
            Identity.dispatch('remove', {
              identity,
            })
          }

          Account.dispatch('remove', {
            account,
          })
        }

        Device.dispatch('remove', {
          device: device.value,
        })
      }
    })

    // Processing timer
    let timer: number

    function previousStep(): void {
      step.value--

      if (step.value < 1) {
        step.value = 1
      }
    }

    function nextStep(): void {
      step.value++

      if (step.value > 5) {
        step.value = 5
      }
    }

    function submitBasicInfoForm(): void {
      remoteSubmit.value = true
    }

    function submitCredentialsForm(): void {
      remoteSubmit.value = true
    }

    async function grantAccess(): Promise<void> {
      try {
        working.status = ProcessingResultType.GRANTING_ACCESS

        const identity = Identity.query().where('accountId', deviceId).first()

        if (identity !== null) {
          await Identity.dispatch('save', {
            identity,
          })

          working.status = ProcessingResultType.OK

          nextStep()
        } else {
          // Device could not be granted access
          await Device.dispatch('remove', {
            device: device.value,
          })
        }
      } catch (e) {
        // Device could not be granted access
        await Device.dispatch('remove', {
          device: device.value,
        })

        if (get(e, 'exception', null) !== null) {
          context.root.handleException(e.exception, context.root.$t('devices.messages.deviceNotAdded').toString())
        } else {
          context.root.$flashMessage(context.root.$t('devices.messages.deviceNotAdded').toString(), 'error')
        }

        working.status = ProcessingResultType.ERROR
      }
    }

    async function checkAccount(): Promise<void> {
      window.clearInterval(timer)

      try {
        working.loadAccountAttempts++

        await Account.dispatch('get', {
          id: deviceId,
        })

        await grantAccess()
      } catch (e) {
        if (working.loadAccountAttempts <= 5) {
          timer = window.setInterval(checkAccount, 2000)
        } else {
          // Device account could not be loaded
          await Device.dispatch('remove', {
            device: device.value,
          })

          working.status = ProcessingResultType.ERROR
        }
      }
    }

    async function registerDevice(): Promise<void> {
      nextStep()

      if (device.value !== null) {
        working.status = ProcessingResultType.REGISTERING

        try {
          await Device.dispatch('save', {
            device: device.value,
          })

          timer = window.setInterval(checkAccount, 2000)
        } catch (e) {
          await Device.dispatch('remove', {
            device: device.value,
          })

          if (get(e, 'exception', null) !== null) {
            context.root.handleException(e.exception, context.root.$t('devices.messages.deviceNotAdded').toString())
          } else {
            context.root.$flashMessage(context.root.$t('devices.messages.deviceNotAdded').toString(), 'error')
          }

          working.status = ProcessingResultType.ERROR
        }
      } else {
        working.status = ProcessingResultType.ERROR
      }
    }

    // Close opened window
    function closeWindow(): void {
      context.emit('close')
    }

    return {
      step,
      remoteSubmit,
      remoteFormResult,
      protocol,
      working,
      device,
      processingResults: ProcessingResultType,
      previousStep,
      nextStep,
      submitBasicInfoForm,
      submitCredentialsForm,
      registerDevice,
      closeWindow,
      formResultTypes: FbFormResultType,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
