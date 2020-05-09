<template>
  <property-container
    :thing="thing"
    :property="property"
    :data-state="thing.state ? 'on' : 'off'"
  >
    <div
      slot="property"
      class="fb-things-detail-analog-sensor__value-container"
    >
      <template v-if="thing.state">
        <span class="fb-things-detail-analog-sensor__value">{{ value }}</span>
        <span class="fb-things-detail-analog-sensor__unit">{{ property.unit }}</span>
      </template>
      <template v-else>
        <span class="fb-things-detail-analog-sensor__value">{{ $t('application.states.notAvailable') }}</span>
      </template>

      <fb-button
        v-if="thing.state && property.isSettable"
        variant="outline-primary"
        size="xs"
        @click.prevent="$emit('clear')"
      >
        <font-awesome-icon icon="sync-alt" />
      </fb-button>
    </div>

    <fb-confirmation-window
      v-if="clearValue.show"
      :transparent-bg="transparentModal"
      icon="trash"
      @confirmed="processClearValue"
      @close="closeClearValue"
    >
      <template slot="header">
        {{ $t('things.headings.clearCounter') }}
      </template>

      <template slot="question">
        <i18n
          path="things.messages.confirmClearCounter"
          tag="p"
        >
          <strong slot="thing">{{ $tThingChannel(thing) }}</strong>
        </i18n>
      </template>
    </fb-confirmation-window>
  </property-container>
</template>

<script>
import PropertyContainer from '../../PropertyContainer'

import Hardware from '~/models/devices-node/Hardware'

export default {

  name: 'ThingsDetailPropertyAnalogSensor',

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
      hardware: null,
      clearValue: {
        show: false,
      },
    }
  },

  computed: {

    value() {
      if (this.hardware !== null && this.hardware.isManufacturerItead) {
        switch (this.property.property) {
          case 'air_quality':
            if (this.property.value > 7) {
              return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this.property.property}.values.unhealthy`)
            } else if (this.property.value > 4) {
              return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this.property.property}.values.moderate`)
            }

            return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this.property.property}.values.good`)

          case 'light_level':
            if (this.property.value > 8) {
              return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this.property.property}.values.dusky`)
            } else if (this.property.value > 4) {
              return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this.property.property}.values.normal`)
            }

            return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this.property.property}.values.bright`)

          case 'noise_level':
            if (this.property.value > 6) {
              return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this.property.property}.values.noisy`)
            } else if (this.property.value > 3) {
              return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this.property.property}.values.normal`)
            }

            return this.$t(`things.vendors.${this.hardware.manufacturer}.properties.${this.property.property}.values.quiet`)
        }
      }

      return this.property.formattedValue
    },

  },

  created() {
    this.transparentModal = this.$parent.$options.name !== 'Layout'

    this.hardware = Hardware
      .query()
      .where('device_id', this.thing.device_id)
      .first()
  },

  methods: {

    /**
     * Show clear value confirmation window
     */
    showClearValue() {
      if (!this._clearingCheck()) {
        return
      }

      this.clearValue.show = true
    },

    /**
     * Close clear value confirmation window
     */
    closeClearValue() {
      this.clearValue.show = false
    },

    /**
     * Process resetting of total consumption counter
     */
    processClearValue() {
      this.clearValue.show = false

      if (!this._clearingCheck()) {
        return
      }

      this.$controlChannel(this.property, '0')
        .catch(() => {
          this.$flashMessage(this.$t('things.messages.commandNotAccepted', {
            thing: this.$tThingChannel(this.thing),
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
      if (this.property.isSettable === false) {
        this.$flashMessage(this.$t('things.messages.notSupported', {
          thing: this.$tThingChannel(this.thing),
        }), 'error')

        return false
      }

      // Check if thing is connected to cloud
      if (this.thing.state !== true) {
        this.$flashMessage(this.$t('things.messages.notOnline', {
          thing: this.$tThingChannel(this.thing),
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
