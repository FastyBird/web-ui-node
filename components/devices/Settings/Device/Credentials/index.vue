<template>
  <validation-observer
    v-if="identity !== null"
    ref="validator"
    v-slot="{ handleSubmit }"
  >
    <fb-ui-modal-form
      :transparent-bg="transparentBg"
      :lock-submit-button="form.result !== formResultTypes.NONE"
      :state="form.result"
      @submit="handleSubmit(submit)"
      @cancel="close"
      @close="close"
    >
      <fb-ui-modal-header-icon slot="icon">
        <font-awesome-icon icon="key" />
      </fb-ui-modal-header-icon>

      <template slot="header">
        {{ $t('devices.headings.credentials') }}
      </template>

      <template slot="form">
        <fb-ui-content mb="lg">
          <fb-form-input
            v-model="form.model.username"
            :label="$t('devices.fields.username.title')"
            :readonly="true"
            :tab-index="2"
            name="username"
          />
        </fb-ui-content>

        <fb-ui-content mb="lg">
          <validation-provider
            v-slot="{ errors }"
            name="password"
            rules="required"
          >
            <fb-form-input
              v-model="form.model.password"
              :error="errors[0]"
              :has-error="errors.length > 0"
              :label="$t('devices.fields.password.title')"
              :required="true"
              :tab-index="3"
              name="password"
            />
          </validation-provider>
        </fb-ui-content>

        <hr>

        <div class="fb-devices-settings-device-credentials__server">
          <div>
            <fb-form-input
              v-model="form.model.mqtt.server"
              :label="$t('devices.fields.mqtt.server.title')"
              :readonly="true"
              :tab-index="8"
              name="server"
            />
          </div>

          <div>
            <fb-form-input
              v-model="form.model.mqtt.port"
              :label="$t('devices.fields.mqtt.port.title')"
              :readonly="true"
              :tab-index="9"
              name="port"
            />
          </div>
        </div>

        <fb-ui-divider>
          {{ $t('application.misc.or') }}
        </fb-ui-divider>

        <div class="fb-devices-settings-device-credentials__server">
          <div>
            <fb-form-input
              v-model="form.model.mqtt.server"
              :label="$t('devices.fields.mqtt.server.title')"
              :readonly="true"
              :tab-index="10"
              name="secured_server"
            />
          </div>

          <div>
            <fb-form-input
              v-model="form.model.mqtt.securedPort"
              :label="$t('devices.fields.mqtt.securedPort.title')"
              :readonly="true"
              :tab-index="11"
              name="secured_port"
            />
          </div>
        </div>
      </template>
    </fb-ui-modal-form>
  </validation-observer>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  PropType,
  reactive,
  SetupContext,
  watch,
} from '@vue/composition-api'

import get from 'lodash/get'
import {
  ValidationProvider,
  ValidationObserver,
  extend,
  localize,
} from 'vee-validate'

import { FbFormResultType } from '@fastybird/web-ui-theme'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import Identity from '~/models/auth-node/identities/Identity'
import {
  IdentityEntityTypeType,
  IdentityInterface,
} from '~/models/auth-node/identities/types'

import {
  MQTT_SERVER_ADDRESS,
  MQTT_SERVER_PORT,
  MQTT_SERVER_SECURED_PORT,
} from '~/configuration'
import Account from '~/models/auth-node/accounts/Account'
import { AccountInterface } from '~/models/auth-node/accounts/types'

interface DevicesSettingsDeviceCredentialsFormModelMqttInterface {
  server: string
  port: string
  securedPort: string
}

interface DevicesSettingsDeviceCredentialsFormModelInterface {
  username: string
  password: string
  mqtt: DevicesSettingsDeviceCredentialsFormModelMqttInterface
}

interface DevicesSettingsDeviceCredentialsFormInterface {
  model: DevicesSettingsDeviceCredentialsFormModelInterface,
  result: string | boolean | null
}

interface DevicesSettingsDeviceCredentialsPropsInterface {
  device: DeviceInterface
  transparentBg: boolean
}

export default defineComponent({

  name: 'DevicesSettingsDeviceCredentials',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    transparentBg: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  setup(props: DevicesSettingsDeviceCredentialsPropsInterface, context: SetupContext) {
    const fetchingAccounts = computed<boolean>((): boolean => Account.getters('fetching')())
    const fetchingAccount = computed<boolean>((): boolean => Account.getters('getting')(props.device.id))
    const accountsFirstLoadFinished = computed<boolean>((): boolean => Account.getters('firstLoadFinished')())

    const fetchingIdentities = computed<boolean>((): boolean => Identity.getters('fetching')())
    const identitiesFirstLoadFinished = computed<boolean>((): boolean => Identity.getters('firstLoadFinished')(props.device.id))

    const account = computed<AccountInterface | null>((): AccountInterface | null => Account.find(props.device.id))

    const identity = computed<IdentityInterface | null>((): IdentityInterface | null => Identity.query().where('accountId', props.device.id).where('type', IdentityEntityTypeType.MACHINE).first())

    const form = reactive<DevicesSettingsDeviceCredentialsFormInterface>({
      model: {
        username: identity.value !== null ? identity.value.uid : '',
        password: identity.value !== null ? identity.value.password : '',
        mqtt: {
          server: `${MQTT_SERVER_ADDRESS}`,
          port: `${MQTT_SERVER_PORT}`,
          securedPort: `${MQTT_SERVER_SECURED_PORT}`,
        },
      },
      result: FbFormResultType.NONE,
    })

    localize({
      en: {
        fields: {
          password: {
            required: context.root.$t('devices.fields.password.validation.required').toString(),
          },
        },
      },
    })

    extend('required', {
      validate: (value) => {
        return {
          required: true,
          valid: !['', null, undefined].includes(value),
        }
      },
      computesRequired: true,
    })

    // Processing timer
    let timer: number

    onBeforeMount(async(): Promise<void> => {
      if (
        !Account.query().where('id', props.device.id).exists() &&
        !fetchingAccounts.value &&
        !fetchingAccount.value &&
        !accountsFirstLoadFinished.value
      ) {
        try {
          await Account.dispatch('get', {
            id: props.device.id,
          })
        } catch (e) {
          if (get(e, 'exception.response.status', 0) === 404) {
            context.root.$nuxt.error({ statusCode: 404, message: 'Device Account Not Found' })
          } else {
            context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          }
        }
      }

      if (
        account.value !== null &&
        !Identity.query().where('accountId', account.value.id).exists() &&
        !fetchingIdentities.value &&
        !identitiesFirstLoadFinished.value
      ) {
        await Identity.dispatch('fetch', {
          account: account.value,
        })
      }
    })

    onMounted((): void => {
      if (identity.value !== null) {
        context.emit('loaded')
      }
    })

    // Close form window
    function close(event?: MouseEvent): void {
      event && event.preventDefault()

      window.clearInterval(timer)

      context.emit('close')
    }

    // Form could not be submitted
    function error(): void {
      window.clearInterval(timer)

      form.result = FbFormResultType.NONE
    }

    // Submit form
    async function submit(event?: MouseEvent): Promise<void> {
      event && event.preventDefault()

      const errorMessage = context.root.$t('devices.messages.credentialsNotUpdated', {
        device: props.device.title,
      }).toString()

      form.result = FbFormResultType.WORKING

      try {
        await Identity.dispatch('edit', {
          identity,
          password: {
            current: identity.value !== null ? identity.value.password : '',
            new: form.model.password,
          },
        })

        form.result = FbFormResultType.OK

        timer = window.setInterval(close, 2000)
      } catch (e) {
        if (get(e, 'exception', null) !== null) {
          context.root.handleException(e.exception, errorMessage)
        } else {
          context.root.$flashMessage(errorMessage, 'error')
        }

        form.result = FbFormResultType.ERROR

        timer = window.setInterval(error, 2000)
      }
    }

    watch(
      (): IdentityInterface | null => identity.value,
      (val: IdentityInterface | null): void => {
        if (val !== null) {
          form.model.username = val.uid
          form.model.password = val.password

          context.emit('loaded')
        }
      },
    )

    return {
      identity,
      form,
      close,
      submit,
      formResultTypes: FbFormResultType,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
