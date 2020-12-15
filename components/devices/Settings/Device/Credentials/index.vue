<template>
  <validation-observer ref="validator">
    <fb-ui-content :mb="sizeTypes.LARGE">
      <fb-form-input
        v-model="form.model.username"
        :label="$t('devices.fields.username.title')"
        :readonly="true"
        :tab-index="2"
        name="username"
      />
    </fb-ui-content>

    <fb-ui-content :mb="sizeTypes.LARGE">
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
  </validation-observer>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  PropType,
  reactive,
  ref,
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

import {
  FbFormResultTypes,
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import { DeviceInterface } from '~/models/devices-module/devices/types'
import Identity from '~/models/auth-module/identities/Identity'
import {
  IdentityEntityTypes,
  IdentityInterface,
} from '~/models/auth-module/identities/types'

import {
  MQTT_SERVER_ADDRESS,
  MQTT_SERVER_PORT,
  MQTT_SERVER_SECURED_PORT,
} from '~/configuration'
import Account from '~/models/auth-module/accounts/Account'
import { AccountInterface } from '~/models/auth-module/accounts/types'

interface DevicesSettingsDeviceCredentialsFormInterface {
  model: {
    username: string
    password: string
    mqtt: {
      server: string
      port: string
      securedPort: string
    }
  }
}

interface DevicesSettingsDeviceCredentialsPropsInterface {
  device: DeviceInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
  remoteFormReset: boolean
}

export default defineComponent({

  name: 'DevicesSettingsDeviceCredentials',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    remoteFormSubmit: {
      type: Boolean,
      default: false,
    },

    remoteFormResult: {
      type: String as PropType<FbFormResultTypes>,
      default: FbFormResultTypes.NONE,
    },

    remoteFormReset: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  setup(props: DevicesSettingsDeviceCredentialsPropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const fetchingAccounts = computed<boolean>((): boolean => Account.getters('fetching')())
    const fetchingAccount = computed<boolean>((): boolean => Account.getters('getting')(props.device.id))
    const accountsFirstLoadFinished = computed<boolean>((): boolean => Account.getters('firstLoadFinished')())

    const fetchingIdentities = computed<boolean>((): boolean => Identity.getters('fetching')())
    const identitiesFirstLoadFinished = computed<boolean>((): boolean => Identity.getters('firstLoadFinished')(props.device.id))

    const account = computed<AccountInterface | null>((): AccountInterface | null => Account.find(props.device.id))

    const identity = computed<IdentityInterface | null>((): IdentityInterface | null => Identity.query().where('accountId', props.device.id).where('type', IdentityEntityTypes.MACHINE).first())

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

    let timer: number

    function clearResult(): void {
      window.clearTimeout(timer)

      context.emit('update:remoteFormResult', FbFormResultTypes.NONE)
    }

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
                  const errorMessage = context.root.$t('devices.messages.credentialsNotUpdated', {
                    device: props.device.title,
                  }).toString()

                  context.emit('update:remoteFormResult', FbFormResultTypes.WORKING)

                  try {
                    await Identity.dispatch('edit', {
                      identity: identity.value,
                      data: {
                        password: {
                          current: identity.value !== null ? identity.value.password : '',
                          new: form.model.password,
                        },
                      },
                    })

                    context.emit('update:remoteFormResult', FbFormResultTypes.OK)

                    timer = window.setTimeout(clearResult, 2000)
                  } catch (e) {
                    if (get(e, 'exception', null) !== null) {
                      context.root.handleException(e.exception, errorMessage)
                    } else {
                      context.root.$flashMessage(errorMessage, 'error')
                    }

                    context.emit('update:remoteFormResult', FbFormResultTypes.ERROR)

                    timer = window.setTimeout(clearResult, 2000)
                  }
                }
              })
          }
        }
      },
    )

    watch(
      (): boolean => props.remoteFormReset,
      (val): void => {
        context.emit('update:remoteFormReset', false)

        if (val && identity.value !== null) {
          form.model.username = identity.value.uid
          form.model.password = identity.value.password
        }
      },
    )

    watch(
      (): IdentityInterface | null => identity.value,
      (val: IdentityInterface | null): void => {
        if (val !== null) {
          form.model.username = val.uid
          form.model.password = val.password
        }
      },
    )

    return {
      validator,
      identity,
      form,
      sizeTypes: FbSizeTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
