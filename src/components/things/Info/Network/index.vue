<template>
  <fb-modal-info
    :transparent-bg="transparentBg"
    icon="wifi"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.networkInfo') }}
    </template>

    <template slot="info">
      <div class="list-group">
        <span class="list-group-item">
          <span class="pull-right">{{ wifiSSID }}</span>
          {{ $t('texts.wifi.name') }}
        </span>
        <span class="list-group-item">
          <span class="pull-right">{{ wifiSignalStrength }}</span>
          {{ $t('texts.wifi.signalStrength') }}
        </span>
        <span class="list-group-item">
          <span class="pull-right">{{ wifiRSSI }}</span>
          {{ $t('texts.wifi.rssi') }}
        </span>
        <span class="list-group-item">
          <span class="pull-right">{{ networkConnection }}</span>
          {{ $t('texts.wifi.currentMode') }}
        </span>
        <span class="list-group-item">
          <span class="pull-right">{{ wifiIPAddress }}</span>
          {{ $t('texts.wifi.ip') }}
        </span>
        <span class="list-group-item">
          <span class="pull-right">{{ wifiMACAddress }}</span>
          {{ $t('texts.wifi.mac') }}
        </span>
      </div>
    </template>
  </fb-modal-info>
</template>

<script>
  import ThingProperty from '@/store/modules/io-server/ThingProperty'
  import Hardware from '@/store/modules/io-server/Hardware'

  export default {

    name: 'ThingsInfoNetwork',

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
       * Get thing network connection status
       *
       * @returns {String}
       */
      networkConnection() {
        return this.thing.state ? this.$t('states.connected.title') : this.$t('states.disconnected.title')
      },

      /**
       * Get thing network wifi SSID name
       *
       * @returns {String}
       */
      wifiSSID() {
        const stat = ThingProperty
          .query()
          .where('thing_id', this.thing.id)
          .where('name', 'ssid')
          .first()

        return stat !== null && stat.value !== null ? stat.value : 'N/A'
      },

      /**
       * Compute thing wifi signal strength
       *
       * @returns {String}
       */
      wifiSignalStrength() {
        const stat = ThingProperty
          .query()
          .where('thing_id', this.thing.id)
          .where('name', 'rssi')
          .first()

        if (stat !== null && stat.value !== null) {
          const strength = 2 * (parseFloat(stat.value) + 100)

          return `${(strength > 100 ? 100 : strength)} %`
        }

        return 'N/A'
      },

      /**
       * Compute thing wifi signal RSSI
       *
       * @returns {String}
       */
      wifiRSSI() {
        const stat = ThingProperty
          .query()
          .where('thing_id', this.thing.id)
          .where('name', 'rssi')
          .first()

        return stat !== null && stat.value !== null ? stat.value : 'N/A'
      },

      /**
       * Get thing network IP address
       *
       * @returns {String}
       */
      wifiIPAddress() {
        const property = ThingProperty
          .query()
          .where('thing_id', this.thing.id)
          .where('name', 'ip-address')
          .first()

        return property !== null && property.value !== null ? property.value : 'N/A'
      },

      /**
       * Get thing network MAC address
       *
       * @returns {String}
       */
      wifiMACAddress() {
        const hardware = Hardware
          .query()
          .where('thing_id', this.thing.id)
          .first()

        return hardware !== null && hardware.mac_address !== null ? hardware.mac_address : 'N/A'
      },

    },

    mounted() {
      this.$emit('loaded')
    },

    methods: {

      /**
       * Close thing network detail info window
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
