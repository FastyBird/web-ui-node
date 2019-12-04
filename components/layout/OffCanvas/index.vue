<template>
  <div
    :class="['fb-off-canvas__container', {'show': show}]"
    @keyup.esc="close"
  >
    <div
      :class="['fb-off-canvas__overlay', {'hide': !show}]"
      @click.prevent="close"
    />

    <div class="fb-off-canvas__body">
      <slot name="body" />
    </div>
  </div>
</template>

<script>
  export default {

    name: 'OffCanvas',

    props: {

      show: {
        type: Boolean,
        default: false,
      },

    },

    watch: {

      show(val) {
        if (val) {
          this.$el.tabIndex = 1

          this.$nextTick(function() {
            this.$el.focus()
          })
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
