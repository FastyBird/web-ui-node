<template>
  <div
    class="fb-mobile-bottom-menu__container"
    @keyup.esc="close"
  >
    <transition name="show-backdrop">
      <div
        v-if="show"
        class="fb-mobile-bottom-menu__backdrop"
        @click="close"
      />
    </transition>

    <transition name="show-items">
      <div
        v-if="show"
        class="fb-mobile-bottom-menu__items"
      >
        <h4
          v-if="showHeader && heading !== null"
          class="fb-mobile-bottom-menu__heading"
        >
          {{ heading }}
        </h4>

        <div class="fb-mobile-bottom-menu__buttons">
          <slot name="items" />
        </div>

        <div
          v-if="showClose"
          class="fb-mobile-bottom-menu__cancel"
          @click="close"
        >
          Close
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {

    name: 'MobileBottomMenu',

    props: {

      show: {
        type: Boolean,
        default: false,
      },

      showHeader: {
        type: Boolean,
        default: false,
      },

      showClose: {
        type: Boolean,
        default: false,
      },

      heading: {
        type: String,
        default: null,
      },

    },

    watch: {

      show(val) {
        if (val) {
          this.$el.tabIndex = 1
          this.$el.focus()
        }
      },

    },

    methods: {

      close() {
        this.$emit('close')
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
