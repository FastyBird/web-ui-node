<template>
  <div class="fb-list-layout__container">
    <div class="fb-list-layout__list-column">
      <list-items-search :search-placeholder="searchPlaceholder" />

      <div class="fb-list-layout__items">
        <slot name="items" />
      </div>
    </div>

    <div
      v-if="windowSize !== 'xs' && isMounted"
      class="fb-list-layout__detail-column"
    >
      <template v-if="slotExists('detail')">
        <slot
          v-if="slotExists('toolbar')"
          name="toolbar"
        />

        <slot
          v-if="slotExists('heading')"
          name="heading"
        />

        <div class="fb-list-layout__detail">
          <slot name="detail" />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
} from '@vue/composition-api'

export default defineComponent({

  name: 'ListLayout',

  props: {

    searchPlaceholder: {
      type: String,
      default: 'Search...',
    },

  },

  setup(props, context) {
    const isMounted = ref<boolean>(false)

    const windowSize = computed<string>((): string => {
      return context.root.$store.state.app.windowSize
    })

    onMounted((): void => {
      isMounted.value = true
    })

    return {
      isMounted,
      windowSize,
    }
  },
})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
