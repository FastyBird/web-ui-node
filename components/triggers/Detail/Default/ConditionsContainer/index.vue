<template>
  <div class="fb-triggers-detail-default-conditions-container__container">
    <fb-ui-items-container class="fb-triggers-detail-default-conditions-container__items">
      <template slot="heading">
        {{ $tc('triggers.headings.conditions', conditions.length, { count: conditions.length }) }}
      </template>

      <no-results
        v-if="conditions.length === 0"
        icon="magic"
      >
        {{ $t('triggers.texts.noConditions') }}
      </no-results>

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
                  @click.prevent="handleOpenRemoveConfirmation(item)"
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
              @click.prevent="handleOpenRemoveConfirmation(item)"
              class="fb-triggers-detail-default-actions-container__item-remove"
            >
              <font-awesome-icon icon="trash" />
            </div>
          </template>
        </swipe-list>
      </template>

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

    <triggers-detail-default-conditions-container-add-or-edit
      v-if="windowScreen.addOrEdit.opened"
      :trigger="trigger"
      :conditions="conditions"
      @close="handleCloseWindow(windowScreenTypes.ADD_OR_EDIT)"
    />

    <fb-ui-confirmation-window
      v-if="windowScreen.removeConfirmation.opened"
      @confirmed="handleRemove"
      @close="handleCloseWindow(windowScreenTypes.REMOVE_CONFIRMATION)"
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

// @ts-ignore
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
import TriggersDetailDefaultConditionsContainerAddOrEdit from '~/components/triggers/Detail/Default/ConditionsContainer/AddOrEdit/index.vue'

enum WindowScreenTypes {
  ADD_OR_EDIT = 'addOrEdit',
  REMOVE_CONFIRMATION = 'removeConfirmation',
}

interface TriggersDetailDefaultConditionsContainerWindowInterface {
  addOrEdit: {
    opened: boolean
  }
  removeConfirmation: {
    opened: boolean
    condition: string | null
  }
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
    const windowScreen = reactive<TriggersDetailDefaultConditionsContainerWindowInterface>({
      addOrEdit: {
        opened: false,
      },
      removeConfirmation: {
        opened: false,
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

    function handleOpenWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = true
    }

    function handleCloseWindow(type: WindowScreenTypes): void {
      windowScreen[type].opened = false
    }

    function handleOpenRemoveConfirmation(condition: ConditionInterface): void {
      windowScreen.removeConfirmation.condition = condition.id

      handleOpenWindow(WindowScreenTypes.REMOVE_CONFIRMATION)
    }

    async function handleRemove(): Promise<void> {
      handleCloseWindow(WindowScreenTypes.REMOVE_CONFIRMATION)

      if (windowScreen.removeConfirmation.condition !== null) {
        const condition = Condition.find(windowScreen.removeConfirmation.condition)

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

      windowScreen.removeConfirmation.condition = null
    }

    return {
      windowScreen,
      conditions,
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
