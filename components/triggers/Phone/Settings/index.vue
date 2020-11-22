<template>
  <div class="fb-triggers-phone-settings__container">
    <h3 class="fb-triggers-phone-settings__heading">
      {{ $t('triggers.headings.aboutTrigger') }}
    </h3>

    <fb-ui-content
      :ph="sizeTypes.SMALL"
      :pv="sizeTypes.SMALL"
    >
      <triggers-settings-rename
        :trigger="trigger"
        :remote-form-submit.sync="reRemoteFormSubmit"
        :remote-form-result.sync="reRemoteFormResult"
        :remote-form-reset.sync="reRemoteFormReset"
      />
    </fb-ui-content>

    <fb-ui-items-container>
      <template slot="heading">
        {{ $t('triggers.headings.generalSettings') }}
      </template>

      <list-item
        :variant="listItemTypes.DEFAULT"
        class="fb-triggers-phone-settings__item fb-triggers-phone-settings__item-action"
      >
        <fb-ui-switch-element
          slot="detail"
          ref="enabled"
          :status="form.model.enabled"
          :variant="switchVariantTypes.PRIMARY"
          @change="handleToggleState"
        />

        <template
          slot="heading"
          v-if="trigger.enabled"
        >
          {{ $t('triggers.buttons.triggerEnabled.title') }}
        </template>
        <template
          slot="heading"
          v-else
        >
          {{ $t('triggers.buttons.triggerDisabled.title') }}
        </template>
      </list-item>

      <list-item
        :variant="listItemTypes.DEFAULT"
        @click="handleOpenWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
        class="fb-triggers-phone-settings__item fb-triggers-phone-settings__item-remove"
      >
        <template slot="heading">
          {{ $t('triggers.buttons.removeTrigger.title') }}
        </template>
      </list-item>
    </fb-ui-items-container>

    <triggers-settings-remove
      v-if="windowScreen.removeConfirmation.opened"
      :trigger="trigger"
      :transparent-bg="false"
      @close="handleCloseWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
      @removed="handleRemoved"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  watch,
} from '@vue/composition-api'

import get from 'lodash/get'

import {
  FbFormResultTypes,
  FbSizeTypes,
  FbUiSwitchElementVariantTypes,
} from '@fastybird/web-ui-theme'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

import TriggersSettingsRename from '~/components/triggers/Settings/Rename/index.vue'
import TriggersSettingsRemove from '~/components/triggers/Settings/Remove/index.vue'

enum WindowScreenTypes {
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersPhoneSettingsWindowInterface {
  removeConfirmation: {
    opened: boolean
  }
}

interface TriggersPhoneSettingsFormInterface {
  model: {
    enabled: boolean
  }
}

interface TriggersPhoneSettingsPropsInterface {
  trigger: TriggerInterface
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
  remoteFormReset: boolean
}

export default defineComponent({

  name: 'TriggersPhoneSettings',

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
    TriggersSettingsRename,
    TriggersSettingsRemove,
  },

  setup(props: TriggersPhoneSettingsPropsInterface, context) {
    const reRemoteFormSubmit = ref<boolean>(false)

    const reRemoteFormResult = ref<FbFormResultTypes>(FbFormResultTypes.NONE)

    const reRemoteFormReset = ref<boolean>(false)

    const isMounted = ref<boolean>(false)

    const windowScreen = reactive<TriggersPhoneSettingsWindowInterface>({
      removeConfirmation: {
        opened: false,
      },
    })

    const form = reactive<TriggersPhoneSettingsFormInterface>({
      model: {
        enabled: props.trigger.enabled,
      },
    })

    function handleToggleState(): void {
      form.model.enabled = !form.model.enabled
      const errorMessage = context.root.$t('triggers.messages.triggerNotUpdated', {
        trigger: props.trigger.name,
      }).toString()

      Trigger.dispatch('edit', {
        trigger: props.trigger,
        data: {
          enabled: !props.trigger.enabled,
        },
      })
        .catch((e) => {
          if (get(e, 'exception', null) !== null) {
            context.root.$flashMessage(errorMessage, 'error')
          } else {
            context.root.$flashMessage(errorMessage, 'error')
          }
        })
    }

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    function handleRemoved(): void {
      handleCloseWindow(WindowScreenTypes.REMOVE_CONFIRMATION)

      context.emit('removed')
    }

    onMounted((): void => {
      isMounted.value = true
    })

    watch(
      (): boolean => reRemoteFormSubmit.value,
      (val): void => {
        if (isMounted.value) {
          context.emit('update:remoteFormSubmit', val)
        }
      },
    )

    watch(
      (): FbFormResultTypes => reRemoteFormResult.value,
      (val): void => {
        if (isMounted.value) {
          context.emit('update:remoteFormResult', val)
        }
      },
    )

    watch(
      (): boolean => reRemoteFormReset.value,
      (val): void => {
        if (isMounted.value) {
          context.emit('update:remoteFormReset', val)
        }
      },
    )

    watch(
      (): boolean => props.remoteFormSubmit,
      (val): void => {
        if (isMounted.value) {
          reRemoteFormSubmit.value = val
        }
      },
    )

    watch(
      (): FbFormResultTypes => props.remoteFormResult,
      (val): void => {
        if (isMounted.value) {
          reRemoteFormResult.value = val
        }
      },
    )

    watch(
      (): boolean => props.remoteFormReset,
      (val): void => {
        if (isMounted.value) {
          reRemoteFormReset.value = val

          if (val) {
            form.model.enabled = props.trigger.enabled
          }
        }
      },
    )

    return {
      reRemoteFormSubmit,
      reRemoteFormResult,
      reRemoteFormReset,
      windowScreen,
      form,
      handleToggleState,
      handleOpenWindow,
      handleCloseWindow,
      handleRemoved,
      windowScreenTypes: WindowScreenTypes,
      sizeTypes: FbSizeTypes,
      listItemTypes: ListItemSizeTypes,
      switchVariantTypes: FbUiSwitchElementVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
