<template>
  <div class="fb-routines-pages-edit-action-thing__container">
    <edit-action
      :thing="thing"
      :action="action"
      :remote-submit.sync="submitSelect"
      @add="add"
      @loaded="$emit('loaded')"
    />

    <fb-button
      v-if="action !== null"
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
const EditAction = () => import('@/components/routines/Edit/EditAction')

export default {

  name: 'PagesRoutinesEditAction',

  components: {
    EditAction,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

    action: {
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

    if (this.action !== null) {
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

    add(action) {
      this.$emit('add', action)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
