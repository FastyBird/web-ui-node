<template>
  <validation-observer
    ref="validator"
    v-slot="{ handleSubmit }"
  >
    <fb-ui-modal-form
      :transparent-bg="transparentBg"
      :lock-submit-button="form.result !== formResultTypes.NONE"
      :state="form.result"
      :variant="$windowSize.isExtraSmall() ? modalVariantTypes.PHONE : modalVariantTypes.DEFAULT"
      @submit="handleSubmit(submit)"
      @cancel="close"
      @close="close"
    >
      <fb-ui-modal-header-icon slot="icon">
        <font-awesome-icon icon="pencil-alt" />
      </fb-ui-modal-header-icon>

      <template slot="header">
        {{ $t('triggers.headings.renameTrigger') }}
      </template>

      <template slot="form">
        <fb-ui-content :mb="sizeTypes.LARGE">
          <validation-provider
            v-slot="{ errors }"
            name="triggerName"
            rules="required"
          >
            <fb-form-input
              v-model="form.model.name"
              :error="errors[0]"
              :has-error="errors.length > 0"
              :label="$t('triggers.fields.triggerName.title')"
              :placeholder="$t('triggers.fields.triggerName.placeholder')"
              :required="true"
              :tab-index="2"
              name="triggerName"
            />
          </validation-provider>
        </fb-ui-content>

        <fb-form-text-area
          v-model="form.model.comment"
          :label="$t('triggers.fields.triggerComment.title')"
          :placeholder="$t('triggers.fields.triggerComment.placeholder')"
          :tab-index="3"
          name="triggerComment"
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

import {
  FbFormResultType,
  FbSizeTypes,
  FbUiModalVariantType,
} from '@fastybird/web-ui-theme'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'

interface TriggersSettingsRenameFormModelInterface {
  name: string
  comment: string | null
}

interface TriggersSettingsRenameFormInterface {
  model: TriggersSettingsRenameFormModelInterface
  result: string | boolean | null
}

interface TriggersSettingsTriggerRenamePropsInterface {
  trigger: TriggerInterface
  transparentBg: boolean
}

export default defineComponent({

  name: 'TriggersSettingsTriggerRename',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
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

  setup(props: TriggersSettingsTriggerRenamePropsInterface, context: SetupContext) {
    const form = reactive<TriggersSettingsRenameFormInterface>({
      model: {
        name: props.trigger.name,
        comment: props.trigger.comment,
      },
      result: FbFormResultType.NONE,
    })

    localize({
      en: {
        fields: {
          triggerName: {
            required: context.root.$t('triggers.fields.triggerName.validation.required').toString(),
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
    function close(): void {
      window.clearInterval(timer)

      context.emit('close')
    }

    // Form could not be submitted
    function error(): void {
      window.clearInterval(timer)

      form.result = FbFormResultType.NONE
    }

    // Submit form
    async function submit(): Promise<void> {
      const errorMessage = context.root.$t('triggers.messages.triggerNotRenamed', {
        trigger: props.trigger.name,
      }).toString()

      form.result = FbFormResultType.WORKING

      try {
        await Trigger.dispatch('edit', {
          trigger: props.trigger,
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
      modalVariantTypes: FbUiModalVariantType,
      sizeTypes: FbSizeTypes,
    }
  },

})
</script>
