<template>
  <validation-observer ref="validator">
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

import Trigger from '~/models/triggers-module/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-module/triggers/types'

interface TriggersSettingsTriggerRenameFormInterface {
  model: {
    name: string
    comment: string | null
  }
}

interface TriggersSettingsTriggerRenamePropsInterface {
  trigger: TriggerInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
  remoteFormReset: boolean
}

export default defineComponent({

  name: 'TriggersSettingsTriggerRename',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
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

  setup(props: TriggersSettingsTriggerRenamePropsInterface, context: SetupContext) {
    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const form = reactive<TriggersSettingsTriggerRenameFormInterface>({
      model: {
        name: props.trigger.name,
        comment: props.trigger.comment,
      },
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
                  const errorMessage = context.root.$t('triggers.messages.triggerNotRenamed', {
                    trigger: props.trigger.name,
                  }).toString()

                  context.emit('update:remoteFormResult', FbFormResultTypes.WORKING)

                  try {
                    await Trigger.dispatch('edit', {
                      trigger: props.trigger,
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
          form.model.name = props.trigger.name
          form.model.comment = props.trigger.comment
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
