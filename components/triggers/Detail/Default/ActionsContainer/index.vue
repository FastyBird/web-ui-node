<template>
  <div class="fb-triggers-detail-default-actions-container__container">
    <fb-ui-items-container>
      <template slot="heading">
        {{ $tc('triggers.headings.actions', actions.length, { count: actions.length }) }}
      </template>

      <fb-ui-no-results v-if="actions.length === 0">
        <font-awesome-icon
          slot="icon"
          icon="magic"
        />

        <font-awesome-icon
          slot="second-icon"
          icon="plus"
        />

        {{ $t('triggers.texts.noActions') }}
      </fb-ui-no-results>

      <template v-else>
        <swipe-list
          ref="list"
          :items="actions"
          :disabled="windowSize !== 'xs'"
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
                  variant="link"
                  size="xs"
                  @click.prevent="openRemoveConfirmation(item)"
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
              class="fb-triggers-detail-default-actions-container__item-remove"
              @click.prevent="openRemoveConfirmation(item)"
            >
              <font-awesome-icon icon="trash" />
            </div>
          </template>
        </swipe-list>
      </template>

      <template slot="buttons">
        <fb-ui-button
          variant="link"
          size="xs"
          @click.prevent="openWindow(viewTypes.ADD_OR_EDIT)"
        >
          <font-awesome-icon icon="plus" />
          {{ $t('application.buttons.add.title') }}
        </fb-ui-button>
      </template>
    </fb-ui-items-container>

    <triggers-detail-default-actions-container-add-or-edit
      v-if="view.addOrEdit.show"
      :trigger="trigger"
      :actions="actions"
      @close="closeWindow(viewTypes.ADD_OR_EDIT)"
    />

    <fb-ui-confirmation-window
      v-if="view.removeConfirmation.show"
      class="fb-triggers-detail-default-actions-container__remove-container"
      @confirmed="removeAction"
      @close="closeWindow(viewTypes.REMOVE_CONFIRMATION)"
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

import { SwipeList } from 'vue-swipe-actions'

import 'vue-swipe-actions/dist/vue-swipe-actions.css'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Action from '~/models/triggers-node/actions/Action'
import { ActionInterface } from '~/models/triggers-node/actions/types'

import TriggersListAction from '~/components/triggers/ListAction/index.vue'
import TriggersDetailDefaultActionsContainerAddOrEdit from '~/components/triggers/Detail/Default/ActionsContainer/AddOrEdit/index.vue'

enum ViewTypes {
  ADD_OR_EDIT = 'addOrEdit',
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersDetailDefaultActionsContainerViewRemoveConfirmationInterface {
  show: boolean
  action: string | null
}

interface TriggersDetailDefaultActionsContainerViewAddOrEditInterface {
  show: boolean
}

interface TriggersDetailDefaultActionsContainerViewInterface {
  addOrEdit: TriggersDetailDefaultActionsContainerViewAddOrEditInterface
  removeConfirmation: TriggersDetailDefaultActionsContainerViewRemoveConfirmationInterface
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
    const view = reactive<TriggersDetailDefaultActionsContainerViewInterface>({
      addOrEdit: {
        show: false,
      },
      removeConfirmation: {
        show: false,
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

    // Open info window
    function openWindow(type: ViewTypes): void {
      view[type].show = true
    }

    // Close opened window
    function closeWindow(type: ViewTypes): void {
      view[type].show = false
    }

    function openRemoveConfirmation(action: ActionInterface): void {
      view.removeConfirmation.action = action.id

      openWindow(ViewTypes.REMOVE_CONFIRMATION)
    }

    async function removeAction(): Promise<void> {
      closeWindow(ViewTypes.REMOVE_CONFIRMATION)

      if (view.removeConfirmation.action !== null) {
        const action = Action.find(view.removeConfirmation.action)

        if (action !== null) {
          await Action.dispatch('remove', {
            action,
          })
        }
      }

      view.removeConfirmation.action = null
    }

    return {
      view,
      viewTypes: ViewTypes,
      actions,
      windowSize,
      openWindow,
      closeWindow,
      openRemoveConfirmation,
      removeAction,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
