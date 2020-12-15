<template>
  <desktop-detail-heading class="fb-triggers-desktop-detail-header__container">
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
      <slot name="buttons" />
    </template>
  </desktop-detail-heading>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api'

import { TriggerInterface } from '~/models/triggers-module/triggers/types'

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

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
