<template>
  <validation-observer
    ref="validator"
    v-slot="{ handleSubmit }"
  >
    <form @submit="handleSubmit(submit)">
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
            :required="true"
            :tab-index="2"
            name="deviceName"
          />
        </validation-provider>
      </fb-ui-content>

      <fb-ui-content mb="lg">
        <fb-form-input
          v-model="form.model.identifier"
          :label="$t('devices.fields.identifier.title')"
          :required="true"
          :tab-index="3"
          name="identifier"
          readonly
        />
      </fb-ui-content>

      <fb-form-text-area
        v-model="form.model.comment"
        :label="$t('devices.fields.deviceComment.title')"
        :placeholder="$t('devices.fields.deviceComment.placeholder')"
        :tab-index="4"
        name="deviceComment"
      />
    </form>
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

import Device from '~/models/devices-node/devices/Device'
import { DeviceInterface } from '~/models/devices-node/devices/types'

interface DevicesConnectGeneralPropsInterface {
  device: DeviceInterface
  remoteSubmit: boolean
}

export default defineComponent({

  name: 'DevicesConnectGeneral',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    remoteSubmit: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  setup(props: DevicesConnectGeneralPropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive({
      model: {
        name: props.device.name,
        identifier: props.device.identifier,
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

    function submit(): void {
      context.emit('update:remoteSubmit', false)

      if (validator.value !== null) {
        validator.value
          .validate()
          .then(async(success: boolean): Promise<void> => {
            if (success) {
              await Device.dispatch('edit', {
                device: props.device,
                data: {
                  name: form.model.name,
                  comment: form.model.comment,
                },
              })

              context.emit('saved')
            }
          })
      }
    }

    watch(
      (): boolean => props.remoteSubmit,
      (val): void => {
        if (val) {
          submit()
        }
      },
    )

    return {
      validator,
      form,
      submit,
    }
  },

})
</script>
