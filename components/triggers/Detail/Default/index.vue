<template>
  <div class="fb-triggers-detail-default__container">
    <triggers-detail-default-conditions-container
      v-if="trigger.isAutomatic"
      :trigger="trigger"
      :edit-mode="editMode"
    />

    <triggers-detail-default-actions-container
      :trigger="trigger"
      :edit-mode="editMode"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
} from '@vue/composition-api'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Action from '~/models/triggers-node/actions/Action'
import Notification from '~/models/triggers-node/notifications/Notification'
import Condition from '~/models/triggers-node/conditions/Condition'

import TriggersDetailDefaultActionsContainer from '~/components/triggers/Detail/Default/ActionsContainer/index.vue'
import TriggersDetailDefaultConditionsContainer from '~/components/triggers/Detail/Default/ConditionsContainer/index.vue'

interface TriggersDetailDefaultPropsInterface {
  trigger: TriggerInterface
  editMode: boolean
}

export default defineComponent({

  name: 'TriggersDetailDefault',

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
    TriggersDetailDefaultActionsContainer,
    TriggersDetailDefaultConditionsContainer,
  },

  setup(props: TriggersDetailDefaultPropsInterface) {
    const actions = computed<number>((): number => {
      return Action
        .query()
        .where('triggerId', props.trigger.id)
        .orderBy('id')
        .count()
    })

    const notifications = computed<number>((): number => {
      return Notification
        .query()
        .where('triggerId', props.trigger.id)
        .orderBy('id')
        .count()
    })

    const conditions = computed<number>((): number => {
      return Condition
        .query()
        .where('triggerId', props.trigger.id)
        .orderBy('id')
        .count()
    })

    return {
      actions,
      notifications,
      conditions,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
