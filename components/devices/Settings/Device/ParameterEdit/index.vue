<template>
  <validation-observer ref="validator">
    <fb-ui-content
      v-if="parameter.isNumber"
      :mb="sizeTypes.LARGE"
    >
      <validation-provider
        v-slot="{ errors }"
        :name="parameter.configuration"
        :rules="`required|numeric|between:${parameter.min},${parameter.max}`"
      >
        <fb-form-input
          v-model="form.model.value"
          :error="errors[0]"
          :has-error="errors.length > 0"
          :name="parameter.configuration"
          :label="parameter.title"
          :required="true"
          :tab-index="2"
          :type="formInputTypes.NUMBER"
        >
          <template
            slot="help-line"
            v-if="parameter.description !== null && errors.length === 0"
          >
            {{ parameter.description }}
          </template>
        </fb-form-input>
      </validation-provider>
    </fb-ui-content>

    <fb-ui-content
      v-if="parameter.isText"
      :mb="sizeTypes.LARGE"
    >
      <validation-provider
        v-slot="{ errors }"
        :name="parameter.configuration"
        rules="required"
      >
        <fb-form-input
          v-model="form.model.value"
          :error="errors[0]"
          :has-error="errors.length > 0"
          :name="parameter.configuration"
          :label="parameter.title"
          :required="true"
          :tab-index="2"
          :type="formInputTypes.TEXT"
          mb="lg"
        >
          <template
            slot="help-line"
            v-if="parameter.description !== null && errors.length === 0"
          >
            {{ parameter.description }}
          </template>
        </fb-form-input>
      </validation-provider>
    </fb-ui-content>

    <fb-ui-content
      v-if="parameter.isSelect"
      :mb="sizeTypes.LARGE"
    >
      <fb-form-select
        v-model="form.model.value"
        :items="parameter.selectValues"
        :name="parameter.configuration"
        :label="parameter.title"
        :tab-index="2"
        :required="true"
      >
        <template
          slot="help-line"
          v-if="parameter.description !== null"
        >
          {{ parameter.description }}
        </template>
      </fb-form-select>
    </fb-ui-content>
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

import get from 'lodash/get'
import {
  ValidationProvider,
  ValidationObserver,
  extend,
} from 'vee-validate'

import {
  FbFormInputTypeTypes,
  FbFormResultTypes,
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import { DeviceInterface } from '~/models/devices-module/devices/types'
import DeviceConfiguration from '~/models/devices-module/device-configuration/DeviceConfiguration'
import { DeviceConfigurationInterface } from '~/models/devices-module/device-configuration/types'

interface DevicesSettingsDeviceParameterEditFormInterface {
  model: {
    value: any
  }
}

interface DevicesSettingsDeviceParameterEditPropsInterface {
  device: DeviceInterface
  parameter: DeviceConfigurationInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
}

export default defineComponent({

  name: 'DevicesSettingsDeviceParameterEdit',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    parameter: {
      type: Object as PropType<DeviceConfigurationInterface>,
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

  },

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  setup(props: DevicesSettingsDeviceParameterEditPropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive<DevicesSettingsDeviceParameterEditFormInterface>({
      model: {
        value: props.parameter.value === null ? props.parameter.default : props.parameter.value,
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

    // extend('numeric', numeric)

    // extend('between', between)

    let timer: number

    function clearResult(): void {
      window.clearTimeout(timer)

      context.emit('update:remoteFormResult', FbFormResultTypes.NONE)
    }

    watch(
      (): boolean => props.remoteFormSubmit,
      (val): void => {
        if (val) {
          context.emit('update:remoteFormSubmit', false)

          if (!props.device.isReady) {
            context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
              device: props.device.title,
            }).toString(), 'error')

            return
          }

          if (validator.value !== null) {
            validator.value
              .validate()
              .then(async(success: boolean): Promise<void> => {
                if (success) {
                  const errorMessage = context.root.$t('devices.messages.parameterNotUpdated', {
                    parameter: props.parameter.title,
                  }).toString()

                  context.emit('update:remoteFormResult', FbFormResultTypes.WORKING)

                  try {
                    await DeviceConfiguration.dispatch('edit', {
                      device: props.device,
                      parameter: props.parameter,
                      value: form.model.value,
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

    return {
      validator,
      form,
      sizeTypes: FbSizeTypes,
      formInputTypes: FbFormInputTypeTypes,
    }
  },

})
</script>
