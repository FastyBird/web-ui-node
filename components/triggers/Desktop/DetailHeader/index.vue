<template>
  <div class="fb-triggers-desktop-detail-header__container">
    <desktop-detail-heading>
      <h2 slot="heading">
        {{ trigger.name }}
      </h2>

      <small slot="sub-heading">
        {{ trigger.description }}
      </small>

      <font-awesome-icon
        slot="icon"
        :icon="trigger.icon"
      />

      <template slot="buttons">
        <fb-ui-switch-element
          v-if="!editMode"
          ref="enabled"
          :status="form.model.enabled"
          variant="primary"
          @change="toggleTriggerState"
        />

        <fb-ui-button
          v-if="editMode"
          variant="outline-primary"
          size="xs"
          @click.prevent="openForm(viewTypes.RENAME_FORM)"
        >
          <fb-ui-spinner
            v-if="view.loading.renameForm"
            size="sm"
          />
          <template v-else>
            <font-awesome-icon icon="pencil-alt" />
            {{ $t('application.buttons.rename.title') }}
          </template>
        </fb-ui-button>

        <fb-ui-button
          v-if="editMode"
          variant="outline-danger"
          size="xs"
          @click.prevent="openForm(viewTypes.REMOVE_CONFIRMATION)"
        >
          <fb-ui-spinner
            v-if="view.loading.removeConfirmation"
            size="sm"
            variant="danger"
          />
          <template v-else>
            <font-awesome-icon icon="trash-alt" />
            {{ $t('application.buttons.remove.title') }}
          </template>
        </fb-ui-button>
      </template>
    </desktop-detail-heading>

    <triggers-settings-rename
      v-if="view.renameForm.show"
      :trigger="trigger"
      :transparent-bg="false"
      @loaded="view.loading.renameForm = false"
      @close="closeForm(viewTypes.RENAME_FORM)"
    />

    <triggers-settings-remove
      v-if="view.removeConfirmation.show"
      :trigger="trigger"
      :transparent-bg="false"
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
  SetupContext,
} from '@vue/composition-api'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Trigger from '~/models/triggers-node/triggers/Trigger'

const TriggersSettingsRename = () => import('~/components/triggers/Settings/Rename/index.vue')
const TriggersSettingsRemove = () => import('~/components/triggers/Settings/Remove/index.vue')

enum ViewTypes {
  RENAME_FORM = 'renameForm',
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersDesktopDetailHeaderViewLoadingInterface {
  renameForm: boolean
  removeConfirmation: boolean
}

interface TriggersDesktopDetailHeaderViewRenameInterface {
  show: boolean
}

interface TriggersDesktopDetailHeaderViewRemoveConfirmationInterface {
  show: boolean
}

interface TriggersDesktopDetailHeaderViewInterface {
  loading: TriggersDesktopDetailHeaderViewLoadingInterface
  renameForm: TriggersDesktopDetailHeaderViewRenameInterface
  removeConfirmation: TriggersDesktopDetailHeaderViewRemoveConfirmationInterface
}

interface TriggersDesktopDetailHeaderFormModelInterface {
  enabled: boolean
}

interface TriggersDesktopDetailHeaderFormInterface {
  model: TriggersDesktopDetailHeaderFormModelInterface
}

interface TriggersDesktopDetailHeaderPropsInterface {
  trigger: TriggerInterface
  editMode: boolean
}

export default defineComponent({

  name: 'TriggersDesktopDetailHeader',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    editMode: {
      type: Boolean,
      default: false,
    },

  },

  components: {
    TriggersSettingsRename,
    TriggersSettingsRemove,
  },

  setup(props: TriggersDesktopDetailHeaderPropsInterface, context: SetupContext) {
    const view = reactive<TriggersDesktopDetailHeaderViewInterface>({
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

    const form = reactive<TriggersDesktopDetailHeaderFormInterface>({
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
