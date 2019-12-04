<template>
  <property-container
    :thing="thing"
    :property="property"
    :data-state="thing.state ? 'on' : 'off'"
  >
    <div
      slot="property"
      class="fb-iot-things-detail-energy-property__value-container"
    >
      <template v-if="thing.state">
        <span class="fb-iot-things-detail-energy-property__value">{{ propertyValue }}</span>
        <span class="fb-iot-things-detail-energy-property__units">{{ _.get(property, 'units', null) }}</span>
      </template>
      <template v-else>
        <span class="fb-iot-things-detail-energy-property__value">{{ $t('application.states.notAvailable') }}</span>
      </template>

      <fb-button
        v-if="thing.state && _.get(property, 'is_settable', false)"
        variant="outline-primary"
        size="xs"
        @click.prevent="$emit('clear')"
      >
        <font-awesome-icon icon="sync-alt" />
      </fb-button>
    </div>

    <fb-confirmation-window
      v-if="clearTotal.show"
      :transparent-bg="transparentModal"
      icon="trash"
      @confirmed="processClearTotal"
      @close="closeClearTotal"
    >
      <template slot="header">
        {{ $t('things.headings.clearCounter') }}
      </template>

      <template slot="question">
        <i18n
          path="things.messages.confirmClearCounter"
          tag="p"
        >
          <strong slot="thing">{{ $tThing(thing) }}</strong>
        </i18n>
      </template>
    </fb-confirmation-window>
  </property-container>
</template>

<script>
  import PropertyContainer from '../../PropertyContainer'

  export default {

    name: 'ThingsDetailPropertyEnergyMeter',

    components: {
      PropertyContainer,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      property: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        transparentModal: false,
        clearTotal: {
          show: false,
        },
      }
    },

    computed: {

      /**
       * Get property value
       *
       * @returns {Number}
       */
      propertyValue() {
        const propertyValue = this.$store.getters['entities/channel_property_value/query']()
          .where('channel_id', this.thing.channel_id)
          .where('property_id', this.property.id)
          .first()

        if (
          propertyValue &&
          (
            this.property.isInteger || this.property.isFloat || this.property.isNumber
          )
        ) {
          return parseFloat(propertyValue.value)
        }

        return 0.0
      },

    },

    created() {
      this.transparentModal = this.$parent.$options.name !== 'Layout'
    },

    methods: {

      /**
       * Show reset total consumption confirmation window
       */
      showClearTotal() {
        if (!this._clearingCheck()) {
          return
        }

        this.clearTotal.show = true
      },

      closeClearTotal() {
        this.clearTotal.show = false
      },

      /**
       * Process resetting of total consumption counter
       */
      processClearTotal() {
        this.clearTotal.show = false

        if (!this._clearingCheck()) {
          return
        }

        this.$store.dispatch('entities/channel_property_value/setPayload', {
          value: 0.0,
          device_id: this.thing.device_id,
          channel_id: this.thing.channel_id,
          property_id: this.property.id,
        }, {
          root: true,
        })
          .catch(() => {
            this.$flashMessage(this.$t('things.messages.commandNotAccepted', {
              thing: this.$tThing(this.thing),
            }), 'error')
          })
      },

      /**
       * Check if property set action is enabled
       *
       * @return {Boolean}
       *
       * @private
       */
      _clearingCheck() {
        if (this._.get(this.property, 'is_settable', false) === false) {
          this.$flashMessage(this.$t('things.messages.notSupported', {
            thing: this.$tThing(this.thing),
          }), 'error')

          return false
        }

        // Check if thing is connected to cloud
        if (this.thing.state !== true) {
          this.$flashMessage(this.$t('things.messages.notOnline', {
            thing: this.$tThing(this.thing),
          }), 'error')

          return false
        }

        return true
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
