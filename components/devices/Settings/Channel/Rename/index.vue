<template>
  <validation-observer ref="validator">
    <fb-ui-content :mb="sizeTypes.LARGE">
      <validation-provider
        v-slot="{ errors }"
        name="channelName"
        rules="required"
      >
        <fb-form-input
          v-model="form.model.name"
          :error="errors[0]"
          :has-error="errors.length > 0"
          :label="$t('devices.fields.channelName.title')"
          :placeholder="$t('devices.fields.channelName.placeholder')"
          :required="true"
          :tab-index="2"
          name="channelName"
        />
      </validation-provider>
    </fb-ui-content>

    <fb-form-text-area
      v-model="form.model.comment"
      :label="$t('devices.fields.channelComment.title')"
      :placeholder="$t('devices.fields.channelComment.placeholder')"
      :tab-index="3"
      name="channelComment"
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

import { DeviceInterface } from '~/models/devices-module/devices/types'
import { ChannelInterface } from '~/models/devices-module/channels/types'
import Channel from '~/models/devices-module/channels/Channel'

interface DevicesSettingsChannelRenameFormInterface {
  model: {
    name: string | null
    comment: string | null
  }
}

interface DevicesSettingsChannelRenamePropsInterface {
  device: DeviceInterface
  channel: ChannelInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
}

export default defineComponent({

  name: 'DevicesSettingsChannelRename',

  props: {

    device: {
      type: Object as PropType<DeviceInterface>,
      required: true,
    },

    channel: {
      type: Object as PropType<ChannelInterface>,
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

  setup(props: DevicesSettingsChannelRenamePropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive<DevicesSettingsChannelRenameFormInterface>({
      model: {
        name: props.channel.title,
        comment: props.channel.comment,
      },
    })

    localize({
      en: {
        fields: {
          channelName: {
            required: context.root.$t('devices.fields.channelName.validation.required').toString(),
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
                  const errorMessage = context.root.$t('devices.messages.channelNotRenamed', {
                    device: props.device.title,
                  }).toString()

                  context.emit('update:remoteFormResult', FbFormResultTypes.WORKING)

                  try {
                    await Channel.dispatch('edit', {
                      channel: props.channel,
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

    return {
      validator,
      form,
      sizeTypes: FbSizeTypes,
    }
  },

})
</script>
