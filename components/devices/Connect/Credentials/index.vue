<template>
  <validation-observer ref="validator">
    <fb-ui-content :mb="sizeTypes.SMALL">
      <validation-provider
        v-slot="{ errors }"
        name="username"
        rules="required"
      >
        <fb-form-input
          ref="username"
          v-model="form.model.username"
          :error="errors[0]"
          :has-error="errors.length > 0"
          :label="$t('devices.fields.username.title')"
          :required="true"
          :tab-index="2"
          name="username"
          readonly
        >
          <template slot="right-addon">
            <font-awesome-icon
              @click="handleCopyToClipboard('username')"
              icon="clipboard"
              class="fb-devices-connect-credentials__copy-button"
            />
          </template>
        </fb-form-input>
      </validation-provider>
    </fb-ui-content>

    <fb-ui-content :mb="sizeTypes.SMALL">
      <validation-provider
        v-slot="{ errors }"
        name="password"
        rules="required"
      >
        <fb-form-input
          ref="password"
          v-model="form.model.password"
          :error="errors[0]"
          :has-error="errors.length > 0"
          :label="$t('devices.fields.password.title')"
          :required="true"
          :tab-index="3"
          name="password"
          mb="sm"
        >
          <template slot="right-addon">
            <font-awesome-icon
              @click="handleCopyToClipboard('password')"
              icon="clipboard"
              class="fb-devices-connect-credentials__copy-button"
            />
          </template>
        </fb-form-input>
      </validation-provider>
    </fb-ui-content>

    <fb-ui-content :mb="sizeTypes.SMALL">
      <fb-form-input
        ref="clientId"
        :value="device.identifier"
        :label="$t('devices.fields.clientId.title')"
        :tab-index="4"
        name="clientId"
        readonly
        mb="sm"
      >
        <template slot="right-addon">
          <font-awesome-icon
            @click="handleCopyToClipboard('clientId')"
            icon="clipboard"
            class="fb-devices-connect-credentials__copy-button"
          />
        </template>
      </fb-form-input>
    </fb-ui-content>

    <hr>

    <div class="fb-devices-connect-credentials__row">
      <div>
        <fb-form-input
          :value="mqtt.server"
          :label="$t('devices.fields.mqtt.server.title')"
          :readonly="true"
          :tab-index="5"
          name="server"
        />
      </div>

      <div>
        <fb-form-input
          :value="mqtt.port"
          :label="$t('devices.fields.mqtt.port.title')"
          :readonly="true"
          :tab-index="6"
          name="port"
        />
      </div>
    </div>

    <fb-ui-divider>
      {{ $t('application.misc.or') }}
    </fb-ui-divider>

    <div class="fb-devices-connect-credentials__row">
      <div>
        <fb-form-input
          :value="mqtt.securedServer"
          :label="$t('devices.fields.mqtt.securedServer.title')"
          :readonly="true"
          :tab-index="7"
          name="secured_server"
        />
      </div>

      <div>
        <fb-form-input
          :value="mqtt.securedPort"
          :label="$t('devices.fields.mqtt.securedPort.title')"
          :readonly="true"
          :tab-index="8"
          name="secured_port"
        />
      </div>
    </div>
  </validation-observer>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import {
  ValidationProvider,
  ValidationObserver,
  extend,
  localize,
} from 'vee-validate'

import uuid from 'uuid'

import {
  FbFormInput,
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import {
  MQTT_SERVER_ADDRESS,
  MQTT_SERVER_PORT,
  MQTT_SERVER_SECURED_PORT,
} from '~/configuration'

import { DeviceInterface } from '~/models/devices-node/devices/types'

import Account from '~/models/auth-node/accounts/Account'
import { AccountEntityTypes } from '~/models/auth-node/accounts/types'
import Identity from '~/models/auth-node/identities/Identity'
import { IdentityEntityTypes } from '~/models/auth-node/identities/types'

interface DevicesConnectCredentialsPropsPropsInterface {
  device: DeviceInterface
  remoteFormSubmit: boolean
}

function generatePassword(): string {
  let generatedPassword = ''

  const characterSet = 'abcdefghijklmnopqrstuvwxyz' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789'

  for (let i = 0; i < 32; i++) {
    generatedPassword += characterSet.charAt(Math.floor(Math.random() * characterSet.length))
  }

  return generatedPassword
}

export default defineComponent({

  name: 'DevicesConnectCredentials',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    remoteFormSubmit: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  setup(props: DevicesConnectCredentialsPropsPropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const username = ref<InstanceType<typeof FbFormInput>>(null)
    const password = ref<InstanceType<typeof FbFormInput>>(null)
    const clientId = ref<InstanceType<typeof FbFormInput>>(null)

    const form = reactive({
      model: {
        username: uuid.v4(),
        password: generatePassword(),
        identifier: props.device.identifier,
        mqtt: {},
      },
    })

    localize({
      en: {
        fields: {
          username: {
            required: context.root.$t('devices.fields.username.validation.required').toString(),
          },
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

    function handleCopyToClipboard(field: string): void {
      let input = null

      switch (field) {
        case 'username':
          if (username.value !== null) {
            input = username.value.$el.querySelector('input')
          }
          break

        case 'password':
          if (password.value !== null) {
            input = password.value.$el.querySelector('input')
          }
          break

        case 'clientId':
          if (clientId.value !== null) {
            input = clientId.value.$el.querySelector('input')
          }
          break
      }

      if (input !== null) {
        input.select()
        input.setSelectionRange(0, 99999)

        document.execCommand('copy')
      }
    }

    watch(
      (): boolean => props.remoteFormSubmit,
      (val): void => {
        if (val) {
          context.emit('update:remoteFormSubmit', false)

          if (validator.value !== null) {
            validator.value
              .validate()
              .then(async(success: boolean): Promise<void> => {
                if (success) {
                  let account = Account.find(props.device.id)

                  if (account === null) {
                    account = await Account.dispatch('add', {
                      id: props.device.id,
                      draft: true,
                      data: {
                        type: AccountEntityTypes.MACHINE,
                      },
                    })
                  }

                  if (account !== null) {
                    await Identity.dispatch('add', {
                      account,
                      draft: true,
                      data: {
                        type: IdentityEntityTypes.MACHINE,
                        uid: form.model.username,
                        password: form.model.password,
                      },
                    })
                  }

                  context.emit('saved')
                }
              })
          }
        }
      },
    )

    return {
      validator,
      username,
      password,
      clientId,
      form,
      handleCopyToClipboard,
      mqtt: {
        server: MQTT_SERVER_ADDRESS,
        port: MQTT_SERVER_PORT,
        securedServer: MQTT_SERVER_ADDRESS,
        securedPort: MQTT_SERVER_SECURED_PORT,
      },
      sizeTypes: FbSizeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
