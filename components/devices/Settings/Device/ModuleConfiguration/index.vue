<template>
  <validation-observer
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
        <font-awesome-icon icon="cogs" />
      </fb-ui-modal-header-icon>

      <template slot="header">
        {{ title }}
      </template>

      <template slot="form">
        <template v-for="(parameter, index) in parameters">
          <fb-ui-content
            :key="index"
            mb="lg"
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
                type="number"
              >
                <template
                  v-if="parameter.description !== null && errors.length === 0"
                  slot="help-line"
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
                type="text"
              >
                <template
                  v-if="parameter.description !== null && errors.length === 0"
                  slot="help-line"
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
                v-if="parameter.description !== null"
                slot="help-line"
              >
                {{ parameter.description }}
              </template>
            </fb-form-select>

            <fb-form-checkbox
              v-if="parameter.isBoolean"
              v-model="form.model[parameter.configuration]"
              :name="parameter.configuration"
            >
              {{ parameter.title }}
            </fb-form-checkbox>
          </fb-ui-content>
        </template>
      </template>
    </fb-ui-modal-form>
  </validation-observer>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  SetupContext,
} from '@vue/composition-api'

import get from 'lodash/get'
import {
  ValidationProvider,
  ValidationObserver,
  extend,
} from 'vee-validate'
import {
  numeric,
  between,
} from 'vee-validate/dist/rules'

import { FbFormResultType } from '@fastybird/web-ui-theme'

import { DeviceInterface } from '~/models/devices-node/devices/types'
import DeviceConfiguration from '~/models/devices-node/device-configuration/DeviceConfiguration'
import { DeviceConfigurationInterface } from '~/models/devices-node/device-configuration/types'

interface DevicesSettingsDeviceModuleConfigurationFormModelInterface {
  values: { [key: string]: any }
}

interface DevicesSettingsDeviceModuleConfigurationFormInterface {
  model: DevicesSettingsDeviceModuleConfigurationFormModelInterface,
  result: string | boolean | null
}

interface DevicesSettingsDeviceModuleConfigurationPropsInterface {
  device: DeviceInterface
  title: string
  keyPrefix: string
  transparentBg: boolean
}

export default defineComponent({

  name: 'DevicesSettingsDeviceModuleConfiguration',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    keyPrefix: {
      type: String,
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

  setup(props: DevicesSettingsDeviceModuleConfigurationPropsInterface, context: SetupContext) {
    const form = reactive<DevicesSettingsDeviceModuleConfigurationFormInterface>({
      model: {
        values: {},
      },
      result: FbFormResultType.NONE,
    })

    const parameters = computed<Array<DeviceConfigurationInterface>>((): Array<DeviceConfigurationInterface> => {
      return DeviceConfiguration
        .query()
        .where('deviceId', props.device.id)
        .where((item: DeviceConfigurationInterface): boolean => {
          return item.configuration.indexOf(props.keyPrefix) === 0 &&
            item.configuration.indexOf('sensor_expected_') !== 0
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

    extend('numeric', numeric)

    extend('between', between)

    // Processing timer
    let timer: number

    onMounted((): void => {
      context.emit('loaded')
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

      // Check if device is connected to cloud
      if (!props.device.isReady) {
        context.root.$flashMessage(context.root.$t('devices.messages.notOnline', {
          device: props.device.title,
        }).toString(), 'error')

        return
      }

      const errorMessage = context.root.$t('devices.messages.moduleNotUpdated', {
        device: props.device.title,
      }).toString()

      form.result = FbFormResultType.WORKING

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

    return {
      form,
      parameters,
      close,
      submit,
      formResultTypes: FbFormResultType,
    }
  },

})
</script>
