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
const SelectThing = () => import('@/components/routines/Edit/SelectThing')

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
    this.$store.dispatch('template/resetStore', null, {
      root: true,
    })

    this.$store.dispatch('template/setLeftButton', {
      name: this.$t('application.buttons.back.title'),
      icon: 'arrow-left',
    }, {
      root: true,
    })

    this.$store.dispatch('template/setFullRowHeading', null, {
      root: true,
    })

    this.$store.dispatch('template/setHeading', {
      heading: this.$t('routines.headings.selectThing'),
    }, {
      root: true,
    })

    this.$store.dispatch('template/setHeadingIcon', {
      icon: 'plug',
    }, {
      root: true,
    })

    this.$store.dispatch('app/bottomMenuCollapse', null, {
      root: true,
    })

    this.$bus.$on('heading_left_button-clicked', () => {
      this.$emit('close')
    })
  },

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked')
  },

  methods: {

    selected(thing) {
      this.$emit('select', thing)
    },

  },

}
</script>
