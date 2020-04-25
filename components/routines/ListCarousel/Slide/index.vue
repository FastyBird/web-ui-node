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
          {{ routine.name }}
        </h2>
        <small>
          {{ subHeading }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  name: 'RoutinesListCarouselSlide',

  props: {

    routine: {
      type: Object,
      required: true,
    },

  },

  computed: {

    /**
     * User account details
     *
     * @returns {(Account|null)}
     */
    account() {
      return this.$store.getters['entities/account/query']()
        .first()
    },

    /**
     * Get list sub-heading
     *
     * @returns {String}
     */
    subHeading() {
      let days = ''

      if (this.schedule.days.length === 7) {
        days = this.$t('routines.texts.everyday')
      } else {
        days = []

        for (const day of this.schedule.days) {
          switch (day) {
            case 1:
              days.push(this.$t('application.days.mon.short'))
              break

            case 2:
              days.push(this.$t('application.days.tue.short'))
              break

            case 3:
              days.push(this.$t('application.days.wed.short'))
              break

            case 4:
              days.push(this.$t('application.days.thu.short'))
              break

            case 5:
              days.push(this.$t('application.days.fri.short'))
              break

            case 6:
              days.push(this.$t('application.days.sat.short'))
              break

            case 7:
              days.push(this.$t('application.days.sun.short'))
              break
          }
        }

        days = days.join(', ')
      }

      return this.$t('routines.headings.scheduledRoutine', {
        days,
        time: this.$dateFns.format(this.schedule.time, this._.get(this.account, 'timeFormat', 'HH:mm')),
      })
    },

    /**
     * Routine schedule condition
     *
     * @returns {(Condition|null)}
     */
    schedule() {
      return this.routine.conditions.find(item => item.isTime)
    },

  },

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
