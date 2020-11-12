<template>
  <div class="fb-triggers-settings-trigger__container">
    <validation-observer ref="validator">
      <h3 class="fb-triggers-settings-trigger__heading">
        {{ $t('triggers.headings.aboutTrigger') }}
      </h3>

      <fb-ui-content
        :ph="sizeTypes.SMALL"
        :pv="sizeTypes.SMALL"
      >
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
      </fb-ui-content>
    </validation-observer>

    <fb-ui-items-container>
      <template slot="heading">
        {{ $t('triggers.headings.generalSettings') }}
      </template>

      <settings-list-item class="fb-triggers-settings-trigger__item fb-triggers-settings-trigger__item-action">
        <fb-ui-switch-element
          slot="suffix"
          ref="enabled"
          :status="form.model.enabled"
          :variant="switchVariantTypes.PRIMARY"
          @change="toggleTriggerState"
        />

        <template v-if="trigger.enabled">
          {{ $t('triggers.buttons.triggerEnabled.title') }}
        </template>
        <template v-else>
          {{ $t('triggers.buttons.triggerDisabled.title') }}
        </template>
      </settings-list-item>

      <settings-list-item
        @click="openWindow(viewTypes.REMOVE_CONFIRMATION)"
        :type="settingsItemType.BUTTON"
        class="fb-triggers-settings-trigger__item fb-triggers-settings-trigger__item-remove"
      >
        <fb-ui-spinner
          slot="prefix"
          v-if="view.loading.removeConfirmation"
          :size="sizeTypes.SMALL"
        />
        <font-awesome-icon
          slot="suffix"
          icon="angle-right"
        />

        {{ $t('triggers.buttons.removeTrigger.title') }}
      </settings-list-item>
    </fb-ui-items-container>

    <triggers-phone-settings-remove
      v-if="view.removeConfirmation.show"
      :trigger="trigger"
      :transparent-bg="true"
      @loaded="view.loading.removeConfirmation = false"
      @close="closeWindow(viewTypes.REMOVE_CONFIRMATION)"
      @removed="triggerRemoved"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  ref,
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
  FbFormResultType,
  FbSizeTypes,
  FbUiSwitchElementVariantTypes,
} from '@fastybird/web-ui-theme'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'

import { SettingsItemType } from '~/components/layout/SettingsListItem/index.vue'

const TriggersPhoneSettingsRemove = () => import('~/components/triggers/Settings/Remove/index.vue')

enum ViewTypes {
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersPhoneSettingsViewLoadingInterface {
  removeConfirmation: boolean
}

interface TriggersPhoneSettingsViewRemoveConfirmationInterface {
  show: boolean
}

interface TriggersPhoneSettingsViewInterface {
  loading: TriggersPhoneSettingsViewLoadingInterface
  removeConfirmation: TriggersPhoneSettingsViewRemoveConfirmationInterface
}

interface TriggersPhoneSettingsFormModelInterface {
  name: string
  comment: string | null
  enabled: boolean
}

interface TriggersPhoneSettingsFormInterface {
  model: TriggersPhoneSettingsFormModelInterface
}

interface TriggersPhoneSettingsPropsInterface {
  trigger: TriggerInterface
  remoteSubmit: boolean
  remoteFormResult: FbFormResultType
  remoteReset: boolean
}

export default defineComponent({

  name: 'TriggersPhoneSettings',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    remoteSubmit: {
      type: Boolean,
      default: false,
    },

    remoteFormResult: {
      type: String as PropType<FbFormResultType>,
      default: FbFormResultType.NONE,
    },

    remoteReset: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    TriggersPhoneSettingsRemove,

    ValidationProvider,
    ValidationObserver,
  },

  setup(props: TriggersPhoneSettingsPropsInterface, context) {
    const view = reactive<TriggersPhoneSettingsViewInterface>({
      loading: {
        removeConfirmation: false,
      },
      removeConfirmation: {
        show: false,
      },
    })

    const form = reactive<TriggersPhoneSettingsFormInterface>({
      model: {
        name: props.trigger.name,
        comment: props.trigger.comment,
        enabled: props.trigger.enabled,
      },
    })

    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

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

    // Submit edit parameter
    async function toggleTriggerState(): Promise<void> {
      form.model.enabled = !form.model.enabled

      const errorMessage = context.root.$t('triggers.messages.triggerNotUpdated', {
        trigger: props.trigger.name,
      }).toString()

      try {
        await Trigger.dispatch('edit', {
          trigger: props.trigger,
          data: {
            enabled: form.model.enabled,
          },
        })
      } catch (e) {
        if (get(e, 'exception', null) !== null) {
          context.root.handleException(e.exception, errorMessage)
        } else {
          context.root.$flashMessage(errorMessage, 'error')
        }
      }
    }

    // Open info window
    function openWindow(type: ViewTypes): void {
      view[type].show = true
    }

    // Close opened window
    function closeWindow(type: ViewTypes): void {
      view[type].show = false
    }

    // Fired when opened item is removed
    function triggerRemoved(): void {
      closeWindow(ViewTypes.REMOVE_CONFIRMATION)

      context.emit('removed')
    }

    // Submit form
    function submit(): void {
      context.emit('update:remoteSubmit', false)

      context.emit('update:remoteFormResult', FbFormResultType.WORKING)

      if (validator.value !== null) {
        validator.value
          .validate()
          .then((success: boolean): void => {
            if (success) {
              context.emit('update:remoteFormResult', FbFormResultType.OK)

              const errorMessage = context.root.$t('triggers.messages.triggerNotRenamed', {
                trigger: props.trigger.name,
              }).toString()

              Trigger.dispatch('edit', {
                trigger: props.trigger,
                data: {
                  name: form.model.name,
                  comment: form.model.comment,
                },
              })
                .catch((e) => {
                  context.emit('update:remoteFormResult', FbFormResultType.ERROR)

                  if (get(e, 'exception', null) !== null) {
                    context.root.$flashMessage(errorMessage, 'error')
                  } else {
                    context.root.$flashMessage(errorMessage, 'error')
                  }
                })
            } else {
              context.emit('update:remoteFormResult', FbFormResultType.NONE)
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

    watch(
      (): boolean => props.remoteReset,
      (val): void => {
        context.emit('update:remoteReset', false)

        if (val) {
          form.model.name = props.trigger.name
          form.model.comment = props.trigger.comment
          form.model.enabled = props.trigger.enabled
        }
      },
    )

    return {
      view,
      viewTypes: ViewTypes,
      form,
      validator,
      toggleTriggerState,
      openWindow,
      closeWindow,
      triggerRemoved,
      submit,
      sizeTypes: FbSizeTypes,
      switchVariantTypes: FbUiSwitchElementVariantTypes,
      settingsItemType: SettingsItemType,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
