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

import Routine from '~/models/routines/Routine'
import Condition from '~/models/triggers-node/Condition'

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
      return Routine
        .query()
        .with('trigger')
        .with('actions')
        .with('schedule')
        .with('schedule.condition')
        .whereHas('schedule', (query) => {
          query.where((schedule) => {
            const condition = Condition.find(schedule.id)

            if (condition === null) {
              return false
            }

            const now = new Date()
            const time = new Date(condition.time)

            return condition.days.includes(parseInt(this.$dateFns.format(now, 'i'), 10)) &&
              this.$dateFns.compareDesc(now, new Date(`${this.$dateFns.format(now, 'Y-M-d')} ${this.$dateFns.format(time, 'H:m:s XXXX')}`)) === 1
          })
        })
        .whereHas('trigger', (query) => {
          query.where('isAutomatic', true)
        })
        .get()
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
