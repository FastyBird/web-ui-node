<template functional>
  <div
    v-if="props.type === 'div'"
    :class="[data.class, data.staticClass, 'fb-settings-list-item__container']"
  >
    <div
      v-if="parent._.get(scopedSlots, 'prefix', null) !== null"
      class="fb-settings-list-item__prefix"
    >
      <slot name="prefix" />
    </div>
    <div class="fb-settings-list-item__content">
      <slot />
    </div>
    <div
      v-if="parent._.get(scopedSlots, 'suffix', null) !== null"
      class="fb-settings-list-item__suffix"
    >
      <slot name="suffix" />
    </div>
  </div>

  <button
    v-else
    :class="[data.class, data.staticClass, 'fb-settings-list-item__container']"
    @click.prevent="listeners['click']"
    role="button"
  >
    <span
      v-if="parent._.get(scopedSlots, 'prefix', null) !== null"
      class="fb-settings-list-item__prefix"
    >
      <slot name="prefix" />
    </span>
    <span class="fb-settings-list-item__content">
      <slot />
    </span>
    <span
      v-if="parent._.get(scopedSlots, 'suffix', null) !== null"
      class="fb-settings-list-item__suffix"
    >
      <slot name="suffix" />
    </span>
  </button>
</template>

<script lang="ts">
import {
  defineComponent,
} from '@vue/composition-api'

export default defineComponent({

  name: 'SettingsListItem',

  props: {

    type: {
      type: String,
      default: 'div',
      validator: (value: string): boolean => {
        // The value must match one of these strings
        return [
          'div', 'button',
        ].includes(value)
      },
    },

  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
