<template>
  <div
    :data-state="status ? 'on' : 'off'"
    :class="['fb-list-item__container', {'fb-list-item__container-with-status' : showStatus}]"
    @click="oneClick($event)"
  >
    <div class="fb-list-item__box">
      <div class="fb-list-item__icon">
        <slot name="icon" />
      </div>

      <div :class="['fb-list-item__heading', { 'with-subheading': slotExists('sub-heading') }]">
        <h2>
          <slot name="heading" />
        </h2>
        <small v-if="slotExists('sub-heading')">
          <slot name="sub-heading" />
        </small>
      </div>

      <div
        v-if="slotExists('detail-large')"
        class="fb-list-item__detail-content-large"
      >
        <slot name="detail-large" />
      </div>

      <div
        v-else-if="slotExists('detail')"
        class="fb-list-item__detail-content"
      >
        <slot name="detail" />
      </div>

      <div
        v-else
        class="fb-list-item__detail-icon"
      >
        <font-awesome-icon
          icon="chevron-right"
          role="button"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { createComponent } from '@vue/composition-api'

export default createComponent({

  name: 'ListItem',

  props: {

    showStatus: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: false,
    },

  },

  setup(props, { emit }) {
    /**
     * Double click and single click event handler
     *
     * @param {Event} event
     */
    function oneClick(event: Event): void {
      emit('click', event)
    }

    return {
      oneClick,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
