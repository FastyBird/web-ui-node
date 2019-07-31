<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-energy__container"
  >
    <things-detail-channel-container
      v-if="hasSwitch"
      :channel="channel"
      class="fb-iot-things-detail-channel-energy__channel"
    >
      <div slot="channel">
        <things-detail-channel-switch :channel="channel" />
      </div>
    </things-detail-channel-container>

    <things-detail-channel-container
      :channel="channel"
      class="fb-iot-things-detail-channel-energy__channel"
    >
      <template slot="icon">
        <device-icon
          name="plug"
          class="fb-iot-things-detail-channel-energy__icon"
        />
      </template>

      <div
        slot="name"
        class="fb-iot-things-detail-channel-energy__heading"
      >
        <h5 class="fw-b m-y-0">
          {{ $t('channels.currentPower.title') }}
        </h5>
        <small>{{ channel.label }}</small>
      </div>

      <div
        slot="channel"
        class="fb-iot-things-detail-channel-energy__value-container"
      >
        <template v-if="thing.state">
          <span class="fb-iot-things-detail-channel-energy__value">{{ power }}</span>
          <span
            class="fb-iot-things-detail-channel-energy__units"
            v-html="propertyUnits('power')"
          />
        </template>
        <template v-else>
          <span class="fb-iot-things-detail-channel-energy__value">{{ $t('states.notAvailable.title') }}</span>
        </template>
      </div>
    </things-detail-channel-container>

    <things-detail-channel-container
      v-if="hasEnabled('current')"
      :channel="channel"
      class="fb-iot-things-detail-channel-energy__channel"
    >
      <template slot="icon">
        <device-icon
          name="bolt"
          class="fb-iot-things-detail-channel-energy__icon"
        />
      </template>

      <div
        slot="name"
        class="fb-iot-things-detail-channel-energy__heading"
      >
        <h5 class="fw-b m-y-0">
          {{ $t('channels.current.title') }}
        </h5>
        <small>{{ channel.label }}</small>
      </div>

      <div
        slot="channel"
        class="fb-iot-things-detail-channel-energy__value-container"
      >
        <template v-if="thing.state">
          <span class="fb-iot-things-detail-channel-energy__value">{{ current }}</span>
          <span
            class="fb-iot-things-detail-channel-energy__units"
            v-html="propertyUnits('current')"
          />
        </template>
        <template v-else>
          <span class="fb-iot-things-detail-channel-energy__value">{{ $t('states.notAvailable.title') }}</span>
        </template>
      </div>
    </things-detail-channel-container>

    <things-detail-channel-container
      v-if="hasEnabled('voltage')"
      :channel="channel"
      class="fb-iot-things-detail-channel-energy__channel"
    >
      <template slot="icon">
        <device-icon
          name="bolt"
          class="fb-iot-things-detail-channel-energy__icon"
        />
      </template>

      <div
        slot="name"
        class="fb-iot-things-detail-channel-energy__heading"
      >
        <h5 class="fw-b m-y-0">
          {{ $t('channels.voltage.title') }}
        </h5>
        <small>{{ channel.label }}</small>
      </div>

      <div
        slot="channel"
        class="fb-iot-things-detail-channel-energy__value-container"
      >
        <template v-if="thing.state">
          <span class="fb-iot-things-detail-channel-energy__value">{{ voltage }}</span>
          <span
            class="fb-iot-things-detail-channel-energy__units"
            v-html="propertyUnits('voltage')"
          />
        </template>
        <template v-else>
          <span class="fb-iot-things-detail-channel-energy__value">{{ $t('states.notAvailable.title') }}</span>
        </template>
      </div>
    </things-detail-channel-container>

    <things-detail-channel-container
      v-if="hasEnabled('totalConsumption')"
      :channel="channel"
      class="fb-iot-things-detail-channel-energy__channel"
    >
      <template slot="icon">
        <device-icon
          name="odometer"
          class="fb-iot-things-detail-channel-energy__icon"
        />
      </template>

      <div
        slot="name"
        class="fb-iot-things-detail-channel-energy__heading"
      >
        <h5 class="fw-b m-y-0">
          {{ $t('channels.totalConsumption.title') }}
        </h5>
        <small>{{ channel.label }}</small>
      </div>

      <div
        slot="channel"
        class="fb-iot-things-detail-channel-energy__value-container"
      >
        <template v-if="thing.state">
          <span class="fb-iot-things-detail-channel-energy__value">{{ totalConsumption }}</span>
          <span class="fb-iot-things-detail-channel-energy__units">
            {{ $t('application.units.short.energy.kilowatt_hours') }}
          </span>
        </template>
        <template v-else>
          <span class="fb-iot-things-detail-channel-energy__value">{{ $t('states.notAvailable.title') }}</span>
        </template>

        <fb-button
          v-if="thing.state && hasEnabled('resetTotal')"
          block
          variant="outline-primary"
          size="xs"
          class="cursor-pointer circle"
          @click.prevent="showClearTotal()"
        >
          <font-awesome-icon icon="sync-alt" />
        </fb-button>
      </div>
    </things-detail-channel-container>

    <fb-confirmation-window
      v-if="clearTotal.show"
      icon="trash"
      @confirmed="processClearTotal"
      @close="clearTotal.show = false"
    >
      <template slot="header">
        {{ $t('headings.clearTotal') }}
      </template>

      <template slot="question">
        <i18n
          path="messages.confirmClearTotal"
          tag="p"
        >
          <strong place="thing">{{ thing.label }}</strong>
        </i18n>
      </template>
    </fb-confirmation-window>
  </div>
</template>

<script>
  import convert from 'convert-units'
  import number from '@/helpers/number'

  const ThingsDetailChannelSwitch = () => import('../SwitchActor')
  const ThingsDetailChannelContainer = () => import('../../ChannelContainer')

  import {
    PROPERTY_TYPE_STATE,
  } from '@/constants'
  import ChannelPropertyValue from '@/store/modules/io-server/ChannelPropertyValue'

  export default {

    name: 'ThingsDetailChannelEnergy',

    components: {
      ThingsDetailChannelContainer,
      ThingsDetailChannelSwitch,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        hasSwitch: this._.find(this.channel.properties, { 'property': PROPERTY_TYPE_STATE }) !== undefined,
        clearTotal: {
          show: false,
        },
      }
    },

    computed: {

      /**
       * Get thing current power consumption
       *
       * @returns {String}
       */
      power() {
        const property = this._.find(this.channel.properties, { 'property': 'power' })

        if (property !== undefined) {
          const propertyValue = ChannelPropertyValue
            .query()
            .where('channel_id', this.channel.id)
            .where('property_id', property.id)
            .first()

          return propertyValue !== null ? number.format(parseFloat(propertyValue.value), 2, ',', ' ') : false
        }

        return '-'
      },

      /**
       * Get thing current current
       *
       * @returns {String}
       */
      current() {
        const property = this._.find(this.channel.properties, { 'property': 'current' })

        if (property !== undefined) {
          const propertyValue = ChannelPropertyValue
            .query()
            .where('channel_id', this.channel.id)
            .where('property_id', property.id)
            .first()

          return propertyValue !== null ? number.format(parseFloat(propertyValue.value), 2, ',', ' ') : false
        }

        return '-'
      },

      /**
       * Get thing current voltage
       *
       * @returns {String}
       */
      voltage() {
        const property = this._.find(this.channel.properties, { 'property': 'voltage' })

        if (property !== undefined) {
          const propertyValue = ChannelPropertyValue
            .query()
            .where('channel_id', this.channel.id)
            .where('property_id', property.id)
            .first()

          return propertyValue !== null ? number.format(parseFloat(propertyValue.value), 2, ',', ' ') : false
        }

        return '-'
      },

      /**
       * Get thing total consumption from power up
       *
       * @returns {String}
       */
      totalConsumption() {
        const property = this._.find(this.channel.properties, { 'property': 'energy' })

        if (property !== undefined) {
          const propertyValue = ChannelPropertyValue
            .query()
            .where('channel_id', this.channel.id)
            .where('property_id', property.id)
            .first()

          if (propertyValue !== null) {
            return number
              .format(convert(parseFloat(propertyValue.value))
                .from(this.$t(`application.units.short.energy.${this._.get(property, 'units', 'joule')}`))
                .to('kWh'), 2, ',', ' ')
          }
        }

        return '-'
      },

    },

    methods: {

      /**
       * Get units for selected sub-channel
       *
       * @param {String} type
       *
       * @returns {(String|null)}
       */
      propertyUnits(type) {
        const property = this._.find(this.channel.properties, { 'property': type })

        if (property === undefined) {
          return null
        }

        switch (type) {
          case 'power':
            return this.$t(`application.units.short.power.${this._.get(property, 'units', 'watt')}`)

          case 'current':
            return this.$t(`application.units.short.current.${this._.get(property, 'units', 'ampere')}`)

          case 'voltage':
            return this.$t(`application.units.short.voltage.${this._.get(property, 'units', 'volt')}`)
        }

        return null
      },

      /**
       * Check if energy meter parameter is enabled
       *
       * @param {String} parameter
       *
       * @returns {Boolean}
       */
      hasEnabled(parameter) {
        switch (parameter) {
          case 'current':
            return this._.find(this.channel.properties, { 'property': 'current' }) !== undefined

          case 'voltage':
            return this._.find(this.channel.properties, { 'property': 'voltage' }) !== undefined

          case 'totalConsumption':
            return this._.find(this.channel.properties, { 'property': 'energy' }) !== undefined

          case 'resetTotal':
            const property = this._.find(this.channel.properties, { 'property': 'energy' })

            return property !== undefined && property.is_settable
        }

        return false
      },

      /**
       * Show reset total consumption confirmation window
       */
      showClearTotal() {
        if (this.hasEnabled('resetTotal') === false) {
          this.$toasted.error(this.$t('things.messages.notSupported', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        // Check if thing is connected to cloud
        if (this.state !== true) {
          this.$toasted.error(this.$t('things.messages.notOnline', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        this.clearTotal.show = true
      },

      /**
       * Process resetting of total consumption counter
       */
      processClearTotal() {
        const that = this

        this.clearTotal.show = false

        if (this.hasEnabled('resetTotal') === false) {
          this.$toasted.error(this.$t('things.messages.notSupported', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        // Check if thing is connected to cloud
        if (this.state !== true) {
          this.$toasted.error(this.$t('things.messages.notOnline', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        this.sendCommand({
          thingId: this.thing.id,
          channelId: this.channel.id,
          payload: 0.0,
        })
          .catch(() => {
            that.$toasted.error(that.$t('things.messages.commandNotAccepted', {
              thing: this.thing.label,
            }), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })
          })
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
