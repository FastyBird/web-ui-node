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
        <font-awesome-icon icon="pencil-alt" />
      </fb-ui-modal-header-icon>

      <template slot="header">
        {{ $t('devices.headings.renameDevice') }}
      </template>

      <template slot="form">
        <fb-ui-content mb="lg">
          <validation-provider
            v-slot="{ errors }"
            name="deviceName"
            rules="required"
          >
            <fb-form-input
              v-model="form.model.name"
              :error="errors[0]"
              :has-error="errors.length > 0"
              :label="$t('devices.fields.deviceName.title')"
              :placeholder="$t('devices.fields.deviceName.placeholder')"
              :required="true"
              :tab-index="2"
              name="deviceName"
            />
          </validation-provider>
        </fb-ui-content>

        <fb-form-text-area
          v-model="form.model.comment"
          :label="$t('devices.fields.deviceComment.title')"
          :placeholder="$t('devices.fields.deviceComment.placeholder')"
          :tab-index="3"
          name="deviceComment"
        />
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
  localize,
} from 'vee-validate'

import { FbFormResultType } from '@fastybird/web-ui-theme'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'

interface DevicesSettingsRenameFormModelInterface {
  name: string
  comment: string | null
}

interface DevicesSettingsRenameFormInterface {
  model: DevicesSettingsRenameFormModelInterface,
  result: string | boolean | null
}

interface DevicesSettingsDeviceRenamePropsInterface {
  device: DeviceInterface
  transparentBg: boolean
}

export default defineComponent({

  name: 'DevicesSettingsDeviceRename',

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

  setup(props: DevicesSettingsDeviceRenamePropsInterface, context: SetupContext) {
    const form = reactive<DevicesSettingsRenameFormInterface>({
      model: {
        name: props.device.title,
        comment: props.device.comment,
      },
      result: FbFormResultType.NONE,
    })

    localize({
      en: {
        fields: {
          deviceName: {
            required: context.root.$t('devices.fields.deviceName.validation.required').toString(),
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

      const errorMessage = context.root.$t('devices.messages.deviceNotRenamed', {
        device: props.device.title,
      }).toString()

      form.result = FbFormResultType.WORKING

      try {
        await Device.dispatch('edit', {
          device: props.device,
          data: {
            name: form.model.name,
            comment: form.model.comment,
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

    return {
      form,
      close,
      submit,
      formResultTypes: FbFormResultType,
    }
  },

})
</script>
