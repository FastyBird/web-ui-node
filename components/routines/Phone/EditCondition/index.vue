<template>
  <div class="fb-routines-pages-edit-condition-thing__container">
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

  name: 'PagesRoutinesEditCondition',

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

    if (this.condition !== null) {
      this.$store.dispatch('header/setRightButton', {
        name: this.$t('application.buttons.remove.title'),
        callback: () => {
          this.$emit('remove', this.thing)
        },
      }, {
        root: true,
      })
    } else {
      this.$store.dispatch('header/setRightButton', {
        name: this.$t('application.buttons.close.title'),
        callback: () => {
          this.$emit('close')
        },
      }, {
        root: true,
      })
    }

    this.$store.dispatch('header/setFullRowHeading', null, {
      root: true,
    })

    this.$store.dispatch('header/setHeading', {
      heading: this.$tThing(this.thing),
      subHeading: this.$tThingDevice(this.thing),
    }, {
      root: true,
    })

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

    add(condition) {
      this.$emit('add', condition)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
