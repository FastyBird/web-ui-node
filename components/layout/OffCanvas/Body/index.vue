<template functional>
  <div class="fb-off-canvas-body__container">
    <div class="fb-off-canvas-body__heading">
      <h4 v-if="parent._.get(scopedSlots, 'sub-heading', null) === null">
        <slot name="heading" />
      </h4>
      <h4 v-else>
        <span><slot name="heading" /></span>
        <small>
          <slot name="sub-heading" />
        </small>
      </h4>

      <slot
        v-if="parent._.get(scopedSlots, 'left-button', null) !== null"
        name="left-button"
      />

      <slot
        v-if="parent._.get(scopedSlots, 'right-button', null) !== null"
        name="right-button"
      />
    </div>

    <div class="fb-off-canvas-body__body">
      <slot name="body" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from '@vue/composition-api'

export default defineComponent({

  name: 'OffCanvasBody',

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
