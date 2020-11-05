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
        {{ $t('devices.headings.renameChannel') }}
      </template>

      <template slot="form">
        <fb-ui-content mb="lg">
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

import { DeviceInterface } from '~/models/devices-node/devices/types'
import { ChannelInterface } from '~/models/devices-node/channels/types'
import Channel from '~/models/devices-node/channels/Channel'

interface DevicesSettingsChannelRenameFormModelInterface {
  name: string
  comment: string | null
}

interface DevicesSettingsChannelRenameFormInterface {
  model: DevicesSettingsChannelRenameFormModelInterface,
  result: string | boolean | null
}

interface DevicesSettingsChannelRenamePropsInterface {
  device: DeviceInterface
  channel: ChannelInterface
  transparentBg: boolean
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

    transparentBg: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    ValidationProvider,
    ValidationObserver,
  },

  setup(props: DevicesSettingsChannelRenamePropsInterface, context: SetupContext) {
    const form = reactive<DevicesSettingsChannelRenameFormInterface>({
      model: {
        name: props.channel.title,
        comment: props.channel.comment,
      },
      result: FbFormResultType.NONE,
    })

    localize({
      en: {
        fields: {
          deviceName: {
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

      const errorMessage = context.root.$t('devices.messages.channelNotRenamed', {
        channel: props.channel.title,
      }).toString()

      form.result = FbFormResultType.WORKING

      try {
        await Channel.dispatch('edit', {
          channel: props.channel,
          name: form.model.name,
          comment: form.model.comment,
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
