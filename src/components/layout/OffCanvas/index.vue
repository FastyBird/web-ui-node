<template web>
  <div
    :class="['fb-off-canvas__container', {'show': show}]"
    @keyup.esc="close"
  >
    <div
      :class="['fb-off-canvas__overlay', {'hide': !show}]"
      @click.prevent="close"
    />

    <div class="fb-off-canvas__body">
      <off-canvas-heading
        :heading="heading"
        :sub-heading="subHeading"
      >
        <template slot="left-button">
          <slot name="left-button" />
        </template>

        <template slot="right-button">
          <slot name="right-button" />
        </template>
      </off-canvas-heading>

      <slot name="body" />
    </div>
  </div>
</template>

<script>
  import OffCanvasHeading from './Heading'

  export default {

    name: 'OffCanvas',

    components: {
      OffCanvasHeading,
    },

    props: {

      show: {
        type: Boolean,
        default: false,
      },

      heading: {
        type: String,
        required: true,
      },

      subHeading: {
        type: String,
        required: false,
        default: null,
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
  @import './index.scss';
</style>
