<template functional>
  <div
    v-if="props.type === 'div'"
    :class="[data.class, data.staticClass, 'fb-settings-list-item__container']"
  >
    <slot />
  </div>

  <button
    v-else
    :class="[data.class, data.staticClass, 'fb-settings-list-item__container']"
    role="button"
    @click.prevent="listeners['click']()"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { createComponent } from '@vue/composition-api'

export default createComponent({

  name: 'SettingsListItem',

  props: {

    type: {
      type: String,
      default: 'div',
      validator: (value) => {
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
