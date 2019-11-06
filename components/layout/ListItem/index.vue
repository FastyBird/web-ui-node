<template>
  <div
    class="fb-list-item__container"
    @click="oneClick($event)"
  >
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
</template>

<script>
  export default {

    name: 'ListItem',

    methods: {

      /**
       * Double click and single click event handler
       *
       * @param {Object} event
       */
      oneClick(event) {
        this.$emit('click', event)
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>
