<template>
  <select-thing
    :items="items"
    :only-settable="onlySettable"
    :type-thing="typeThing"
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
    this.$store.dispatch('header/resetStore', null, {
      root: true,
    })

    this.$store.dispatch('header/setLeftButton', {
      name: this.$t('application.buttons.back.title'),
      callback: () => {
        this.$emit('close')
      },
      icon: 'arrow-left',
    }, {
      root: true,
    })

    this.$store.dispatch('header/hideRightButton', null, {
      root: true,
    })

    this.$store.dispatch('header/setFullRowHeading', null, {
      root: true,
    })

    this.$store.dispatch('header/setHeading', {
      heading: this.$t('routines.headings.selectThing'),
    }, {
      root: true,
    })

    this.$store.dispatch('header/setHeadingIcon', {
      icon: 'plug',
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

    selected(thing) {
      this.$emit('select', thing)
    },

  },

}
</script>
