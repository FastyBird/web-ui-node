<template>
  <list-item
    :show-status="true"
    :status="thing.state"
    class="fb-iot-things-list-item__container"
    @click="oneClick"
  >
    <template slot="icon">
      <icon-with-child :primary-icon="$thingIcon(thing)" />
    </template>

    <template slot="heading">
      {{ $tThing(thing) }}
    </template>

    <template slot="sub-heading">
      {{ $tThingDevice(thing) }}
    </template>

    <template
      v-if="switchProperty || environmentProperty"
      slot="detail"
    >
      <switch-actor
        v-if="switchProperty"
        :thing="thing"
        :property="switchProperty"
      />

      <div v-else-if="environmentProperty">
        <template v-if="thing.state">
          <span class="fb-iot-things-list-item__value">{{ environmentPropertyValue }}</span>
          <span class="fb-iot-things-list-item__unit">{{ _.get(environmentProperty, 'unit', null) }}</span>
        </template>
        <template v-else>
          <span class="fb-iot-things-list-item__value">{{ $t('application.states.notAvailable') }}</span>
        </template>
      </div>
    </template>
  </list-item>
</template>

<script>
import { mapState } from 'vuex'

import number from '@/helpers/number'

import SwitchActor from '@/components/things/Actors/Switch'

export default {

  name: 'ThingsListItem',

  components: {
    SwitchActor,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  computed: {

    ...mapState('wamp', {
      exchangeConnected: state => state.isConnected,
    }),

    /**
     * Get switch property from channel
     *
     * @returns {(ChannelProperty|null)}
     */
    switchProperty() {
      const property = this._.first(this._.filter(this._.get(this.thing, 'channel.properties', []), 'isSwitch'))

      return typeof property !== 'undefined' ? property : null
    },

    /**
     * Get environment property from channel
     *
     * @returns {(ChannelProperty|null)}
     */
    environmentProperty() {
      if (this._.get(this.hardware, 'isManufacturerItead') && this._.get(this.hardware, 'model') === 'sonoff_sc') {
        const envProperty = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnvironment')
          .find(({ property }) => property === 'temperature')

        return typeof envProperty !== 'undefined' ? envProperty : null
      }

      return null
    },

    environmentPropertyValue() {
      const propertyValue = this.$store.getters['entities/channel_property_value/query']()
        .where('channel_id', this._.get(this.thing, 'channel.id', null))
        .where('property_id', this._.get(this.environmentProperty, 'id', null))
        .first()

      return propertyValue !== null ? number.format(parseFloat(propertyValue.value), 2, ',', ' ') : '-'
    },

    /**
     * Get thing hardware info
     *
     * @returns {(Hardware|null)}
     */
    hardware() {
      return this.$store.getters['entities/hardware/query']()
        .where('device_id', this.thing.device_id)
        .first()
    },

  },

  watch: {

    exchangeConnected() {
      this._subscribeSockets()
    },

  },

  beforeMount() {
    this._subscribeSockets()
  },

  beforeDestroy() {
    if (
      (this.switchProperty || this.environmentProperty) &&
      this.exchangeConnected
    ) {
      if (this.$route.path !== this.localePath({ name: this.$routes.things.detail, params: { id: this.thing.channel_id } })) {
        this.$store.dispatch('entities/device_socket/unsubscribe', {
          device_id: this.thing.device_id,
        }, {
          root: true,
        })
      }
    }
  },

  methods: {

    /**
     * Double click and single click event handler
     *
     * @param {Object} event
     */
    oneClick(event) {
      this.$emit('click', event, this.thing)
    },

    /**
     * If it is possible and necessary, connect thing to sockets
     *
     * @private
     */
    _subscribeSockets() {
      if (
        (this.switchProperty || this.environmentProperty) &&
        this.exchangeConnected
      ) {
        this.$store.dispatch('entities/device_socket/subscribe', {
          device_id: this.thing.device_id,
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
