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
      ref="submit-button"
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
        {{ $t('routines.headings.removeCondition') }}
      </template>

      <template slot="question">
        <i18n
          path="routines.messages.confirmRemoveCondition"
          tag="p"
        >
          <strong slot="thing">{{ $tThingChannel(thing) }}</strong>
        </i18n>
      </template>
    </fb-confirmation-window>
  </div>
</template>

<script>
import EditCondition from '~/components/routines/Edit/EditCondition'

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
      icon: this.$thingIcon(this.thing),
    }, {
      root: true,
    })

    this.$store.dispatch('template/setHeadingInfoText', {
      text: this.$t('routines.texts.conditionThingProperties'),
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

    add(condition) {
      this.$emit('add', condition)
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
      if (this.condition !== null) {
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
