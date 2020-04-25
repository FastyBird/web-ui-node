<template>
  <div class="fb-routines-phone-edit-condition-schedule__container">
    <edit-schedule
      :schedule="schedule"
      :remote-submit.sync="submitSelect"
      @add="add"
      @loaded="$emit('loaded')"
    />

    <fb-button
      v-if="schedule !== null"
      variant="primary"
      size="lg"
      block
      mobile
      @click="submit"
    >
      {{ $t('routines.buttons.updateSchedule.title') }}
      <font-awesome-icon icon="sync-alt" />
    </fb-button>

    <fb-button
      v-else
      variant="primary"
      size="lg"
      block
      mobile
      @click="submit"
    >
      {{ $t('routines.buttons.addSchedule.title') }}
      <font-awesome-icon icon="plus" />
    </fb-button>
  </div>
</template>

<script>
const EditSchedule = () => import('@/components/routines/Edit/EditSchedule')

export default {

  name: 'RoutinesPhoneEditSchedule',

  components: {
    EditSchedule,
  },

  props: {

    schedule: {
      type: Object,
      default: null,
    },

  },

  data() {
    return {
      submitSelect: false,
    }
  },

  created() {
    this.$store.dispatch('template/resetStore', null, {
      root: true,
    })

    this.$store.dispatch('template/setLeftButton', {
      name: this.$t('application.buttons.back.title'),
      icon: 'arrow-left',
    }, {
      root: true,
    })

    this.$store.dispatch('template/setRightButton', {
      name: this.$t('application.buttons.close.title'),
    }, {
      root: true,
    })

    this.$store.dispatch('template/setFullRowHeading', null, {
      root: true,
    })

    if (this.schedule !== null) {
      this.$store.dispatch('template/setHeading', {
        heading: this.$t('routines.headings.editSchedule'),
      }, {
        root: true,
      })
    } else {
      this.$store.dispatch('template/setHeading', {
        heading: this.$t('routines.headings.selectSchedule'),
      }, {
        root: true,
      })
    }

    this.$store.dispatch('template/setHeadingIcon', {
      icon: 'project-diagram',
    }, {
      root: true,
    })

    this.$store.dispatch('app/bottomMenuCollapse', null, {
      root: true,
    })

    this.$bus.$on('heading_left_button-clicked', () => {
      this.$emit('back')
    })

    this.$bus.$on('heading_right_button-clicked', () => {
      this.$emit('close')
    })
  },

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked')
    this.$bus.$off('heading_right_button-clicked')
  },

  methods: {

    submit(event) {
      event && event.preventDefault()

      this.submitSelect = true
    },

    add(schedule) {
      this.$emit('add', schedule)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
