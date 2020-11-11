<template>
  <div class="fb-triggers-detail-default-conditions-container__container">
    <fb-ui-items-container class="fb-triggers-detail-default-conditions-container__items">
      <template slot="heading">
        {{ $tc('triggers.headings.conditions', conditions.length, { count: conditions.length }) }}
      </template>

      <fb-ui-no-results v-if="conditions.length === 0">
        <font-awesome-icon
          slot="icon"
          icon="magic"
        />

        <font-awesome-icon
          slot="second-icon"
          icon="plus"
        />

        {{ $t('triggers.texts.noConditions') }}
      </fb-ui-no-results>

      <template v-else>
        <swipe-list
          ref="list"
          :items="conditions"
          :disabled="!$windowSize.isExtraSmall()"
          class="fb-triggers-detail-default-conditions-container__items"
        >
          <template v-slot="{ item }">
            <div
              :key="item.id"
              class="fb-triggers-detail-default-conditions-container__item"
            >
              <div
                v-if="editMode"
                class="fb-triggers-detail-default-conditions-container__item-buttons"
              >
                <fb-ui-button
                  :variant="buttonVariantTypes.LINK"
                  :size="sizeTypes.EXTRA_SMALL"
                  @click.prevent="openRemoveConfirmation(item)"
                >
                  <font-awesome-icon icon="minus-circle" />
                </fb-ui-button>
              </div>

              <div class="fb-triggers-detail-default-conditions-container__item-detail">
                <triggers-list-condition
                  :trigger="trigger"
                  :condition="item"
                />
              </div>
            </div>
          </template>

          <template v-slot:right="{ item }">
            <div
              @click.prevent="openRemoveConfirmation(item)"
              class="fb-triggers-detail-default-actions-container__item-remove"
            >
              <font-awesome-icon icon="trash" />
            </div>
          </template>
        </swipe-list>
      </template>

      <template slot="buttons">
        <fb-ui-button
          :variant="buttonVariantTypes.LINK"
          :size="sizeTypes.EXTRA_SMALL"
          @click.prevent="openWindow(viewTypes.ADD_OR_EDIT)"
        >
          <font-awesome-icon icon="plus" />
          {{ $t('application.buttons.add.title') }}
        </fb-ui-button>
      </template>
    </fb-ui-items-container>

    <triggers-detail-default-conditions-container-add-or-edit
      v-if="view.addOrEdit.show"
      :trigger="trigger"
      :conditions="conditions"
      @close="closeWindow(viewTypes.ADD_OR_EDIT)"
    />

    <fb-ui-confirmation-window
      v-if="view.removeConfirmation.show"
      @confirmed="remove"
      @close="closeWindow(viewTypes.REMOVE_CONFIRMATION)"
      class="fb-triggers-detail-default-conditions-container__remove"
    >
      <font-awesome-icon
        slot="icon"
        icon="trash"
        class="fb-triggers-detail-default-conditions-container__remove-icon"
      />

      <template slot="header">
        {{ $t('triggers.headings.removeCondition') }}
      </template>

      <template slot="question">
        <i18n
          path="triggers.messages.confirmRemoveCondition"
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

import get from 'lodash/get'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
} from '@fastybird/web-ui-theme'

import 'vue-swipe-actions/dist/vue-swipe-actions.css'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Condition from '~/models/triggers-node/conditions/Condition'
import { ConditionInterface } from '~/models/triggers-node/conditions/types'

import TriggersListCondition from '~/components/triggers/ListCondition/index.vue'
import TriggersDetailDefaultConditionsContainerAddOrEdit
  from '~/components/triggers/Detail/Default/ConditionsContainer/AddOrEdit/index.vue'

enum ViewTypes {
  ADD_OR_EDIT = 'addOrEdit',
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersDetailDefaultConditionsContainerViewRemoveConfirmationInterface {
  show: boolean
  condition: string | null
}

interface TriggersDetailDefaultConditionsContainerViewAddOrEditConditionInterface {
  show: boolean
}

interface TriggersDetailDefaultConditionsContainerViewInterface {
  addOrEdit: TriggersDetailDefaultConditionsContainerViewAddOrEditConditionInterface
  removeConfirmation: TriggersDetailDefaultConditionsContainerViewRemoveConfirmationInterface
}

interface TriggersDetailDefaultConditionsContainerPropsInterface {
  trigger: TriggerInterface
  editMode: boolean
}

export default defineComponent({

  name: 'TriggersDetailDefaultConditionsContainer',

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
    TriggersListCondition,
    TriggersDetailDefaultConditionsContainerAddOrEdit,

    SwipeList,
  },

  setup(props: TriggersDetailDefaultConditionsContainerPropsInterface, context: SetupContext) {
    const view = reactive<TriggersDetailDefaultConditionsContainerViewInterface>({
      addOrEdit: {
        show: false,
      },
      removeConfirmation: {
        show: false,
        condition: null,
      },
    })

    const conditions = computed<Array<ConditionInterface>>((): Array<ConditionInterface> => {
      return Condition
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

    function openRemoveConfirmation(condition: ConditionInterface): void {
      view.removeConfirmation.condition = condition.id

      openWindow(ViewTypes.REMOVE_CONFIRMATION)
    }

    async function remove(): Promise<void> {
      closeWindow(ViewTypes.REMOVE_CONFIRMATION)

      if (view.removeConfirmation.condition !== null) {
        const condition = Condition.find(view.removeConfirmation.condition)

        if (condition !== null) {
          const errorMessage = context.root.$t('triggers.messages.conditionNotRemoved', {
            trigger: props.trigger.name,
          }).toString()

          try {
            await Condition.dispatch('remove', {
              condition,
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

      view.removeConfirmation.condition = null
    }

    return {
      view,
      viewTypes: ViewTypes,
      conditions,
      windowSize,
      openWindow,
      closeWindow,
      openRemoveConfirmation,
      remove,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
