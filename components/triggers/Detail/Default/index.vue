<template>
  <scroll-shadow class="fb-triggers-detail-default__container">
    <triggers-detail-default-conditions-container
      v-if="trigger.isAutomatic"
      :trigger="trigger"
      :edit-mode="editMode"
    />

    <triggers-detail-default-actions-container
      :trigger="trigger"
      :edit-mode="editMode"
    />
  </scroll-shadow>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api'

import { TriggerInterface } from '~/models/triggers-node/triggers/types'

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

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
