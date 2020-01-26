<template>
  <list-item
    :show-status="true"
    :status="schedule.enabled"
  >
    <template slot="icon">
      <font-awesome-icon icon="clock" />
    </template>

    <template slot="heading">
      Scheduled: {{ $dateFns.format(schedule.time, 'HH:mm') }}
    </template>

    <template slot="sub-heading">
      <template v-if="schedule.days.length !== 7">
        <span
          v-for="(row, index) in schedule.days"
          :key="index"
        >{{ translateDay(row) }}</span>
      </template>
      <span v-else>all week</span>
    </template>

    <template slot="detail-large">
      <fb-button
        size="sm"
        variant="link"
        @click="edit"
      >
        {{ $t('application.buttons.edit.title') }}
      </fb-button>
    </template>
  </list-item>
</template>

<script>
export default {

  name: 'RoutinesEditListSchedule',

  props: {

    schedule: {
      type: Object,
      required: true,
      validator: (value) => {
        return !(
          !Object.prototype.hasOwnProperty.call(value, 'enabled') ||
          !Object.prototype.hasOwnProperty.call(value, 'time') ||
          !Object.prototype.hasOwnProperty.call(value, 'days')
        )
      },
    },

  },

  methods: {

    edit() {
      this.$emit('edit')
    },

    translateDay(day) {
      switch (day) {
        case 1:
          return this.$t('application.days.mon.short')
        case 2:
          return this.$t('application.days.tue.short')
        case 3:
          return this.$t('application.days.wed.short')
        case 4:
          return this.$t('application.days.thu.short')
        case 5:
          return this.$t('application.days.fri.short')
        case 6:
          return this.$t('application.days.sat.short')
        case 0:
          return this.$t('application.days.sun.short')
        default:
          return ''
      }
    },

  },

}
</script>
