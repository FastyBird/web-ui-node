<template>
  <list-item
    :show-status="true"
    :status="routine.enabled"
    class="fb-routines-list-item__container"
    @click="oneClick"
  >
    <template slot="icon">
      <font-awesome-icon :icon="$routineIcon(routine)" />
    </template>

    <template slot="heading">
      {{ routine.name }}
    </template>

    <template slot="sub-heading">
      {{ subHeading }}
    </template>

    <template slot="detail">
      <div class="fb-routines-list-item__info">
        <small>{{ $tc('routines.texts.routineThings', thingsCount, { count: thingsCount }) }}</small>

        <font-awesome-icon
          icon="chevron-right"
          role="button"
        />
      </div>
    </template>
  </list-item>
</template>

<script>
export default {

  name: 'RoutinesListItem',

  props: {

    routine: {
      type: Object,
      required: true,
    },

  },

  computed: {

    account() {
      return this.$store.getters['entities/account/query']()
        .first()
    },

    /**
     * Count total things count (actions)
     *
     * @returns {Number}
     */
    thingsCount() {
      return this._.uniq(this._.get(this.routine, 'actions', [])
        .map((item) => {
          return item.channel_id
        }))
        .length
    },

    /**
     * @returns {String}
     */
    subHeading() {
      if (this.schedule !== null) {
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

              case 0:
                days.push(this.$t('application.days.sun.short'))
                break
            }
          }

          days = days.join(', ')
        }

        return this.$t('routines.headings.scheduledRoutine', { days, time: this.$dateFns.format(this.schedule.time, this.account.timeFormat) })
      }

      if (this.routine.hasComment) {
        return this.routine.comment
      }

      return this.routine.isAutomatic ? this.$t('routines.headings.automaticRoutine') : this.$t('routines.headings.manualRoutine')
    },

    /**
     * View routine data
     *
     * @returns {(Condition|null)}
     */
    schedule() {
      const condition = this._.get(this.routine, 'conditions', []).find(item => item.isTime)

      if (typeof condition === 'undefined') {
        return null
      }

      return condition
    },

  },

  methods: {

    /**
     * Double click and single click event handler
     *
     * @param {Object} event
     */
    oneClick(event) {
      this.$emit('click', event, this.routine)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
