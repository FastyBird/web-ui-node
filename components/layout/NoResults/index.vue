<template functional>
  <fb-ui-no-results :class="[data.class, data.staticClass]">
    <font-awesome-icon
      slot="icon"
      :icon="props.icon"
    />

    <font-awesome-icon
      slot="second-icon"
      icon="exclamation-triangle"
    />

    <slot />
  </fb-ui-no-results>
</template>

<script lang="ts">
import {
  defineComponent,
} from '@vue/composition-api'

export default defineComponent({

  name: 'NoResults',

  props: {

    icon: {
      type: String,
      default: '',
    },

  },

})
</script>
