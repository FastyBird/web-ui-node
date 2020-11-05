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
        {{ $t('devices.headings.channelParameterEdit') }}
      </template>

      <template slot="form">
        <p
          v-if="!device.isReady"
          class="alert alert-warning"
          role="alert"
        >
          This device is offline. Therefore you can't edit its setting
        </p>

        <fb-ui-content
          v-if="parameter.isNumber"
          mb="lg"
        >
          <validation-provider
            v-if="parameter.isNumber"
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
        </fb-ui-content>

        <fb-ui-content
          v-if="parameter.isText"
          mb="lg"
        >
          <validation-provider
            v-if="parameter.isText"
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
        </fb-ui-content>

        <fb-ui-content
          v-if="parameter.isSelect"
          mb="lg"
        >
          <fb-form-select
            v-if="parameter.isSelect"
            v-model="form.model.value"
            :items="parameter.selectValues"
            :name="parameter.configuration"
            :label="parameter.title"
            :tab-index="2"
            :required="true"
          >
            <template
              v-if="parameter.description !== null"
              slot="help-line"
            >
              {{ parameter.description }}
            </template>
          </fb-form-select>
        </fb-ui-content>
      </template>
    </fb-ui-modal-form>
  </validation-observer>
</template>

<script lang="ts">
import {
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
import { ChannelInterface } from '~/models/devices-node/channels/types'
import ChannelConfiguration from '~/models/devices-node/channel-configuration/ChannelConfiguration'
import { ChannelConfigurationInterface } from '~/models/devices-node/channel-configuration/types'

interface DevicesSettingsChannelParameterEditFormModelInterface {
  value: any
}

interface DevicesSettingsChannelParameterEditFormInterface {
  model: DevicesSettingsChannelParameterEditFormModelInterface,
  result: string | boolean | null
}

interface DevicesSettingsChannelParameterEditPropsInterface {
  device: DeviceInterface
  channel: ChannelInterface
  parameter: ChannelConfigurationInterface
  transparentBg: boolean
}

export default defineComponent({

  name: 'DevicesSettingsChannelParameterEdit',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    channel: {
      type: Object as PropType<ChannelInterface>,
      required: true,
    },

    parameter: {
      type: Object as PropType<ChannelConfigurationInterface>,
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

  setup(props: DevicesSettingsChannelParameterEditPropsInterface, context: SetupContext) {
    const form = reactive<DevicesSettingsChannelParameterEditFormInterface>({
      model: {
        value: props.parameter.value === null ? props.parameter.default : props.parameter.value,
      },
      result: FbFormResultType.NONE,
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

      const errorMessage = context.root.$t('devices.messages.parameterNotUpdated', {
        parameter: props.parameter.title,
      }).toString()

      form.result = FbFormResultType.WORKING

      try {
        await ChannelConfiguration.dispatch('edit', {
          channel: props.channel,
          parameter: props.parameter,
          value: form.model.value,
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

    return {
      form,
      close,
      submit,
      formResultTypes: FbFormResultType,
    }
  },

})
</script>
