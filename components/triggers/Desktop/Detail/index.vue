<template>
  <div class="fb-triggers-desktop-detail__container">
    <triggers-desktop-detail-toolbar
      slot="toolbar"
      :trigger="trigger"
      :edit-mode="editMode"
      :page="page"
      :total="total"
      @toggleEdit="handleToggleEditMode"
      @previous="handlePreviousItem"
      @next="handleNextItem"
      @close="handleClose"
    />

    <triggers-desktop-detail-header
      slot="heading"
      :trigger="trigger"
      :edit-mode="editMode"
    >
      <template slot="buttons">
        <fb-ui-switch-element
          ref="enabled"
          v-if="!editMode"
          :status="form.model.enabled"
          :variant="buttonVariantTypes.PRIMARY"
          @change="handleToggleState"
        />

        <fb-ui-button
          v-if="editMode"
          :variant="buttonVariantTypes.OUTLINE_PRIMARY"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="handleOpenWindow(windowScreenTypes.RENAME)"
        >
          <font-awesome-icon icon="pencil-alt" />
          {{ $t('application.buttons.rename.title') }}
        </fb-ui-button>

        <fb-ui-button
          v-if="editMode"
          :variant="buttonVariantTypes.OUTLINE_DANGER"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="handleOpenWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
        >
          <font-awesome-icon icon="trash-alt" />
          {{ $t('application.buttons.remove.title') }}
        </fb-ui-button>
      </template>
    </triggers-desktop-detail-header>

    <triggers-detail
      :trigger="trigger"
      :edit-mode="editMode"
      class="fb-triggers-desktop-detail__detail"
    />

    <triggers-desktop-settings-rename
      v-if="windowScreen.rename.opened"
      :trigger="trigger"
      :transparent-bg="false"
      @close="handleCloseWindow(windowScreenTypes.RENAME)"
    />

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
  computed,
  defineComponent,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import get from 'lodash/get'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'

import TriggersDetail from '~/components/triggers/Detail/index.vue'

import TriggersDesktopDetailHeader from '~/components/triggers/Desktop/DetailHeader/index.vue'
import TriggersDesktopDetailToolbar from '~/components/triggers/Desktop/DetailToolbar/index.vue'
import TriggersDesktopSettingsRename from '~/components/triggers/Desktop/Settings/Rename/index.vue'

import TriggersSettingsRemove from '~/components/triggers/Settings/Remove/index.vue'

enum WindowScreenTypes {
  RENAME = 'rename',
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersDesktopDetailFormInterface {
  model: {
    enabled: boolean
  }
}

interface TriggersDesktopDetailHeaderWindowInterface {
  rename: {
    opened: boolean
  }
  removeConfirmation: {
    opened: boolean
  }
}

interface TriggersDesktopDetailPropsInterface {
  id: string
  page: number
  total: number
}

export default defineComponent({

  name: 'TriggersDesktopDetail',

  props: {

    id: {
      type: String,
      required: true,
      validator: (value: string): boolean => {
        return Trigger.query().where('id', value).exists()
      },
    },

    page: {
      type: Number,
      default: 1,
    },

    total: {
      type: Number,
      default: 0,
    },

  },

  components: {
    TriggersDetail,

    TriggersDesktopDetailHeader,
    TriggersDesktopDetailToolbar,
    TriggersDesktopSettingsRename,

    TriggersSettingsRemove,
  },

  setup(props: TriggersDesktopDetailPropsInterface, context: SetupContext) {
    const trigger = computed<TriggerInterface | null>((): TriggerInterface | null => {
      return Trigger.find(props.id)
    })

    const editMode = ref<boolean>(false)

    const windowScreen = reactive<TriggersDesktopDetailHeaderWindowInterface>({
      rename: {
        opened: false,
      },
      removeConfirmation: {
        opened: false,
      },
    })

    const form = reactive<TriggersDesktopDetailFormInterface>({
      model: {
        enabled: trigger.value !== null ? trigger.value.enabled : false,
      },
    })

    function handleToggleEditMode(): void {
      editMode.value = !editMode.value
    }

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    function handlePreviousItem(): void {
      context.emit('previous')
    }

    function handleNextItem(): void {
      context.emit('next')
    }

    function handleClose(): void {
      context.emit('close')
    }

    function handleRemoved(): void {
      context.emit('removed')
    }

    async function handleToggleState(): Promise<void> {
      form.model.enabled = !form.model.enabled

      const errorMessage = context.root.$t('triggers.messages.triggerNotUpdated', {
        trigger: trigger.value !== null ? trigger.value.name : '',
      }).toString()

      try {
        await Trigger.dispatch('edit', {
          trigger: trigger.value,
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

    watch(
      (): TriggerInterface | null => trigger.value,
      (val): void => {
        editMode.value = false

        if (val !== null) {
          form.model.enabled = val.enabled
        }
      },
    )

    return {
      windowScreen,
      trigger,
      form,
      editMode,
      handleToggleEditMode,
      handleOpenWindow,
      handleCloseWindow,
      handlePreviousItem,
      handleNextItem,
      handleClose,
      handleRemoved,
      handleToggleState,
      windowScreenTypes: WindowScreenTypes,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
