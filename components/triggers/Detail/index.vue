<template>
  <triggers-detail-default
    :trigger="trigger"
    :edit-mode="editMode"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api'

import { TriggerInterface } from '~/models/triggers-module/triggers/types'

import TriggersDetailDefault from '~/components/triggers/Detail/Default/index.vue'

export default defineComponent({

  name: 'TriggersDetail',

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
    TriggersDetailDefault,
  },

})
</script>
