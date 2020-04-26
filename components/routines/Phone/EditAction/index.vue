<template>
  <div class="fb-routines-phone-edit-action-thing__container">
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
      ref="submit-button"
      variant="primary"
      size="lg"
      block
      mobile
      @click="submit"
    >
      {{ $t('routines.buttons.addThing.title') }}
      <font-awesome-icon icon="plus" />
    </fb-button>

    <fb-confirmation-window
      v-if="action !== null && confirmRemove"
      :transparent-bg="transparentModal"
      icon="trash"
      @confirmed="$emit('remove', thing)"
      @close="confirmRemove = false"
    >
      <template slot="header">
        {{ $t('routines.headings.removeAction') }}
      </template>

      <template slot="question">
        <i18n
          path="routines.messages.confirmRemoveAction"
          tag="p"
        >
          <strong slot="thing">{{ $tThingChannel(thing) }}</strong>
        </i18n>
      </template>
    </fb-confirmation-window>
  </div>
</template>

<script>
import EditAction from '@/components/routines/Edit/EditAction'

export default {

  name: 'RoutinesPhoneEditAction',

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
      confirmRemove: false,
      transparentModal: false,
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

    if (this.action !== null) {
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
      icon: this.$thingIcon(this.thing),
    }, {
      root: true,
    })

    this.$store.dispatch('template/setHeadingInfoText', {
      text: this.$t('routines.texts.actionThingProperties'),
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

    this.transparentModal = this.$parent.$options.name !== 'Layout'
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

    add(action) {
      this.$emit('add', action)
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
      if (this.action !== null) {
        this.confirmRemove = true
      } else {
        this.$emit('close')
      }
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
