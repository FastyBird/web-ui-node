<template>
  <list-item
    :variant="listItemTypes.LIST"
    @click="handleClick"
  >
    <font-awesome-icon
      slot="icon"
      :icon="trigger.icon"
    />

    <template slot="heading">
      {{ trigger.name }}
    </template>

    <template slot="sub-heading">
      {{ trigger.description }}
    </template>
  </list-item>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  SetupContext,
} from '@vue/composition-api'

import { TriggerInterface } from '~/models/triggers-module/triggers/types'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

export default defineComponent({

  name: 'TriggersListTrigger',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

  },

  setup(props: {}, context: SetupContext) {
    function handleClick(): void {
      context.emit('click')
    }

    return {
      handleClick,
      listItemTypes: ListItemSizeTypes,
    }
  },

})
</script>
