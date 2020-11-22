<template>
  <validation-observer ref="validator">
    <fb-ui-content :mb="sizeTypes.LARGE">
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
  localize,
} from 'vee-validate'

import {
  FbFormResultTypes,
  FbSizeTypes,
} from '@fastybird/web-ui-theme'

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'

interface DevicesSettingsRenameFormInterface {
  model: {
    name: string | null
    comment: string | null
  }
}

interface DevicesSettingsDeviceRenamePropsInterface {
  device: DeviceInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
  remoteFormReset: boolean
}

export default defineComponent({

  name: 'DevicesSettingsDeviceRename',

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

  setup(props: DevicesSettingsDeviceRenamePropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive<DevicesSettingsRenameFormInterface>({
      model: {
        name: props.device.title,
        comment: props.device.comment,
      },
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

          if (validator.value !== null) {
            validator.value
              .validate()
              .then(async(success: boolean): Promise<void> => {
                if (success) {
                  const errorMessage = context.root.$t('devices.messages.deviceNotRenamed', {
                    device: props.device.title,
                  }).toString()

                  context.emit('update:remoteFormResult', FbFormResultTypes.WORKING)

                  try {
                    await Device.dispatch('edit', {
                      device: props.device,
                      data: {
                        name: form.model.name,
                        comment: form.model.comment,
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

        if (val) {
          form.model.name = props.device.name
          form.model.comment = props.device.comment
        }
      },
    )

    return {
      validator,
      form,
      sizeTypes: FbSizeTypes,
    }
  },

})
</script>
