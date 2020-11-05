<template>
  <div class="fb-list-items-search__container">
    <fb-form-input
      v-model="search"
      :placeholder="searchPlaceholder"
      name="search"
      spellcheck="false"
    >
      <font-awesome-icon
        slot="right-addon"
        icon="search"
      />
    </fb-form-input>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
} from '@vue/composition-api'

export default defineComponent({

  name: 'ListItemsSearch',

  props: {

    searchPlaceholder: {
      type: String,
      default: 'Search...',
    },

  },

  setup() {
    const search = ref<string>('')

    return {
      search,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
