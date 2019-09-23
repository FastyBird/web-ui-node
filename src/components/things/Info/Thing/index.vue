<template>
  <fb-modal-info
    :transparent-bg="transparentBg"
    icon="plug"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.thingInfo') }}
    </template>

    <template slot="info">
      <div class="list-group">
        <span class="list-group-item">
          <span class="pull-right">{{ hardwareModel }}</span>
          {{ $t('texts.model') }}
        </span>
        <span class="list-group-item">
          <span class="pull-right">{{ hardwareManufacturer }}</span>
          {{ $t('texts.manufacturer') }}
        </span>
      </div>

      <div class="list-group">
        <span class="list-group-item">
          <span class="pull-right">{{ firmwareManufacturer }}</span>
          {{ $t('texts.firmware') }}
        </span>
        <span class="list-group-item">
          <span class="pull-right">{{ firmwareVersion }}</span>
          {{ $t('texts.version') }}
        </span>
      </div>
    </template>
  </fb-modal-info>
</template>

<script>
  import Hardware from '@/plugins/io-server/store/modules/io-server/Hardware'
  import Firmware from '@/plugins/io-server/store/modules/io-server/Firmware'

  import {
    HARDWARE_MODEL_CUSTOM,
  } from '@/constants'

  export default {

    name: 'ThingsInfoThing',

    props: {

      thing: {
        type: Object,
        required: true,
      },

      transparentBg: {
        type: Boolean,
        default: false,
      },

    },

    computed: {

      /**
       * Find thing hardware info
       *
       * @returns {(Hardware|null)}
       */
      hardware() {
        return Hardware
          .query()
          .where('thing_id', this.thing.id)
          .first()
      },

      /**
       * Get thing model name
       *
       * @returns {String}
       */
      hardwareModel() {
        if (this.hardware !== null && this._.get(this.hardware, 'model', HARDWARE_MODEL_CUSTOM) !== HARDWARE_MODEL_CUSTOM) {
          return this.hardware.model
        }

        return 'N/A'
      },

      /**
       * Get thing manufacturer name
       *
       * @returns {String}
       */
      hardwareManufacturer() {
        if (this.hardware !== null && this._.get(this.hardware, 'manufacturer', null) !== null) {
          return this.hardware.manufacturer
        }

        return 'N/A'
      },

      /**
       * Find thing firmware info
       *
       * @returns {(Firmware|null)}
       */
      firmware() {
        return Firmware
          .query()
          .where('thing_id', this.thing.id)
          .first()
      },

      /**
       * Get thing firmware author
       *
       * @returns {String}
       */
      firmwareManufacturer() {
        if (this.firmware !== null && this._.get(this.firmware, 'manufacturer', null) !== null) {
          return this.firmware.manufacturer
        }

        return 'N/A'
      },

      /**
       * Get thing firmware version
       *
       * @returns {String}
       */
      firmwareVersion() {
        if (this.firmware !== null && this._.get(this.firmware, 'version', null) !== null) {
          return this.firmware.version
        }

        return 'N/A'
      },

    },

    mounted() {
      this.$emit('loaded')
    },

    methods: {

      /**
       * Close thing detail info window
       *
       * @param {Object} event
       */
      close(event) {
        event && event.preventDefault()

        this.$emit('close')
      },

    },

  }
</script>

<i18n src="./locales.json" />
