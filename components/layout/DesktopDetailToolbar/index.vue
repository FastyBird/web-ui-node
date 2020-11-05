<template functional>
  <div :class="[data.class, data.staticClass, 'fb-desktop-detail-toolbar__container']">
    <div
      v-if="parent._.get(scopedSlots, 'left', null) !== null"
      class="fb-desktop-detail-toolbar__left"
    >
      <slot name="left" />
    </div>

    <div
      v-if="parent._.get(scopedSlots, 'right', null) !== null"
      class="fb-desktop-detail-toolbar__right"
    >
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from '@vue/composition-api'

export default defineComponent({

  name: 'DesktopDetailToolbar',

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
