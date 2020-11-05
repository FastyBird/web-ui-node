<template functional>
  <div :class="[data.class, data.staticClass, 'fb-desktop-detail-heading__container']">
    <div class="fb-desktop-detail-heading__icon">
      <slot name="icon" />
    </div>

    <div
      :class="['fb-desktop-detail-heading__heading', { 'fb-desktop-detail-heading__heading-with-subheading': parent._.get(scopedSlots, 'sub-heading', null) !== null }]"
    >
      <slot name="heading" />
      <slot name="sub-heading" />
    </div>

    <div
      v-if="parent._.get(scopedSlots, 'buttons', null) !== null"
      class="fb-desktop-detail-heading__buttons"
    >
      <slot name="buttons" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from '@vue/composition-api'

export default defineComponent({

  name: 'DesktopDetailHeading',

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
