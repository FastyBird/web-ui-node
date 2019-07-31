<template>
  <div :class="['fb-list-item__container', { 'with-buttons': slotExists('buttons') }]">
    <div
      class="row cursor-pointer"
      @click="oneClick($event)"
    >
      <div class="col-2 col-sm-1 col-lg-1 p-x-0 text-center fb-list-item__icon">
        <slot name="icon" />
      </div>

      <div class="col p-x-0">
        <div :class="['fb-list-item__heading', { 'with-subheading': slotExists('sub-heading') }]">
          <h2>
            <slot name="heading" />
          </h2>
          <small v-if="slotExists('sub-heading')">
            <slot name="sub-heading" />
          </small>
        </div>

        <div
          v-if="slotExists('buttons')"
          class="fb-list-item__buttons hidden-xs"
        >
          <slot name="buttons" />
        </div>
      </div>

      <div class="col-1 p-x-0 fb-list-item__detail-icon text-right">
        <font-awesome-icon
          icon="chevron-right"
          role="button"
        />
      </div>
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
       * @param {Object} item
       */
      oneClick(event, item) {
        this.$emit('click', event, item)
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
