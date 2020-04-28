<template>
  <select-thing
    :items="items"
    :type-actor="onlySettable || typeThing"
    :type-sensor="typeSensor"
    @select="selected"
    @loaded="$emit('loaded')"
  />
</template>

<script>
import SelectThing from '~/components/routines/Edit/SelectThing'

export default {

  name: 'RoutinesPhoneSelectThing',

  components: {
    SelectThing,
  },

  props: {

    items: {
      type: Array,
      required: true,
    },

    onlySettable: {
      type: Boolean,
      default: false,
    },

    typeThing: {
      type: Boolean,
      default: false,
    },

    typeSensor: {
      type: Boolean,
      default: false,
    },

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

    if (this.onlySettable) {
      this.$store.dispatch('template/setHeading', {
        heading: this.$t('routines.headings.selectThing'),
        subHeading: this.$t('routines.headings.typeActor'),
      }, {
        root: true,
      })
    } else {
      this.$store.dispatch('template/setHeading', {
        heading: this.$t('routines.headings.selectThing'),
        subHeading: this.typeSensor ? this.$t('routines.headings.typeSensor') : this.$t('routines.headings.typeThing'),
      }, {
        root: true,
      })
    }

    this.$store.dispatch('template/setHeadingIcon', {
      icon: 'plug',
    }, {
      root: true,
    })

    if (this.onlySettable) {
      this.$store.dispatch('template/setHeadingInfoText', {
        text: this.$t('routines.texts.selectActorThing'),
      }, {
        root: true,
      })
    } else {
      this.$store.dispatch('template/setHeadingInfoText', {
        text: this.typeSensor ? this.$t('routines.texts.selectSensorThing') : this.$t('routines.texts.selectThing'),
      }, {
        root: true,
      })
    }

    this.$store.dispatch('app/bottomMenuCollapse', null, {
      root: true,
    })

    this.$bus.$off('heading_left_button-clicked')
    this.$bus.$off('heading_right_button-clicked')

    this.$bus.$on('heading_left_button-clicked', this.leftButtonAction)
    this.$bus.$on('heading_right_button-clicked', this.rightButtonAction)
  },

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked', this.leftButtonAction)
    this.$bus.$off('heading_right_button-clicked', this.rightButtonAction)
  },

  methods: {

    selected(thing) {
      this.$emit('select', thing)
    },

    /**
     * Header left button action event
     */
    leftButtonAction() {
      this.$emit('close')
    },

    /**
     * Header right button action event
     */
    rightButtonAction() {
      this.$emit('close')
    },

  },

}
</script>
