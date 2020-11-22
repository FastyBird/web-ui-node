<template>
  <div class="fb-triggers-detail-default-actions-container__container">
    <fb-ui-items-container>
      <template slot="heading">
        {{ $tc('triggers.headings.actions', actions.length, { count: actions.length }) }}
      </template>

      <no-results
        v-if="actions.length === 0"
        icon="plug"
      >
        {{ $t('triggers.texts.noActions') }}
      </no-results>

      <swipe-list
        ref="list"
        v-else
        :items="actions"
        :disabled="!$windowSize.isExtraSmall()"
        class="fb-triggers-detail-default-actions-container__items"
      >
        <template v-slot="{ item }">
          <div
            :key="item.id"
            class="fb-triggers-detail-default-actions-container__item"
          >
            <div
              v-if="editMode"
              class="fb-triggers-detail-default-actions-container__item-buttons"
            >
              <fb-ui-button
                :variant="buttonVariantTypes.LINK"
                :size="sizeTypes.EXTRA_SMALL"
                @click.prevent="handleOpenRemoveConfirmation(item)"
              >
                <font-awesome-icon icon="minus-circle" />
              </fb-ui-button>
            </div>

            <div class="fb-triggers-detail-default-actions-container__item-detail">
              <triggers-list-action
                :trigger="trigger"
                :action="item"
              />
            </div>
          </div>
        </template>

        <template v-slot:right="{ item }">
          <div
            @click.prevent="handleOpenRemoveConfirmation(item)"
            class="fb-triggers-detail-default-actions-container__item-remove"
          >
            <font-awesome-icon icon="trash" />
          </div>
        </template>
      </swipe-list>

      <template slot="buttons">
        <fb-ui-button
          v-if="editMode || $windowSize.isExtraSmall()"
          :variant="$windowSize.isExtraSmall() ? buttonVariantTypes.LINK : buttonVariantTypes.OUTLINE_PRIMARY"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="handleOpenWindow(windowScreenTypes.ADD_OR_EDIT)"
        >
          <font-awesome-icon icon="plus" />
          {{ $t('application.buttons.add.title') }}
        </fb-ui-button>
      </template>
    </fb-ui-items-container>

    <triggers-detail-default-actions-container-add-or-edit
      v-if="windowScreen.addOrEdit.opened"
      :trigger="trigger"
      :actions="actions"
      @close="handleCloseWindow(windowScreenTypes.ADD_OR_EDIT)"
    />

    <fb-ui-confirmation-window
      v-if="windowScreen.removeConfirmation.opened"
      @confirmed="handleRemove"
      @close="handleCloseWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
    >
      <font-awesome-icon
        slot="icon"
        icon="trash"
        class="fb-triggers-detail-default-actions-container__remove-icon"
      />

      <template slot="header">
        {{ $t('triggers.headings.removeAction') }}
      </template>

      <template slot="question">
        <i18n
          path="triggers.messages.confirmRemoveAction"
          tag="p"
        >
          <strong slot="trigger">{{ trigger.name }}</strong>
        </i18n>
      </template>
    </fb-ui-confirmation-window>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  reactive,
  SetupContext,
} from '@vue/composition-api'

// @ts-ignore
import { SwipeList } from 'vue-swipe-actions'

import get from 'lodash/get'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import 'vue-swipe-actions/dist/vue-swipe-actions.css'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Action from '~/models/triggers-node/actions/Action'
import { ActionInterface } from '~/models/triggers-node/actions/types'

import TriggersListAction from '~/components/triggers/ListAction/index.vue'
import TriggersDetailDefaultActionsContainerAddOrEdit from '~/components/triggers/Detail/Default/ActionsContainer/AddOrEdit/index.vue'

enum WindowScreenTypes {
  ADD_OR_EDIT = 'addOrEdit',
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersDetailDefaultActionsContainerWindowInterface {
  addOrEdit: {
    opened: boolean
  }
  removeConfirmation: {
    opened: boolean
    action: string | null
  }
}

interface TriggersDetailDefaultActionsContainerPropsInterface {
  trigger: TriggerInterface
  editMode: boolean
}

export default defineComponent({

  name: 'TriggersDetailDefaultActionsContainer',

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
    TriggersListAction,
    TriggersDetailDefaultActionsContainerAddOrEdit,

    SwipeList,
  },

  setup(props: TriggersDetailDefaultActionsContainerPropsInterface, context: SetupContext) {
    const windowScreen = reactive<TriggersDetailDefaultActionsContainerWindowInterface>({
      addOrEdit: {
        opened: false,
      },
      removeConfirmation: {
        opened: false,
        action: null,
      },
    })

    const actions = computed<Array<ActionInterface>>((): Array<ActionInterface> => {
      return Action
        .query()
        .where('triggerId', props.trigger.id)
        .orderBy('id')
        .all()
    })

    const windowSize = computed<string>((): string => context.root.$store.state.app.windowSize)

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    function handleOpenRemoveConfirmation(action: ActionInterface): void {
      windowScreen.removeConfirmation.action = action.id

      handleOpenWindow(WindowScreenTypes.REMOVE_CONFIRMATION)
    }

    async function handleRemove(): Promise<void> {
      handleCloseWindow(WindowScreenTypes.REMOVE_CONFIRMATION)

      if (windowScreen.removeConfirmation.action !== null) {
        const action = Action.find(windowScreen.removeConfirmation.action)

        if (action !== null) {
          const errorMessage = context.root.$t('triggers.messages.actionNotRemoved', {
            trigger: props.trigger.name,
          }).toString()

          try {
            await Action.dispatch('remove', {
              action,
            })
          } catch (e) {
            if (get(e, 'exception', null) !== null) {
              context.root.handleException(e.exception, errorMessage)
            } else {
              context.root.$flashMessage(errorMessage, 'error')
            }
          }
        }
      }

      windowScreen.removeConfirmation.action = null
    }

    return {
      windowScreen,
      actions,
      windowSize,
      handleOpenWindow,
      handleCloseWindow,
      handleOpenRemoveConfirmation,
      handleRemove,
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
