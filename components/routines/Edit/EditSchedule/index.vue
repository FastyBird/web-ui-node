<template>
  <div class="fb-routines-edit-schedule__container">
    <form @submit.prevent="_collectData">
      <h3>{{ $t('routines.fields.time.title') }}</h3>

      <scroll-picker-group class="flex">
        <scroll-picker
          v-model="model.hour"
          :options="hours"
        />
        <scroll-picker
          v-model="model.minute"
          :options="minutes"
        />
        <scroll-picker
          v-if="!show24hours"
          v-model="model.ampm"
          :options="ampm"
        />
      </scroll-picker-group>

      <h3>{{ $t('routines.fields.repeat.title') }}</h3>

      <fb-form-checkboxes-group
        v-model="model.days"
        name="days"
        class="fb-routines-edit-schedule__days"
      >
        <div
          v-for="(day, key) of days"
          :key="key"
          class="fb-routines-edit-schedule__day"
        >
          {{ $t(`application.days.${day}.short`) }}
          <fb-form-checkbox
            :id="`day_${key}`"
            name="days"
            :value="key + 1"
          />
        </div>
      </fb-form-checkboxes-group>
    </form>
  </div>
</template>

<script>
import { ScrollPicker, ScrollPickerGroup } from 'vue-scroll-picker'
import 'vue-scroll-picker/dist/style.css'

export default {

  name: 'RoutinesEditEditSchedule',

  components: {
    ScrollPickerGroup,
    ScrollPicker,
  },

  props: {

    schedule: {
      type: Object,
      default: null,
    },

    remoteSubmit: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      model: {
        hour: null,
        minute: null,
        ampm: null,
        days: [],
      },
      hours: [],
      minutes: [],
      ampm: [
        { value: 'a', name: 'a.m.' },
        { value: 'p', name: 'p.m.' },
      ],
      days: [
        'mon',
        'tue',
        'wed',
        'thu',
        'fri',
        'sat',
        'sun',
      ],
    }
  },

  computed: {

    show24hours() {
      return this._.get(this.account, 'timeFormat', 'HH:mm') === 'HH:mm'
    },

  },

  watch: {

    remoteSubmit(val) {
      if (val) {
        this._collectData()
      }
    },

  },

  created() {
    this._initModel()

    if (this.show24hours) {
      for (let i = 0; i <= 23; i++) {
        this.hours.push({ value: i, name: (`00${i}`).substr(-2) })
      }
    } else {
      for (let i = 1; i <= 12; i++) {
        this.hours.push({ value: i, name: (`00${i}`).substr(-2) })
      }
    }

    for (let i = 0; i <= 59; i++) {
      this.minutes.push({ value: i, name: (`00${i}`).substr(-2) })
    }
  },

  mounted() {
    this.$emit('loaded')
  },

  methods: {

    /**
     * Submit values
     */
    _collectData() {
      this.$emit('update:remoteSubmit', false)

      const today = new Date()

      let date

      if (this.show24hours) {
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), this.model.hour, this.model.minute, 0)
      } else {
        date = new Date(`${(`00${today.getMonth() + 1}`).substr(-2)}/${today.getDate()}/${today.getFullYear()} ${(`00${this.model.hour}`).substr(-2)}:${(`00${this.model.minute}`).substr(-2)}:00 ${this.model.ampm === 'a' ? 'am' : 'pm'}`)
      }

      const schedule = {
        time: date,
        days: this.model.days,
      }

      this.$emit('add', schedule, this.schedule)
    },

    /**
     * Initialize model object
     *
     * @private
     */
    _initModel() {
      if (this.schedule) {
        if (this.show24hours) {
          this.model.hour = parseInt(this.$dateFns.format(this.schedule.time, 'H'), 10)
        } else {
          this.model.hour = parseInt(this.$dateFns.format(this.schedule.time, 'h'), 10)
        }

        this.model.minute = parseInt(this.$dateFns.format(this.schedule.time, 'm'), 10)
        this.model.ampm = this.$dateFns.format(this.schedule.time, 'aaaaa')
        this.model.days = this.schedule.days
      } else {
        const today = new Date()

        if (this.show24hours) {
          this.model.hour = parseInt(this.$dateFns.format(today, 'H'), 10)
        } else {
          this.model.hour = parseInt(this.$dateFns.format(today, 'h'), 10)
        }

        this.model.minute = parseInt(this.$dateFns.format(today, 'm'), 10)
        this.model.ampm = this.$dateFns.format(today, 'aaaaa')
        this.model.days = [1, 2, 3, 4, 5, 6, 7]
      }
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
