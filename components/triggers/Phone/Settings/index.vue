<template>
  <div class="fb-triggers-settings-trigger__container">
    <fb-ui-items-container>
      <template slot="heading">
        {{ $t('triggers.headings.generalSettings') }}
      </template>

      <settings-list-item class="fb-triggers-settings-trigger__item fb-triggers-settings-trigger__item-action">
        <fb-ui-switch-element
          slot="suffix"
          ref="enabled"
          :status="form.model.enabled"
          variant="primary"
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
        type="button"
        class="fb-triggers-settings-trigger__item"
        @click="openForm(viewTypes.RENAME_FORM)"
      >
        <fb-ui-spinner
          v-if="view.loading.renameForm"
          slot="prefix"
          size="sm"
        />
        <font-awesome-icon
          slot="suffix"
          icon="angle-right"
        />

        {{ $t('triggers.buttons.renameTrigger.title') }}
      </settings-list-item>

      <settings-list-item
        type="button"
        class="fb-triggers-settings-trigger__item fb-triggers-settings-trigger__item-remove"
        @click="openWindow(viewTypes.REMOVE_CONFIRMATION)"
      >
        <fb-ui-spinner
          v-if="view.loading.removeConfirmation"
          slot="prefix"
          size="sm"
        />
        <font-awesome-icon
          slot="suffix"
          icon="angle-right"
        />

        {{ $t('triggers.buttons.removeTrigger.title') }}
      </settings-list-item>
    </fb-ui-items-container>

    <triggers-settings-rename
      v-if="view.renameForm.show"
      :trigger="trigger"
      :transparent-bg="true"
      @loaded="view.loading.renameForm = false"
      @close="closeForm(viewTypes.RENAME_FORM)"
    />

    <triggers-settings-remove
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
} from '@vue/composition-api'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'

const TriggersSettingsRename = () => import('~/components/triggers/Settings/Rename/index.vue')
const TriggersSettingsRemove = () => import('~/components/triggers/Settings/Remove/index.vue')

enum ViewTypes {
  RENAME_FORM = 'renameForm',
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersSettingsViewLoadingInterface {
  renameForm: boolean
  removeConfirmation: boolean
}

interface TriggersSettingsViewRenameInterface {
  show: boolean
}

interface TriggersSettingsViewRemoveConfirmationInterface {
  show: boolean
}

interface TriggersSettingsViewInterface {
  loading: TriggersSettingsViewLoadingInterface
  renameForm: TriggersSettingsViewRenameInterface
  removeConfirmation: TriggersSettingsViewRemoveConfirmationInterface
}

interface TriggersSettingsFormModelInterface {
  enabled: boolean
}

interface TriggersSettingsFormInterface {
  model: TriggersSettingsFormModelInterface
}

interface TriggersSettingsInterface {
  trigger: TriggerInterface
}

export default defineComponent({

  name: 'TriggersPhoneSettings',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

  },

  components: {
    TriggersSettingsRename,
    TriggersSettingsRemove,
  },

  setup(props: TriggersSettingsInterface, context) {
    const view = reactive<TriggersSettingsViewInterface>({
      loading: {
        renameForm: false,
        removeConfirmation: false,
      },
      renameForm: {
        show: false,
      },
      removeConfirmation: {
        show: false,
      },
    })

    const form = reactive<TriggersSettingsFormInterface>({
      model: {
        enabled: props.trigger.enabled,
      },
    })

    // Open edit form
    function openForm(type: ViewTypes): void {
      view[type].show = true

      if (Object.prototype.hasOwnProperty.call(view.loading, type)) {
        if (type === ViewTypes.RENAME_FORM) {
          view.loading[type] = true
        }
      }
    }

    // Close edit form
    function closeForm(type: ViewTypes): void {
      view[type].show = false
    }

    // Submit edit parameter
    async function toggleTriggerState(): Promise<void> {
      form.model.enabled = !form.model.enabled

      await Trigger.dispatch('edit', {
        trigger: props.trigger,
        data: {
          enabled: form.model.enabled,
        },
      })
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

    return {
      view,
      viewTypes: ViewTypes,
      form,
      openForm,
      closeForm,
      toggleTriggerState,
      openWindow,
      closeWindow,
      triggerRemoved,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
