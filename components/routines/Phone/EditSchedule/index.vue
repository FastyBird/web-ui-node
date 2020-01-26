<template>
  <div class="fb-routines-pages-edit-condition-schedule__container">
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

  name: 'PagesRoutinesEditSchedule',

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
    this.$store.dispatch('header/resetStore', null, {
      root: true,
    })

    this.$store.dispatch('header/setLeftButton', {
      name: this.$t('application.buttons.back.title'),
      callback: () => {
        this.$emit('back')
      },
      icon: 'arrow-left',
    }, {
      root: true,
    })

    this.$store.dispatch('header/setRightButton', {
      name: this.$t('application.buttons.close.title'),
      callback: () => {
        this.$emit('close')
      },
    }, {
      root: true,
    })

    this.$store.dispatch('header/setFullRowHeading', null, {
      root: true,
    })

    if (this.schedule !== null) {
      this.$store.dispatch('header/setHeading', {
        heading: this.$t('routines.headings.editSchedule'),
      }, {
        root: true,
      })
    } else {
      this.$store.dispatch('header/setHeading', {
        heading: this.$t('routines.headings.selectSchedule'),
      }, {
        root: true,
      })
    }

    this.$store.dispatch('header/setHeadingIcon', {
      icon: 'project-diagram',
    }, {
      root: true,
    })

    this.$store.dispatch('bottomNavigation/resetStore', null, {
      root: true,
    })

    this.$store.dispatch('bottomNavigation/hideNavigation', null, {
      root: true,
    })
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
