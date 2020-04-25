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
          <slide
            v-for="routine in routines"
            :key="routine.id"
          >
            <carousel-slide
              :routine="routine"
            />
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

import Trigger from '~/models/triggers-node/Trigger'

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

  computed: {

    routines() {
      let routines = Trigger
        .query()
        .with('conditions')
        .where('isAutomatic', true)
        .orderBy('name')
        .get()

      routines = this._.filter(routines, (routine) => {
        const condition = routine.conditions.find(item => item.isTime)

        if (typeof condition === 'undefined') {
          return false
        }

        const now = new Date()
        const time = new Date(condition.time)

        return condition.days.includes(parseInt(this.$dateFns.format(now, 'i'), 10)) &&
          this.$dateFns.compareDesc(now, new Date(`${this.$dateFns.format(now, 'Y-M-d')} ${this.$dateFns.format(time, 'H:m:s XXXX')}`)) === 1
      })

      return routines
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
