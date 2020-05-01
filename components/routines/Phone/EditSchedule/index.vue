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
      ref="submit-button"
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
      ref="submit-button"
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
import EditSchedule from '~/components/routines/Edit/EditSchedule'

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
    this.$store.dispatch('template/resetHeadings', null, {
      root: true,
    })

    this.$store.dispatch('template/resetButtons', null, {
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
      icon: 'clock',
    }, {
      root: true,
    })

    this.$store.dispatch('template/setHeadingInfoText', {
      text: this.$t('routines.texts.scheduledTime'),
    }, {
      root: true,
    })

    this.$store.dispatch('app/bottomMenuCollapse', null, {
      root: true,
    })

    this.$bus.$off('heading_left_button-clicked')
    this.$bus.$off('heading_right_button-clicked')

    this.$bus.$on('heading_left_button-clicked', this.leftButtonAction)
    this.$bus.$on('heading_right_button-clicked', this.rightButtonAction)
  },

  mounted() {
    this._adjustBodyMargins()
  },

  updated() {
    this._adjustBodyMargins()
  },

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked', this.leftButtonAction)
    this.$bus.$off('heading_right_button-clicked', this.rightButtonAction)

    this.$store.dispatch('template/setBodyMargin', {
      key: 'custom',
      position: 'bottom',
      margin: 0,
    }, {
      root: true,
    })
  },

  methods: {

    submit(event) {
      event && event.preventDefault()

      this.submitSelect = true
    },

    add(data, schedule) {
      this.$emit('add', data, schedule)
    },

    /**
     * Header left button action event
     */
    leftButtonAction() {
      this.$emit('back')
    },

    /**
     * Header right button action event
     */
    rightButtonAction() {
      this.$emit('close')
    },

    /**
     * Calculate body margins adjust
     *
     * @private
     */
    _adjustBodyMargins() {
      const submitButton = this._.get(this.$refs, 'submit-button')

      if (submitButton) {
        const elementHeight = this._.get(submitButton, '$el.clientHeight')

        this.$store.dispatch('template/setBodyMargin', {
          key: 'custom',
          position: 'bottom',
          margin: elementHeight,
        }, {
          root: true,
        })
      }
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
