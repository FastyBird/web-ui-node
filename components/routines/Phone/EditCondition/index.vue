<template>
  <div class="fb-routines-phone-edit-condition-thing__container">
    <edit-condition
      :thing="thing"
      :condition="condition"
      :type-thing="typeThing"
      :type-sensor="typeSensor"
      :remote-submit.sync="submitSelect"
      @add="add"
      @loaded="$emit('loaded')"
    />

    <fb-button
      v-if="condition !== null"
      variant="primary"
      size="lg"
      block
      mobile
      @click="submit"
    >
      {{ $t('routines.buttons.updateThing.title') }}
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
      {{ $t('routines.buttons.addThing.title') }}
      <font-awesome-icon icon="plus" />
    </fb-button>
  </div>
</template>

<script>
const EditCondition = () => import('@/components/routines/Edit/EditCondition')

export default {

  name: 'RoutinesPhoneEditCondition',

  components: {
    EditCondition,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

    condition: {
      type: Object,
      default: null,
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

    if (this.condition !== null) {
      this.$store.dispatch('template/setRightButton', {
        name: this.$t('application.buttons.remove.title'),
      }, {
        root: true,
      })
    } else {
      this.$store.dispatch('template/setRightButton', {
        name: this.$t('application.buttons.close.title'),
      }, {
        root: true,
      })
    }

    this.$store.dispatch('template/setFullRowHeading', null, {
      root: true,
    })

    this.$store.dispatch('template/setHeading', {
      heading: this.$tThingChannel(this.thing),
      subHeading: this.$tThingDevice(this.thing),
    }, {
      root: true,
    })

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
      if (this.action !== null) {
        this.$emit('remove', this.thing)
      } else {
        this.$emit('close')
      }
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

    add(condition) {
      this.$emit('add', condition)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
