<template>
  <div class="fb-routines-today-carousel__container">
    <div>
      <div class="fb-routines-today-carousel__day">
        <span>Today</span>
        <span>{{ $dateFns.format(new Date(), 'dd') }}</span>
        <span>{{ $dateFns.format(new Date(), 'MMM') }}</span>
      </div>

      <div class="fb-routines-today-carousel__carousel">
        <hooper :settings="carousel">
          <slide>
            <carousel-slide />
          </slide>
          <slide>
            <carousel-slide />
          </slide>
          <slide>
            <carousel-slide />
          </slide>
          <slide>
            <carousel-slide />
          </slide>
          <slide>
            <carousel-slide />
          </slide>
        </hooper>
      </div>
    </div>
  </div>
</template>

<script>
import { Hooper, Slide } from 'hooper'
import 'hooper/dist/hooper.css'

import CarouselSlide from './Slide'

export default {

  name: 'RoutinesListCarousel',

  components: {
    Hooper,
    Slide,
    CarouselSlide,
  },

  data() {
    return {
      carousel: {
        itemsToShow: 1.5,
        centerMode: false,
        pagination: 'no',
        breakpoints: {
          768: {
            itemsToShow: 2,
            centerMode: false,
          },
          1200: {
            itemsToShow: 3,
            centerMode: false,
          },
        },
      },
    }
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
