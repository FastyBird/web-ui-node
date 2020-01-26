<template>
  <div
    class="fb-routines-today-carousel-slide__container"
    @click="oneClick($event)"
  >
    <div class="fb-routines-today-carousel-slide__box">
      <div class="fb-routines-today-carousel-slide__icon">
        <font-awesome-icon :icon="'project-diagram'" />
      </div>

      <div class="fb-routines-today-carousel-slide__heading">
        <h2>
          Rise n' Shine
        </h2>
        <small>
          Scheduled: 7.30 am
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  name: 'RoutinesListCarouselSlide',

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

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
