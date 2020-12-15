<template>
  <validation-observer ref="validator">
    <template v-for="(parameter, index) in parameters">
      <fb-ui-content
        :key="index"
        :mb="sizeTypes.LARGE"
      >
        <validation-provider
          v-if="parameter.isNumber"
          v-slot="{ errors }"
          :name="parameter.configuration"
          :rules="`required|numeric|between:${parameter.min},${parameter.max}`"
        >
          <fb-form-input
            v-model="form.model[parameter.configuration]"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :name="parameter.configuration"
            :label="parameter.title"
            :required="true"
            :tab-index="index + 2"
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

        <validation-provider
          v-if="parameter.isText"
          v-slot="{ errors }"
          :name="parameter.configuration"
          :rules="`required`"
        >
          <fb-form-input
            v-model="form.model[parameter.configuration]"
            :error="errors[0]"
            :has-error="errors.length > 0"
            :name="parameter.configuration"
            :label="parameter.title"
            :required="true"
            :tab-index="index + 2"
            :type="formInputTypes.TEXT"
          >
            <template
              slot="help-line"
              v-if="parameter.description !== null && errors.length === 0"
            >
              {{ parameter.description }}
            </template>
          </fb-form-input>
        </validation-provider>

        <fb-form-select
          v-if="parameter.isSelect"
          v-model="form.model[parameter.configuration]"
          :items="parameter.selectValues"
          :name="parameter.configuration"
          :label="parameter.title"
          :tab-index="index + 2"
          :required="true"
        >
          <template
            slot="help-line"
            v-if="parameter.description !== null"
          >
            {{ parameter.description }}
          </template>
        </fb-form-select>

        <fb-form-checkbox
          v-if="parameter.isBoolean"
          :key="index"
          v-model="form.model[parameter.configuration]"
          :name="parameter.configuration"
        >
          {{ parameter.title }}
        </fb-form-checkbox>
      </fb-ui-content>
    </template>
  </validation-observer>
</template>

<script lang="ts">
import {
  computed,
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

interface DevicesSettingsDeviceSensorsCalibrationFormInterface {
  model: {
    values: { [key: string]: any }
  },
}

interface DevicesSettingsDeviceSensorsCalibrationPropsInterface {
  device: DeviceInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
}

export default defineComponent({

  name: 'DevicesSettingsDeviceSensorsCalibration',

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

  },

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  setup(props: DevicesSettingsDeviceSensorsCalibrationPropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive<DevicesSettingsDeviceSensorsCalibrationFormInterface>({
      model: {
        values: {},
      },
    })

    const parameters = computed<Array<DeviceConfigurationInterface>>((): Array<DeviceConfigurationInterface> => {
      return DeviceConfiguration
        .query()
        .where('deviceId', props.device.id)
        .where((item: DeviceConfigurationInterface): boolean => {
          return item.configuration.indexOf('sensor_expected_') === 0
        })
        .orderBy('title')
        .get()
    })

    parameters.value
      .forEach((parameter: DeviceConfigurationInterface): void => {
        form.model.values[parameter.configuration] = parameter.value === null ? parameter.default : parameter.value
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
                  const errorMessage = context.root.$t('devices.messages.moduleNotUpdated', {
                    device: props.device.title,
                  }).toString()

                  try {
                    const promises: Array<Promise<boolean>> = []

                    parameters.value
                      .forEach((parameter: DeviceConfigurationInterface) => {
                        promises.push(DeviceConfiguration.dispatch('edit', {
                          device: props.device,
                          parameter,
                          value: form.model.values[parameter.configuration],
                        }))
                      })

                    await Promise.all(promises)

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
      parameters,
      sizeTypes: FbSizeTypes,
      formInputTypes: FbFormInputTypeTypes,
    }
  },

})
</script>
